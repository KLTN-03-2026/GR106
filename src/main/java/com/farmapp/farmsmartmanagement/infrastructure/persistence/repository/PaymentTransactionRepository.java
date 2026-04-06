package com.farmapp.farmsmartmanagement.infrastructure.persistence.repository;

import com.farmapp.farmsmartmanagement.domain.enums.PaymentStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PaymentTransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransactionEntity, UUID> {

    Optional<PaymentTransactionEntity> findByOrderCode(String orderCode);

    Optional<PaymentTransactionEntity> findByGatewayTxnId(String gatewayTxnId);

    Optional<PaymentTransactionEntity> findByOrderCodeAndStatus(String orderCode, PaymentStatus status);

    Page<PaymentTransactionEntity> findByFarmIdOrderByCreatedAtDesc(UUID farmId, Pageable pageable);

    List<PaymentTransactionEntity> findByFarmIdAndStatus(UUID farmId, PaymentStatus status);

    /** Lấy các giao dịch PENDING đã quá hạn để job định kỳ expire */
    @Query("""
        SELECT p FROM PaymentTransactionEntity p
        WHERE p.status = 'PENDING'
          AND p.expiredAt < :now
    """)
    List<PaymentTransactionEntity> findExpiredPendingTransactions(@Param("now") LocalDateTime now);

    /** Expire hàng loạt các giao dịch quá hạn */
    @Modifying
    @Query("""
        UPDATE PaymentTransactionEntity p
        SET p.status = 'FAILED',
            p.gatewayResponseMessage = 'Payment expired'
        WHERE p.status = 'PENDING'
          AND p.expiredAt < :now
    """)
    int expireOldPendingTransactions(@Param("now") LocalDateTime now);

    boolean existsByOrderCode(String orderCode);
}