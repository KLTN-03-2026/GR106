package com.farmapp.farmsmartmanagement.modules.warehouse.dto.request;

import jakarta.validation.constraints.Size;

// UpdateSupplierRequest.java
public record UpdateSupplierRequest(
        @Size(max = 200) String name
) {}