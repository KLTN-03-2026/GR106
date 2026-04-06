package com.farmapp.farmsmartmanagement.modules.subscription.service;


import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PaymentTransactionEntity;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubscriptionUpgradeService {

    public String createPaymentSubscription(){
        PaymentTransactionEntity paymentTransactionEntity = new PaymentTransactionEntity();

        return "";
    }
}
