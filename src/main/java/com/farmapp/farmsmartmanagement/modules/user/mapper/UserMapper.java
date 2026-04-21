package com.farmapp.farmsmartmanagement.modules.user.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.UserEntity;
import com.farmapp.farmsmartmanagement.modules.user.dto.response.UserResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toUserResponse(UserEntity user);

    List<UserResponse> toUserResponses(List<UserEntity> users);
}
