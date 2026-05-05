package com.farmapp.farmsmartmanagement.modules.warehouse.service;


import com.farmapp.farmsmartmanagement.common.response.PageableResponse;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseItemRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseStockRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseTransactionRepository;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseTransactionResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.WarehouseTransactionMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarehouseTransactionService {
    WarehouseTransactionRepository warehouseTransactionRepository;
    WarehouseItemRepository warehouseItemRepository;
    WarehouseStockRepository warehouseStockRepository;
    WarehouseRepository warehouseRepository;
    WarehouseTransactionMapper warehouseTransactionMapper;

    public PageableResponse<WarehouseTransactionResponse> findAllByWarehouseAndFarm(Pageable pageable, UUID warehouseId, UUID farmId) {

        Page<WarehouseTransactionResponse> page = warehouseTransactionRepository
                .findAllByWarehouse_IdAndFarm_Id(warehouseId, farmId, pageable)
                .map(warehouseTransactionMapper::toResponse);

        return PageableResponse.of(page);
    }

    public PageableResponse<WarehouseTransactionResponse> findAllByFarm(Pageable pageable, UUID farmId) {

        Page<WarehouseTransactionResponse> page = warehouseTransactionRepository
                .findAllByFarm_Id(farmId, pageable)
                .map(warehouseTransactionMapper::toResponse);

        return PageableResponse.of(page);
    }

    public PageableResponse<WarehouseTransactionResponse> findAllByWarehouseItem(Pageable pageable, UUID warehouseItemId) {

        Page<WarehouseTransactionResponse> page = warehouseTransactionRepository
                .findAllByWarehouseItem_Id(warehouseItemId, pageable)
                .map(warehouseTransactionMapper::toResponse);

        return PageableResponse.of(page);
    }


}
