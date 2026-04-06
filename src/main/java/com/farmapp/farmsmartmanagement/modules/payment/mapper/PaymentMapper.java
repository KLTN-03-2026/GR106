package com.farmapp.farmsmartmanagement.modules.payment.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.PaymentTransactionEntity;
import com.farmapp.farmsmartmanagement.modules.payment.dto.response.PaymentTransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PaymentMapper {

    PaymentTransactionResponse toResponse(PaymentTransactionEntity entity);
}