package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import com.farmapp.farmsmartmanagement.domain.enums.BillingCycle;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentGateway;
import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransactionEntity {

    @Id
    @GeneratedValue
    @UuidGenerator

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private FarmEntity farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_plan_id", nullable = false)
    private SubscriptionPlanEntity subscriptionPlan;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "billing_cycle")
    private BillingCycle billingCycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_subscription_id", nullable = false)
    private FarmSubscriptionEntity farmSubscription;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3, nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "payment_gateway")
    private PaymentGateway gateway;

    @Column(name = "gateway_txn_id", length = 255)
    private String gatewayTxnId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Columns added in V4 ──────────────────────────────────────

    /** Mã đơn hàng nội bộ — duy nhất, gửi sang VNPay làm vnp_TxnRef */
    @Column(name = "order_code", unique = true, length = 100)
    private String orderCode;

    /** Mã phản hồi từ VNPay (vnp_ResponseCode / vnp_TransactionStatus) */
    @Column(name = "gateway_response_code", length = 10)
    private String gatewayResponseCode;

    /** Thông điệp phản hồi từ VNPay */
    @Column(name = "gateway_response_message")
    private String gatewayResponseMessage;

    /** Mã ngân hàng (vnp_BankCode) */
    @Column(name = "bank_code", length = 20)
    private String bankCode;

    /** Số tiền thực tế đã thanh toán từ VNPay (vnp_Amount / 100) */
    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount;

    /** Toàn bộ raw params từ VNPay callback lưu để audit */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response", columnDefinition = "jsonb")
    private Map<String, String> rawResponse;

    /** Thời điểm link thanh toán hết hạn */
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @PrePersist
    protected void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "VND";
        if (this.expiredAt == null) this.expiredAt = LocalDateTime.now().plusMinutes(15);
    }
}