package com.farmapp.farmsmartmanagement.modules.farm.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmMemberEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.FarmRoleEntity;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.InvitationEntity;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmInvitationResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmMemberResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FarmMemberMapper {

    FarmRoleResponse toResponse(FarmRoleEntity farmRoleEntity);

    List<FarmRoleResponse> toResponses(List<FarmRoleEntity> farmRoleEntity);

    @Mapping(source = "user.id",target = "userId")
    @Mapping(source = "user.fullName",target = "fullName")
    @Mapping(source = "user.email",target = "email")
    @Mapping(source = "user.avatarUrl",target = "avatarUrl")
    @Mapping(source = "farmRole", target = "role")
    FarmMemberResponse toFarmMemberResponse(FarmMemberEntity farmMemberEntity);

    List<FarmMemberResponse> toFarmMemberResponses(List<FarmMemberEntity> farmMemberEntity);


}
