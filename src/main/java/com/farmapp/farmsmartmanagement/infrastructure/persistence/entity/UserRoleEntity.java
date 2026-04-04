package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_roles")
@Getter
@Setter
@IdClass(UserRoleId.class)
public class UserRoleEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private RoleEntity role;
}