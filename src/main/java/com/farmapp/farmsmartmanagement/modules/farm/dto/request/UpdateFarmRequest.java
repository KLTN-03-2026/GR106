package com.farmapp.farmsmartmanagement.modules.farm.dto.request;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateFarmRequest {
    String name;
    String description;
}
