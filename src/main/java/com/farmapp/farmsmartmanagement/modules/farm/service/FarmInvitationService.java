package com.farmapp.farmsmartmanagement.modules.farm.service;

import com.farmapp.farmsmartmanagement.common.exception.AppException;
import com.farmapp.farmsmartmanagement.common.exception.ErrorCode;
import com.farmapp.farmsmartmanagement.common.util.RlsUtils;
import com.farmapp.farmsmartmanagement.common.util.SecurityUtils;
import com.farmapp.farmsmartmanagement.config.app.AppProperties;
import com.farmapp.farmsmartmanagement.domain.enums.InvitationStatus;
import com.farmapp.farmsmartmanagement.domain.enums.UserStatus;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.entity.*;
import com.farmapp.farmsmartmanagement.infrastructure.persistence.repository.*;
import com.farmapp.farmsmartmanagement.modules.auth.event.SendCredentialsEmailEvent;
import com.farmapp.farmsmartmanagement.modules.farm.dto.request.InvitationRequest;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmInvitationResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmMemberResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.FarmRoleResponse;
import com.farmapp.farmsmartmanagement.modules.farm.dto.response.InvitationPreviewResponse;
import com.farmapp.farmsmartmanagement.modules.farm.event.SendFarmInvitationEvent;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmInvitationMapper;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmMemberMapper;
import com.farmapp.farmsmartmanagement.modules.farm.mapper.FarmRoleMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FarmInvitationService {
    FarmMemberRepository farmMemberRepository;
    FarmRoleRepository farmRoleRepository;
    FarmRepository farmRepository;
    UserRoleRepository  userRoleRepository;
    InvitationRepository invitationRepository;
    RoleRepository roleRepository;
    UserRepository userRepository;

    PasswordEncoder passwordEncoder;

    FarmMemberMapper farmMemberMapper;
    FarmInvitationMapper farmInvitationMapper;
    FarmRoleMapper farmRoleMapper;

    RlsUtils rlsUtils;

    ApplicationEventPublisher eventPublisher;

    SecurityUtils securityUtils;

    WorkSessionRepository workSessionRepository;
    TaskAssigneeRepository taskAssigneeRepository;
    AppProperties appProperties;

    public List<FarmRoleResponse> findAllFarmRole() {
        return farmRoleMapper.toResponses(farmRoleRepository.findAll());
    }


    @Transactional(readOnly = true)
    public List<FarmMemberResponse> findAllFarmMember(UUID farmId) {
        List<FarmMemberEntity> farmMember = farmMemberRepository
                .findAllByFarm_Id(farmId);

        return farmMemberMapper.toFarmMemberResponses(farmMember);
    }

    @Transactional
    public void inviteMember(UUID farmId, InvitationRequest request) {
        if(securityUtils.getCurrentUserEmail()!=null && securityUtils.getCurrentUserEmail().equals(request.getEmail())) {
            throw new AppException(ErrorCode.CANNOT_INVITE_YOURSELF);
        }

        if(!userRepository.existsByEmailAndRoleIsAdmin(request.getEmail()))
            throw new AppException(ErrorCode.USER_NOT_EXISTED);

        FarmEntity farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        FarmRoleEntity farmRole = farmRoleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.FARM_ROLE_NOT_FOUND));

        // Kiểm tra đã có invitation PENDING chưa
        boolean alreadyInvited = invitationRepository
                .existsByEmailAndFarm_IdAndStatus(
                        request.getEmail(), farmId, InvitationStatus.PENDING);
        if (alreadyInvited)
            throw new AppException(ErrorCode.INVITATION_ALREADY_SENT);

        // Kiểm tra đã là member active chưa
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            farmMemberRepository.findByFarm_IdAndUser_Id(farmId, user.getId())
                    .ifPresent(member -> {
                        if (member.getIsActive())
                            throw new AppException(ErrorCode.FARM_MEMBER_ALREADY_EXISTS);
                    });
        });

        UUID invitedBy = securityUtils.getCurrentUserId();

        // Tạo invitation
        InvitationEntity invitation = new InvitationEntity();
        invitation.setFarm(farm);
        invitation.setInvitedBy(userRepository.getReferenceById(invitedBy));
        invitation.setEmail(request.getEmail());
        invitation.setFarmRole(farmRole);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        invitation.setCreatedAt(Instant.now());
        invitationRepository.save(invitation);

        // Tìm hoặc tạo user — nhưng KHÔNG add vào farm ngay
        boolean isNewUser = userRepository.findByEmail(request.getEmail()).isEmpty();
        String rawPassword = null;

        if (isNewUser) {
            rawPassword = generateTempPassword();
            String finalRaw = rawPassword;

            rlsUtils.runAsAdmin(() -> {
                UserEntity newUser = new UserEntity();
                newUser.setEmail(request.getEmail());
                newUser.setPassword(passwordEncoder.encode(finalRaw));
                newUser.setFullName("Vui lòng cập nhật tên");
                newUser.setStatus(UserStatus.ACTIVE); // ACTIVE luôn vì đã tạo tài khoản luôn — chưa accept
                newUser.setIsLocked(false);
                userRepository.save(newUser);

                RoleEntity userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
                userRoleRepository.save(new UserRoleEntity(newUser, userRole));
            });
        }

        // Gửi mail sau khi commit
        String acceptLink = appProperties.getFrontendUrl()
                + "/invitations/" + invitation.getId() + "/accept";

        if (isNewUser) {
            String finalRaw = rawPassword;
            eventPublisher.publishEvent(new SendCredentialsEmailEvent(
                    this,
                    request.getEmail(),
                    request.getEmail(),
                    finalRaw,
                    farm.getName(),
                    acceptLink
            ));
        } else {
            eventPublisher.publishEvent(new SendFarmInvitationEvent(
                    this,
                    request.getEmail(),
                    request.getEmail(),
                    farm.getName(),
                    acceptLink
            ));
        }
    }

    @Transactional
    public void resendInvitation(UUID farmId, UUID invitationId){
        FarmEntity farm = farmRepository
                .findById(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));

        InvitationEntity currentInvitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new AppException(ErrorCode.INVITATION_NOT_FOUND));

        if(currentInvitation.getStatus().equals(InvitationStatus.ACCEPTED)){
            throw new AppException(ErrorCode.INVITATION_ALREADY_USED);
        }

        currentInvitation.setStatus(InvitationStatus.PENDING);
        currentInvitation.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        invitationRepository.save(currentInvitation);

        UserEntity recipientMail = userRepository
                .findByEmail(currentInvitation.getEmail())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        String acceptLink = appProperties.getFrontendUrl()
                + "/invitations/" + currentInvitation.getId() + "/accept";

        eventPublisher.publishEvent(new SendFarmInvitationEvent(
                this,
                recipientMail.getFullName(),
                currentInvitation.getEmail(),
                farm.getName(),
                acceptLink
        ));
    }

    @Transactional
    public FarmMemberResponse acceptInvitation(UUID invitationId) {
        String email = securityUtils.getCurrentUserEmail();

        InvitationEntity invitation = rlsUtils.runAsAdmin(() ->
                invitationRepository.findById(invitationId)
                        .orElseThrow(() -> new AppException(ErrorCode.INVITATION_NOT_FOUND))
        );

        // Validate
        if (!invitation.getEmail().equals(email))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (invitation.getStatus() != InvitationStatus.PENDING)
            throw new AppException(ErrorCode.INVITATION_ALREADY_USED);

        if (invitation.getExpiresAt().isBefore(Instant.now())){
            invitation.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
            invitationRepository.save(invitation);
            throw new AppException(ErrorCode.INVITATION_EXPIRED);
        }
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kích hoạt user nếu là user mới
        if (user.getStatus() == UserStatus.PENDING) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
        }

        // Tạo hoặc reactivate farm member
        return rlsUtils.runAsAdmin(() ->{
            FarmMemberEntity member = farmMemberRepository
                .findByFarm_IdAndUser_Id(invitation.getFarm().getId(), user.getId())
                .orElse(new FarmMemberEntity());

            member.setFarm(invitation.getFarm());
            member.setUser(user);
            member.setFarmRole(invitation.getFarmRole());
            member.setIsActive(true);
            member.setJoinedAt(Instant.now());
            farmMemberRepository.save(member);

            // Update invitation status
            invitation.setStatus(InvitationStatus.ACCEPTED);
            invitation.setAcceptedAt(Instant.now());
            invitationRepository.save(invitation);

            return farmMemberMapper.toFarmMemberResponse(member);
        });
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


    // Service — gộp lại
    @Transactional(readOnly = true)
    public List<FarmInvitationResponse> findAllMyInvitations(InvitationStatus status) {
        String email = securityUtils.getCurrentUserEmail();
        return rlsUtils.runAsAdmin(() -> {
            List<InvitationEntity> invitations = status == null
                    ? invitationRepository.findAllByEmail(email)
                    : invitationRepository.findAllByEmailAndStatus(email, status);
            return farmInvitationMapper.toResponses(invitations);
        });
    }

    @Transactional(readOnly = true)
    public List<FarmInvitationResponse> findAllInvitationsByFarm(UUID farmId, InvitationStatus status) {
        List<InvitationEntity> invitations = status == null
                ? invitationRepository.findAllByFarm_Id(farmId)
                : invitationRepository.findAllByFarm_IdAndStatus(farmId, status);
        return farmInvitationMapper.toResponses(invitations);
    }

    @Transactional
    public void cancelInvitation(UUID farmId, UUID invitationId) {
        InvitationEntity invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new AppException(ErrorCode.INVITATION_NOT_FOUND));

        if (!invitation.getFarm().getId().equals(farmId))
            throw new AppException(ErrorCode.FORBIDDEN);

        if (invitation.getStatus() != InvitationStatus.PENDING)
            throw new AppException(ErrorCode.INVITATION_ALREADY_USED);

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);
    }

    @Transactional
    public void removeMember(UUID farmId, UUID memberId) {
        if(memberId!=null && memberId.equals(securityUtils.getCurrentUserId()))
            throw new AppException(ErrorCode.CANNOT_REMOVE_YOURSELF);

        FarmMemberEntity member = farmMemberRepository
                .findByFarm_IdAndUser_Id(farmId, memberId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_MEMBER_NOT_FOUND));

        if(workSessionRepository.existsByEmployee_IdAndCheckedOutAtIsNull(member.getUser().getId()))
            throw new AppException(ErrorCode.EMPLOYEE_HAVE_OPEN_SESSION_CAN_NOT_DELETE_MEMBER);

        if (member.getFarmRole().getName().equals("OWNER"))
            throw new AppException(ErrorCode.CANNOT_REMOVE_OWNER);

        member.setIsActive(false);
        farmMemberRepository.save(member);
    }

    // Service
    public InvitationPreviewResponse previewInvitation(UUID invitationId) {
        return rlsUtils.runAsAdmin(() -> {
            InvitationEntity inv = invitationRepository.findById(invitationId)
                    .orElseThrow(() -> new AppException(ErrorCode.INVITATION_NOT_FOUND));

            if(inv.getStatus() == InvitationStatus.CANCELLED)
                throw new AppException(ErrorCode.INVITATION_NOT_FOUND);

            if (inv.getStatus() != InvitationStatus.PENDING)
                throw new AppException(ErrorCode.INVITATION_ALREADY_USED);

            if (inv.getExpiresAt().isBefore(Instant.now()))
                throw new AppException(ErrorCode.INVITATION_EXPIRED);

            return InvitationPreviewResponse.builder()
                    .farmName(inv.getFarm().getName())
                    .inviterName(inv.getInvitedBy().getFullName())
                    .role(inv.getFarmRole().getName())
                    .email(inv.getEmail())
                    .expiresAt(inv.getExpiresAt().toString())
                    .build();
        });
    }
}
