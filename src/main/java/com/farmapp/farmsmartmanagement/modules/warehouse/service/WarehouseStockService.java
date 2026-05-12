package com.farmapp.farmsmartmanagement.modules.warehouse.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseItemEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.WarehouseStockEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseItemRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.WarehouseStockRepository;
import com.farmapp.farmsmartmanagement.modules.warehouse.dto.response.WarehouseItemStockByLocationResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class WarehouseStockService {

    WarehouseItemRepository warehouseItemRepository;
    WarehouseStockRepository warehouseStockRepository;
    SecurityUtils securityUtils;

    /**
     * Trả về danh sách vị trí kho còn tồn kho > 0 của một warehouse item.
     * Dùng cho màn hình checkout — user chọn lấy vật tư từ ô nào.
     *
     * GET /api/v1/warehouse/items/{warehouseItemId}/locations/stock
     */
    @Transactional(readOnly = true)
    public List<WarehouseItemStockByLocationResponse> getStockByLocation(UUID warehouseItemId) {

        UUID farmId = securityUtils.getCurrentFarmId();

        WarehouseItemEntity item = warehouseItemRepository.findById(warehouseItemId)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_ITEM_NOT_FOUND));

        // Bảo vệ cross-farm
        if (!item.getFarm().getId().equals(farmId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        String unitName = item.getUnit() != null ? item.getUnit().getName() : null;

        return warehouseStockRepository
                .findAllByWarehouseItem_IdAndFarm_IdAndQtyOnHandGreaterThan(
                        warehouseItemId, farmId, BigDecimal.ZERO)
                .stream()
                .map(stock -> toResponse(stock, unitName))
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────

    private WarehouseItemStockByLocationResponse toResponse(WarehouseStockEntity stock,
                                                            String unitName) {
        return WarehouseItemStockByLocationResponse.builder()
                .locationId(stock.getLocation().getId())
                .locationCode(stock.getLocation().getCode())
                .locationName(stock.getLocation().getName())
                .warehouseId(stock.getLocation().getWarehouse().getId())
                .warehouseName(stock.getLocation().getWarehouse().getName())
                .qtyOnHand(stock.getQtyOnHand())
                .unit(unitName)
                .build();
    }
}