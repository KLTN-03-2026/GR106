package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import java.io.Serializable;
import java.util.UUID;

public class FarmRolePermissionId implements Serializable {

    private UUID farmRole;
    private UUID permission;

    public FarmRolePermissionId() {}

    public FarmRolePermissionId(UUID farmRole, UUID permission) {
        this.farmRole = farmRole;
        this.permission = permission;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FarmRolePermissionId)) return false;
        FarmRolePermissionId that = (FarmRolePermissionId) o;
        return farmRole.equals(that.farmRole) && permission.equals(that.permission);
    }

    @Override
    public int hashCode() {
        return farmRole.hashCode() + permission.hashCode();
    }
}