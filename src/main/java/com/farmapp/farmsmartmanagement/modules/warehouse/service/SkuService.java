package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.SkuEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.request.CreateSkuRequest;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.SkuResponse;
import com.farmapp.farmsmartmanagement.modules.warehouse.mapper.SkuMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SkuService {
    SkuRepository skuRepository;

    SkuMapper skuMapper;

    UserRepository userRepository;
    FarmRepository farmRepository;
    SecurityUtils securityUtils;

    WarehouseItemRepository warehouseItemRepository;

    @Transactional(readOnly = true)
    public List<SkuResponse> getSkus() {
        return skuMapper.toSkuResponses(skuRepository.findAll());
    }


    @Transactional
    public SkuResponse createSku(CreateSkuRequest request) {
        UUID farm_id = securityUtils.getCurrentFarmId();
        UUID user_id = securityUtils.getCurrentUserId();

        UserEntity user = userRepository.getReferenceById(user_id);
        FarmEntity farm = farmRepository.getReferenceById(farm_id);

        if(skuRepository.existsBySkuAndFarmId(request.getSku(), farm_id))
            throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);

        SkuEntity skuEntity = new SkuEntity();
        skuEntity.setSku(request.getSku());
        skuEntity.setDescription(request.getDescription());
        skuEntity.setCreatedBy(user);
        skuEntity.setFarm(farm);
        skuEntity.setCreatedAt(Instant.now());

        return skuMapper.toSkuResponse(skuRepository.save(skuEntity));
    }

    @Transactional
    public void deleteSku(String sku) {
        UUID farm_id = securityUtils.getCurrentFarmId();

        if(warehouseItemRepository.existsBySkuAndFarm_Id(sku,farm_id))
            throw new AppException(ErrorCode.SKU_IS_USING);

        skuRepository.deleteBySku(sku);
    }
}
