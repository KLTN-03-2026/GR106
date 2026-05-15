package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateSupplierRequest {
    String supplierCode;
    String name;
}
