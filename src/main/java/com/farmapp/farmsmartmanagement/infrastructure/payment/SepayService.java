package com.farmapp.farmsmartmanagement.infrastructure.payment;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.config.app.SepayProperties;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentGateway;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PaymentTransactionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmSubscriptionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PaymentTransactionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.UserRepository;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.CreatePaymentRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.SepayIpnRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.CreatePaymentResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayService {

    private final SepayProperties sepayProperties;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final FarmSubscriptionRepository farmSubscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    private final EntityManager entityManager;

    private static final String ORDER_CODE_PREFIX = "FSM";
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(FSM\\d+)");

    // ─────────────────────────────────────────────────────────────────
    //  Tạo link thanh toán SePay
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) {

        log.info("========== CREATE PAYMENT START ==========");

        // 🔥 Log request raw
        log.info("[REQUEST] full = {}", request);
        log.info("[REQUEST] subscriptionPlanId = {}", request.getSubscriptionPlanId());
        log.info("[REQUEST] billingCycle = {}", request.getBillingCycle());

        UUID userId = securityUtils.getCurrentUserId();
        UUID farmId = securityUtils.getCurrentFarmId();

        log.info("[SECURITY] userId = {}", userId);
        log.info("[SECURITY] farmId = {}", farmId);

        var user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("[ERROR] User not found: {}", userId);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });

        var farm = farmRepository.findById(farmId)
                .orElseThrow(() -> {
                    log.error("[ERROR] Farm not found: {}", farmId);
                    return new AppException(ErrorCode.FARM_NOT_FOUND);
                });

        // 🔥 Check null trước khi query DB
        if (request.getSubscriptionPlanId() == null) {
            log.error("[ERROR] subscriptionPlanId is NULL → request mapping failed");
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND);
        }

        log.info("[DB] Finding plan with id = {}", request.getSubscriptionPlanId());

        SubscriptionPlanEntity plan = subscriptionPlanRepository
                .findById(request.getSubscriptionPlanId())
                .orElseThrow(() -> {
                    log.error("[ERROR] Subscription plan NOT FOUND with id = {}", request.getSubscriptionPlanId());
                    return new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND);
                });

        log.info("[PLAN] Found plan = {} | monthly={} | annual={}",
                plan.getName(), plan.getPriceMonthly(), plan.getPriceAnnual());

        BigDecimal amount = request.getBillingCycle() == BillingCycle.ANNUAL
                ? plan.getPriceAnnual()
                : plan.getPriceMonthly();

        log.info("[PAYMENT] Calculated amount = {}", amount);

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("[ERROR] Invalid amount = {}", amount);
            throw new AppException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        FarmSubscriptionEntity farmSubscription = farmSubscriptionRepository
                .findByFarmAndIsCurrent(farm, true)
                .orElseGet(() -> {
                    log.warn("[SUBSCRIPTION] No current subscription → creating new stub");

                    return farmSubscriptionRepository.save(
                            FarmSubscriptionEntity.builder()
                                    .farm(farm)
                                    .plan(plan)
                                    .billingCycle(request.getBillingCycle())
                                    .isCurrent(false)
                                    .build()
                    );
                });

        log.info("[SUBSCRIPTION] Using subscription id = {}", farmSubscription.getId());

        String orderCode = ORDER_CODE_PREFIX + System.currentTimeMillis();

        // Lưu transaction
        PaymentTransactionEntity txn = paymentTransactionRepository.save(
                PaymentTransactionEntity.builder()
                        .farm(farm)
                        .user(user)
                        .subscriptionPlan(plan)
                        .farmSubscription(farmSubscription)
                        .amount(amount).currency("VND")
                        .gateway(PaymentGateway.SEPAY)
                        .status(PaymentStatus.PENDING)
                        .orderCode(orderCode)
                        .build()
        );

        // Build form data
        String baseUrl   = sepayProperties.getReturnUrl();
        String successUrl = baseUrl + "/success?order=" + orderCode;
        String errorUrl   = baseUrl + "/error?order=" + orderCode;
        String cancelUrl  = baseUrl + "/cancel?order=" + orderCode;
        String amountStr  = amount.toBigInteger().toString();
        String description = "Thanh toan don hang " + orderCode;

        String signature = buildSignature(
                amountStr,
                sepayProperties.getMerchantCode(),
                "VND", "PURCHASE",
                description, orderCode,
                successUrl, errorUrl, cancelUrl
        );

        log.info("[SePay] orderCode={} signature={}", orderCode, signature);

        return CreatePaymentResponse.builder()
                .transactionId(txn.getId())
                .orderCode(orderCode)
                .amount(amountStr)
                .currency("VND")
                .status(PaymentStatus.PENDING.name())
                .expiredAt(txn.getExpiredAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .formData(CreatePaymentResponse.SepayFormData.builder()
                        .actionUrl(sepayProperties.getPaymentUrl())
                        .orderAmount(amountStr)
                        .merchant(sepayProperties.getMerchantCode())
                        .currency("VND")
                        .operation("PURCHASE")
                        .orderDescription(description)
                        .orderInvoiceNumber(orderCode)
                        .successUrl(successUrl)
                        .errorUrl(errorUrl)
                        .cancelUrl(cancelUrl)
                        .signature(signature)
                        .build())
                .build();
    }
    // ─────────────────────────────────────────────────────────────────
    //  Xử lý IPN từ SePay
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void handleIpn(SepayIpnRequest ipn) {
        entityManager.createNativeQuery("SET LOCAL app.bypass_rls = 'true'").executeUpdate();

        log.info("[SePay IPN] notification_type={} order={}",
                ipn.getNotificationType(),
                ipn.getOrder() != null ? ipn.getOrder().getOrderInvoiceNumber() : "null");

        // Chỉ xử lý ORDER_PAID
        if (!"ORDER_PAID".equals(ipn.getNotificationType())) {
            log.info("[SePay IPN] Skipping notification_type={}", ipn.getNotificationType());
            return;
        }

        if (ipn.getOrder() == null) {
            log.warn("[SePay IPN] Missing order data");
            return;
        }

        String orderCode = ipn.getOrder().getOrderInvoiceNumber();
        BigDecimal paidAmount = ipn.getOrder().getOrderAmount();
        log.info("[IPN] Searching orderCode='{}' length={}", orderCode, orderCode.length());
        log.info("[IPN] orderCode={} paidAmount={}", orderCode, paidAmount);

        if (orderCode == null) {
            log.warn("[SePay IPN] Missing order_invoice_number");
            return;
        }

        PaymentTransactionEntity txn = paymentTransactionRepository
                .findByOrderCode(orderCode)
                .orElse(null);
        log.info("[IPN] txn={}", txn != null ? txn.getId() + " status=" + txn.getStatus() : "NOT FOUND");

        if (txn == null) {
            log.warn("[SePay IPN] Transaction not found for orderCode={}", orderCode);
            log.warn("[IPN] Transaction not found. All recent orders:");
            paymentTransactionRepository.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .limit(5)
                    .forEach(t -> log.warn("  → id={} orderCode='{}' status={}",
                            t.getId(), t.getOrderCode(), t.getStatus()));
            return;
        }

        log.info("[IPN] expiredAt={} now={}", txn.getExpiredAt(), LocalDateTime.now());
        if (txn.getStatus() == PaymentStatus.SUCCESS) {
            log.info("[SePay IPN] Already SUCCESS, skip. orderCode={}", orderCode);
            return;
        }

        if (txn.getExpiredAt() != null && LocalDateTime.now().isAfter(txn.getExpiredAt())) {
            log.warn("[SePay IPN] Transaction expired. orderCode={}", orderCode);
            txn.setStatus(PaymentStatus.FAILED);
            txn.setGatewayResponseMessage("Transaction expired");
            paymentTransactionRepository.save(txn);
            return;
        }

        if (paidAmount != null && paidAmount.compareTo(txn.getAmount()) < 0) {
            log.warn("[SePay IPN] Amount mismatch: expected={} received={}", txn.getAmount(), paidAmount);
            txn.setStatus(PaymentStatus.FAILED);
            txn.setGatewayResponseMessage("Amount mismatch");
            paymentTransactionRepository.save(txn);
            return;
        }

        txn.setStatus(PaymentStatus.SUCCESS);
        txn.setPaidAt(LocalDateTime.now());
        txn.setPaidAmount(paidAmount);
        if (ipn.getTransaction() != null) {
            txn.setGatewayTxnId(ipn.getTransaction().getTransactionId());
        }
        txn.setGatewayResponseCode("00");
        txn.setGatewayResponseMessage("Success");
        paymentTransactionRepository.save(txn);

        log.info("[SePay IPN] Payment SUCCESS txn={} orderCode={}", txn.getId(), orderCode);

//        activateSubscription(txn);
    }

    // ─────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────


    private String buildSignature(String orderAmount, String merchant,
                                  String currency, String operation,
                                  String orderDescription, String orderInvoiceNumber,
                                  String successUrl, String errorUrl, String cancelUrl) {
        // Thứ tự field theo đúng docs SePay — KHÔNG được đổi thứ tự
        List<String> parts = new ArrayList<>();
        parts.add("order_amount=" + orderAmount);
        parts.add("merchant=" + merchant);
        parts.add("currency=" + currency);
        parts.add("operation=" + operation);
        parts.add("order_description=" + orderDescription);
        parts.add("order_invoice_number=" + orderInvoiceNumber);
        parts.add("success_url=" + successUrl);
        parts.add("error_url=" + errorUrl);
        parts.add("cancel_url=" + cancelUrl);

        String signedString = String.join(",", parts);
        log.info("[SePay] signedString = {}", signedString);

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    sepayProperties.getSecretKey().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));
            byte[] hash = mac.doFinal(signedString.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Cannot build SePay signature", e);
        }
    }

    private String buildHmacSha256Base64(String secret, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return java.util.Base64.getEncoder().encodeToString(hash);
    }

//    private boolean isValidSignature(SepayIpnRequest ipn) {
//        try {
//            String secret = sepayProperties.getSecretKey();
//            if (secret == null || secret.isBlank()) {
//                log.warn("[SePay IPN] ipnSecretKey not configured — skipping signature check");
//                return true;
//            }
//            String expected = hmacSha256(secret, ipn.getContent());
//            return expected.equalsIgnoreCase(ipn.getApiKey());
//        } catch (Exception e) {
//            log.error("[SePay IPN] Signature validation error", e);
//            return false;
//        }
//    }

    private String hmacSha256(String secret, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(
                mac.doFinal((data == null ? "" : data).getBytes(StandardCharsets.UTF_8)));
    }

    private String extractOrderCode(String content) {
        if (content == null) return null;
        Matcher m = ORDER_CODE_PATTERN.matcher(content);
        return m.find() ? m.group(1) : null;
    }
}