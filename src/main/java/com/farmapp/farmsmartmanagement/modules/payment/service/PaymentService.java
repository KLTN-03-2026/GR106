package com.farmapp.farmsmartmanagement.modules.payment.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentGateway;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import com.farmapp.farmsmartmanagement.domain.enums.SubscriptionStatus;
import com.farmapp.farmsmartmanagement.infrastructure.payment.vnpay.OrderCodeGenerator;
import com.farmapp.farmsmartmanagement.infrastructure.payment.vnpay.VNPayUtil;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmSubscriptionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PaymentTransactionEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmSubscriptionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.PaymentTransactionRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.farmapp.farmsmartmanagement.modules.payment.dto.request.CreatePaymentRequest;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.CreatePaymentResponse;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.PaymentTransactionResponse;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.VNPayCallbackResult;
import com.farmapp.farmsmartmanagement.modules.payment.mapper.PaymentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentRepo;
    private final SubscriptionPlanRepository   planRepo;
    private final FarmSubscriptionRepository   subscriptionRepo;
    private final OrderCodeGenerator           orderCodeGen;
    private final VNPayUtil                    vnPayUtil;
    private final PaymentMapper                paymentMapper;
    private final SubscriptionActivationService activationService;

    // ─── 1. Tạo payment link ──────────────────────────────────────

    /**
     * Tạo giao dịch PENDING và trả về URL redirect sang VNPay.
     *
     * @param farmId    farm đang thanh toán
     * @param userId    user thực hiện thanh toán
     * @param request   thông tin gói + chu kỳ
     * @param ipAddress IP của request
     */
    @Transactional
    public CreatePaymentResponse createVNPayPayment(UUID farmId,
                                                    UUID userId,
                                                    CreatePaymentRequest request,
                                                    String ipAddress) {
        // 1. Load subscription plan
        SubscriptionPlanEntity plan = planRepo.findById(request.getSubscriptionPlanId())
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        if (!plan.getIsActive()) {
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND);
        }

        // 2. Tính số tiền
        BigDecimal amount = resolveAmount(plan, request.getBillingCycle());

        // 3. Sinh order code duy nhất
        String orderCode = generateUniqueOrderCode();

        // 4. Tạo giao dịch PENDING
        LocalDateTime now = LocalDateTime.now();
        PaymentTransactionEntity txn = PaymentTransactionEntity.builder()
                .farmId(farmId)
                .userId(userId)
                .subscriptionPlanId(plan.getId())
                .amount(amount)
                .currency("VND")
                .gateway(PaymentGateway.VNPAY)
                .status(PaymentStatus.PENDING)
                .orderCode(orderCode)
                .expiredAt(now.plusMinutes(15))
                .build();

        paymentRepo.save(txn);

        // 5. Build VNPay URL
        String orderInfo = "Thanh toan goi " + plan.getName()
                + " - " + request.getBillingCycle().name();

        String paymentUrl = vnPayUtil.buildPaymentUrl(
                orderCode,
                amount.longValue(),
                orderInfo,
                ipAddress,
                request.getBankCode()
        );

        log.info("[Payment] Created PENDING txn orderCode={} farmId={} amount={}",
                orderCode, farmId, amount);

        return CreatePaymentResponse.builder()
                .transactionId(txn.getId())
                .paymentUrl(paymentUrl)
                .orderCode(orderCode)
                .amount(amount)
                .expiredAt(txn.getExpiredAt())
                .build();
    }

    // ─── 2. Xử lý IPN từ VNPay (server-to-server) ────────────────

    /**
     * VNPay gọi endpoint này sau khi giao dịch hoàn tất.
     * Trả về chuỗi JSON theo spec VNPay: {"RspCode":"00","Message":"Confirm Success"}
     */
    @Transactional
    public String handleVNPayIPN(Map<String, String> params) {
        VNPayCallbackResult result = parseVNPayCallback(params);

        if (!result.isSignatureValid()) {
            log.warn("[IPN] Invalid signature for params={}", params);
            return vnpayIpnResponse("97", "Invalid Checksum");
        }

        PaymentTransactionEntity txn = paymentRepo
                .findByOrderCode(result.getOrderCode())
                .orElse(null);

        if (txn == null) {
            log.warn("[IPN] Order not found: orderCode={}", result.getOrderCode());
            return vnpayIpnResponse("01", "Order not found");
        }

        // Idempotent: đã xử lý rồi thì trả về success
        if (txn.getStatus() != PaymentStatus.PENDING) {
            log.info("[IPN] Already processed orderCode={} status={}", result.getOrderCode(), txn.getStatus());
            return vnpayIpnResponse("02", "Order already confirmed");
        }

        // Verify số tiền
        BigDecimal expectedAmount = txn.getAmount();
        if (result.getAmount() != null
                && result.getAmount().compareTo(expectedAmount) != 0) {
            log.error("[IPN] Amount mismatch orderCode={} expected={} got={}",
                    result.getOrderCode(), expectedAmount, result.getAmount());
            updateTransactionFailed(txn, result, "Amount mismatch");
            return vnpayIpnResponse("04", "Invalid Amount");
        }

        // Xử lý kết quả
        if ("00".equals(result.getResponseCode()) && "00".equals(result.getTransactionStatus())) {
            processPaymentSuccess(txn, result);
            return vnpayIpnResponse("00", "Confirm Success");
        } else {
            updateTransactionFailed(txn, result, "Payment failed by gateway");
            return vnpayIpnResponse("00", "Confirm Success"); // VNPay vẫn cần 00 để ack
        }
    }

    // ─── 3. Xử lý Return URL (browser redirect) ──────────────────

    /**
     * Xử lý sau khi user được redirect về từ VNPay.
     * Trả về kết quả để FE hiển thị success/failure page.
     */
    @Transactional
    public PaymentTransactionResponse handleVNPayReturn(Map<String, String> params) {
        VNPayCallbackResult result = parseVNPayCallback(params);

        if (!result.isSignatureValid()) {
            throw new AppException(ErrorCode.PAYMENT_INVALID_SIGNATURE);
        }

        PaymentTransactionEntity txn = paymentRepo
                .findByOrderCode(result.getOrderCode())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        // Nếu IPN đã xử lý trước thì chỉ return current state
        if (txn.getStatus() != PaymentStatus.PENDING) {
            return paymentMapper.toResponse(txn);
        }

        // IPN chưa đến → xử lý tại đây (fallback)
        if ("00".equals(result.getResponseCode())) {
            processPaymentSuccess(txn, result);
        } else {
            updateTransactionFailed(txn, result, "Payment cancelled or failed");
        }

        return paymentMapper.toResponse(txn);
    }

    // ─── 4. Query trạng thái giao dịch ───────────────────────────

    @Transactional(readOnly = true)
    public PaymentTransactionResponse getByOrderCode(String orderCode, UUID farmId) {
        PaymentTransactionEntity txn = paymentRepo.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!txn.getFarmId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return paymentMapper.toResponse(txn);
    }

    @Transactional(readOnly = true)
    public Page<PaymentTransactionResponse> getHistory(UUID farmId, Pageable pageable) {
        return paymentRepo
                .findByFarmIdOrderByCreatedAtDesc(farmId, pageable)
                .map(paymentMapper::toResponse);
    }

    // ─── Internal helpers ─────────────────────────────────────────

    /**
     * Xử lý khi thanh toán thành công:
     *  1. Cập nhật giao dịch → SUCCESS
     *  2. Kích hoạt / gia hạn subscription
     */
    private void processPaymentSuccess(PaymentTransactionEntity txn,
                                       VNPayCallbackResult result) {
        txn.setStatus(PaymentStatus.SUCCESS);
        txn.setPaidAt(LocalDateTime.now());
        txn.setGatewayTxnId(result.getGatewayTxnId());
        txn.setGatewayResponseCode(result.getResponseCode());
        txn.setGatewayResponseMessage("Payment successful");
        txn.setBankCode(result.getBankCode());
        txn.setPaidAmount(result.getAmount());
        txn.setRawResponse(result.getRawParams());
        paymentRepo.save(txn);

        // Kích hoạt subscription
        try {
            FarmSubscriptionEntity subscription = activationService.activateSubscription(txn);
            txn.setFarmSubscriptionId(subscription.getId());
            paymentRepo.save(txn);
            log.info("[Payment] SUCCESS orderCode={} farmId={} subscriptionId={}",
                    txn.getOrderCode(), txn.getFarmId(), subscription.getId());
        } catch (Exception e) {
            log.error("[Payment] Subscription activation failed for orderCode={}",
                    txn.getOrderCode(), e);
            // Giao dịch vẫn SUCCESS, activation lỗi cần alert manual
        }
    }

    private void updateTransactionFailed(PaymentTransactionEntity txn,
                                         VNPayCallbackResult result,
                                         String reason) {
        txn.setStatus(PaymentStatus.FAILED);
        txn.setGatewayResponseCode(result.getResponseCode());
        txn.setGatewayResponseMessage(reason);
        if (result.getRawParams() != null) txn.setRawResponse(result.getRawParams());
        paymentRepo.save(txn);
        log.info("[Payment] FAILED orderCode={} reason={}", txn.getOrderCode(), reason);
    }

    private VNPayCallbackResult parseVNPayCallback(Map<String, String> params) {
        if (!vnPayUtil.verifySignature(params)) {
            return VNPayCallbackResult.invalidSignature();
        }

        String amountStr = params.get("vnp_Amount");
        BigDecimal amount = null;
        if (amountStr != null) {
            // VNPay trả về x100
            amount = new BigDecimal(amountStr).divide(BigDecimal.valueOf(100));
        }

        return VNPayCallbackResult.builder()
                .signatureValid(true)
                .success("00".equals(params.get("vnp_ResponseCode")))
                .orderCode(params.get("vnp_TxnRef"))
                .gatewayTxnId(params.get("vnp_TransactionNo"))
                .responseCode(params.get("vnp_ResponseCode"))
                .transactionStatus(params.get("vnp_TransactionStatus"))
                .bankCode(params.get("vnp_BankCode"))
                .amount(amount)
                .rawParams(params)
                .build();
    }

    private BigDecimal resolveAmount(SubscriptionPlanEntity plan, BillingCycle cycle) {
        return switch (cycle) {
            case MONTHLY -> plan.getPriceMonthly();
            case ANNUAL  -> plan.getPriceAnnual() != null
                    ? plan.getPriceAnnual()
                    : plan.getPriceMonthly().multiply(BigDecimal.valueOf(12));
        };
    }

    private String generateUniqueOrderCode() {
        String code;
        int attempts = 0;
        do {
            code = orderCodeGen.generate();
            if (++attempts > 10) throw new RuntimeException("Cannot generate unique order code");
        } while (paymentRepo.existsByOrderCode(code));
        return code;
    }

    private String vnpayIpnResponse(String code, String message) {
        return "{\"RspCode\":\"" + code + "\",\"Message\":\"" + message + "\"}";
    }
}