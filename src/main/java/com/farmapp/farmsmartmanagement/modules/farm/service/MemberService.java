package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmMemberRepository;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.FarmRoleRepository;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.MemberMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MemberService {
    FarmMemberRepository farmMemberRepository;
    FarmRoleRepository farmRoleRepository;
    MemberMapper memberMapper;

    public List<FarmRoleResponse> findAll() {
        return memberMapper.toResponses(farmRoleRepository.findAll());
    }

}
