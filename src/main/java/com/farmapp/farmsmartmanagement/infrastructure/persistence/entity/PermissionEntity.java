package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter
public class PermissionEntity {

    @Id
    private UUID id;

    private String name;
}