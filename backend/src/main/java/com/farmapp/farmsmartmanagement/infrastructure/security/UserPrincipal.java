package com.farmapp.farmsmartmanagement.infrastructure.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.UUID;

// UserPrincipal.java
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private UUID userId;
    private UUID farmId;
    private String email;
    private Collection<? extends GrantedAuthority> authorities;

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String getPassword() { return null; }
    @Override public String getUsername() { return userId.toString(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}