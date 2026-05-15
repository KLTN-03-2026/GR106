package com.farmapp.farmsmartmanagement.modules.farm.mapper;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.InvitationEntity;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmInvitationResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", uses = {FarmRoleMapper.class})
public interface FarmInvitationMapper {

    @Mapping(source = "farm.id", target = "farm.id")
    @Mapping(source = "farm.name", target = "farm.name")
    @Mapping(source = "farmRole", target = "role")
    @Mapping(source = "invitedBy.id", target = "inviter.id")
    @Mapping(source = "invitedBy.fullName", target = "inviter.fullName")
    @Mapping(source = "invitedBy.email", target = "inviter.email")
    FarmInvitationResponse toResponse(InvitationEntity entity);

    List<FarmInvitationResponse> toResponses(List<InvitationEntity> entities);

}
