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
import com.farmapp.farmsmartmanagement.modules.subscription.service.FarmSubscriptionService;
import com.farmapp.farmsmartmanagement.modules.subscription.service.SubscriptionPlanService;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SepayService {

    SepayProperties sepayProperties;
    SubscriptionPlanRepository subscriptionPlanRepository;
    FarmSubscriptionRepository farmSubscriptionRepository;
    PaymentTransactionRepository paymentTransactionRepository;
    FarmRepository farmRepository;
    UserRepository userRepository;
    SecurityUtils securityUtils;

    FarmSubscriptionService farmSubscriptionService;

    EntityManager entityManager;

    private static final String ORDER_CODE_PREFIX = "FSM";
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(FSM\\d+)");

    // ─────────────────────────────────────────────────────────────────
    //  Tạo link thanh toán SePay
    // ─────────────────────────────────────────────────────────────────


    // Get FaSub hiện tại ()
    @Transactional
    public CreatePaymentResponse createPayment(UUID userId, UUID farmId, CreatePaymentRequest request) {

        log.info("========== CREATE PAYMENT START ==========");
        log.info("[REQUEST] subscriptionPlanId={} billingCycle={}",
                request.getSubscriptionPlanId(), request.getBillingCycle());
        log.info("[SECURITY] userId={} farmId={}", userId, farmId);

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        if (request.getSubscriptionPlanId() == null) {
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND);
        }

        SubscriptionPlanEntity plan = subscriptionPlanRepository
                .findById(request.getSubscriptionPlanId())
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        log.info("[PLAN] name={} monthly={} annual={}",
                plan.getName(), plan.getPriceMonthly(), plan.getPriceAnnual());

        BigDecimal amount = request.getBillingCycle() == BillingCycle.ANNUAL
                ? plan.getPriceAnnual()
                : plan.getPriceMonthly();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        // Lấy gói hiện tại — farm nào cũng phải có ít nhất FREE
        FarmSubscriptionEntity currentSubscription = farmSubscriptionRepository
                .findByFarmAndIsCurrent(farm, true)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_SUBSCRIPTION_NOT_FOUND));

        log.info("[SUBSCRIPTION] currentSubscription id={} plan={}",
                currentSubscription.getId(),
                currentSubscription.getSubscriptionPlan().getName());

        String orderCode = ORDER_CODE_PREFIX + System.currentTimeMillis();

        PaymentTransactionEntity txn = paymentTransactionRepository.save(
                PaymentTransactionEntity.builder()
                        .farm(farm)
                        .user(user)
                        .subscriptionPlan(plan)
                        .farmSubscription(currentSubscription) // gói HIỆN TẠI, không phải stub
                        .billingCycle(request.getBillingCycle()) // lưu billingCycle vào txn
                        .amount(amount)
                        .currency("VND")
                        .gateway(PaymentGateway.SEPAY)
                        .status(PaymentStatus.PENDING)
                        .orderCode(orderCode)
                        .build()
        );

        log.info("[PAYMENT] txn id={} orderCode={} amount={}", txn.getId(), orderCode, amount);

        String baseUrl    = sepayProperties.getReturnUrl();
        String successUrl = baseUrl + "?order=" + orderCode;
        String errorUrl   = baseUrl + "?order="   + orderCode;
        String cancelUrl  = baseUrl + "?order="  + orderCode;
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

        if (orderCode == null) {
            log.warn("[SePay IPN] Missing order_invoice_number");
            return;
        }

        log.info("[IPN] orderCode={} paidAmount={}", orderCode, paidAmount);

        PaymentTransactionEntity txn = paymentTransactionRepository
                .findByOrderCode(orderCode)
                .orElse(null);

        if (txn == null) {
            // Tiền về nhưng không tìm thấy order → cần xử lý thủ công
            log.error("[SePay IPN] UNMATCHED PAYMENT: orderCode={} amount={} — cần xử lý thủ công!",
                    orderCode, paidAmount);
            return;
        }

        log.info("[IPN] txn={} status={} expiredAt={}", txn.getId(), txn.getStatus(), txn.getExpiredAt());

        // Idempotent — IPN có thể gọi nhiều lần
        if (txn.getStatus() == PaymentStatus.SUCCESS) {
            log.info("[SePay IPN] Already SUCCESS, skip. orderCode={}", orderCode);
            return;
        }

        // Thanh toán muộn — tiền đã về, không kích hoạt, cần hoàn thủ công
        if (txn.getExpiredAt() != null && LocalDateTime.now().isAfter(txn.getExpiredAt())) {
            log.error("[SePay IPN] LATE PAYMENT: orderCode={} amount={} expiredAt={} — cần hoàn tiền thủ công!",
                    orderCode, paidAmount, txn.getExpiredAt());
            txn.setStatus(PaymentStatus.LATE_PAYMENT);
            txn.setPaidAmount(paidAmount);
            txn.setPaidAt(LocalDateTime.now());
            txn.setGatewayResponseMessage("Late payment — manual refund required");
            paymentTransactionRepository.save(txn);
            return;
        }

        // Thanh toán thiếu — tiền đã về, không kích hoạt, cần hoàn thủ công
        if (paidAmount != null && paidAmount.compareTo(txn.getAmount()) < 0) {
            log.error("[SePay IPN] PARTIAL PAYMENT: orderCode={} expected={} received={} — cần hoàn tiền thủ công!",
                    orderCode, txn.getAmount(), paidAmount);
            txn.setStatus(PaymentStatus.PARTIAL_PAYMENT);
            txn.setPaidAmount(paidAmount);
            txn.setPaidAt(LocalDateTime.now());
            txn.setGatewayResponseMessage("Partial payment — manual refund required");
            paymentTransactionRepository.save(txn);
            return;
        }

        // Thanh toán thừa — vẫn kích hoạt, log để hoàn tiền thừa
        if (paidAmount != null && paidAmount.compareTo(txn.getAmount()) > 0) {
            log.warn("[SePay IPN] OVERPAYMENT: orderCode={} expected={} received={} surplus={}",
                    orderCode, txn.getAmount(), paidAmount,
                    paidAmount.subtract(txn.getAmount()));
            // TODO: alert admin hoàn tiền thừa
        }

        // Happy path
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

        farmSubscriptionService.activateSubscription(txn);
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