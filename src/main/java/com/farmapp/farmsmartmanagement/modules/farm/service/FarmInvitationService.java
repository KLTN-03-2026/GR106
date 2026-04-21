package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.config.app.AppProperties;
import com.farmapp.farmsmartmanagement.domain.enums.UserStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.auth.dto.request.RegisterRequest;
import com.farmapp.farmsmartmanagement.modules.auth.event.SendCredentialsEmailEvent;
import com.farmapp.farmsmartmanagement.modules.auth.service.AuthService;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.InvitationRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmInvitationResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.event.SendFarmInvitationEvent;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.MemberMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventPublicationInterceptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmInvitationService {
    FarmMemberRepository farmMemberRepository;
    FarmRoleRepository farmRoleRepository;
    MemberMapper memberMapper;
    FarmRepository farmRepository;
    UserRoleRepository  userRoleRepository;

    RoleRepository roleRepository;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;

    RlsUtils rlsUtils;

    ApplicationEventPublisher eventPublisher;


    AppProperties appProperties;

    public List<FarmRoleResponse> findAll() {
        return memberMapper.toResponses(farmRoleRepository.findAll());
    }


    @Transactional
    public FarmInvitationResponse inviteMember(UUID farmId, InvitationRequest request) {
        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        FarmRoleEntity farmRole = farmRoleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.FARM_ROLE_NOT_FOUND));

        // Tìm hoặc tạo user
        UserEntity user;
        boolean isNewUser = false;
        String rawPassword;

        Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            // User chưa có tài khoản — tạo với password random
            rawPassword = generateTempPassword(); // giữ lại để gửi mail
            isNewUser = true;

            user = rlsUtils.runAsAdmin(() -> {
                UserEntity newUser = new UserEntity();
                newUser.setEmail(request.getEmail());
                newUser.setPassword(passwordEncoder.encode(rawPassword));
                newUser.setFullName("Vui lòng cập nhật tên");
                newUser.setStatus(UserStatus.ACTIVE); // active luôn vì farm đã xác nhận
                newUser.setIsLocked(false);
                userRepository.save(newUser);

                RoleEntity userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
                userRoleRepository.save(new UserRoleEntity(newUser, userRole));

                return newUser;
            });
        } else {
            rawPassword = null;
            user = userOpt.get();
        }

        // Kiểm tra đã là thành viên chưa
        Optional<FarmMemberEntity> memberOpt = farmMemberRepository
                .findByFarm_IdAndUser_Id(farmId, user.getId());

        FarmMemberEntity member;

        if (memberOpt.isPresent()) {
            member = memberOpt.get();

            if (member.getIsActive() && member.getFarmRole().getId().equals(request.getRoleId())) {
                throw new AppException(ErrorCode.FARM_MEMBER_ALREADY_EXISTS);
            }

            // Đã là thành viên nhưng inactive hoặc đổi role
            member.setFarmRole(farmRole);
            member.setIsActive(true);
            farmMemberRepository.save(member);
        } else {
            // Tạo thành viên mới
            member = new FarmMemberEntity();
            member.setFarm(farm);
            member.setUser(user);
            member.setFarmRole(farmRole);
            member.setIsActive(false);
            farmMemberRepository.save(member);
        }

        // Publish event gửi mail SAU KHI transaction commit
        if (isNewUser) {
            // Gửi mail kèm credentials
            String finalRawPassword = rawPassword;
            eventPublisher.publishEvent(new SendCredentialsEmailEvent(
                    this,
                    user.getFullName(),
                    user.getEmail(),
                    finalRawPassword,
                    farm.getName(),
                    appProperties.getFrontendUrl() + "/login"
            ));
        } else {
            // Gửi mail thông báo được mời (không có password)
            eventPublisher.publishEvent(new SendFarmInvitationEvent(
                    this,
                    user.getFullName(),
                    user.getEmail(),
                    farm.getName(),
                    appProperties.getFrontendUrl() + "/farms/" + farmId
            ));
        }

        return FarmInvitationResponse.builder()
                .id(member.getId())
                .farmId(farm.getId())
                .memberId(user.getId())
                .role(FarmRoleResponse.builder()
                        .id(farmRole.getId())
                        .name(farmRole.getName())
                        .description(farmRole.getDescription())
                        .build())
                .build();
    }

    private String generateTempPassword() {
        // 10 ký tự: chữ hoa + chữ thường + số
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.security.SecureRandom();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

}
