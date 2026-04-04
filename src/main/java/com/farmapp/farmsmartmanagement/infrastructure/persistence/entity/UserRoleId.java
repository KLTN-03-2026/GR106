package com.farmapp.farmsmartmanagement.infrastructure.persistence.entity;

import java.io.Serializable;
import java.util.UUID;

public class UserRoleId implements Serializable {

    private UUID user;
    private UUID role;

    public UserRoleId() {
    }

    public UserRoleId(UUID user, UUID role) {
        this.user = user;
        this.role = role;
    }

    // equals + hashCode bắt buộc
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserRoleId)) return false;
        UserRoleId that = (UserRoleId) o;
        return user.equals(that.user) && role.equals(that.role);
    }

    @Override
    public int hashCode() {
        return user.hashCode() + role.hashCode();
    }
}