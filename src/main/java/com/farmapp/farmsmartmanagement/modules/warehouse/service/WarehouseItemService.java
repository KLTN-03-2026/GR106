package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseItemRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseRepository;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateWarehouseItemRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarehouseItemService {
    WarehouseRepository warehouseRepository;
    WarehouseItemRepository warehouseItemRepository;

//    public WarehouseItemResponse createWarehouseItem(CreateWarehouseItemRequest request){
//
//    }
}
