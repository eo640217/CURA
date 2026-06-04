package com.cura.auth;

import com.cura.organization.Organization;
import com.cura.user.User;
import com.cura.user.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    public Long getId() { return user.getId(); }
    public String getRole() { return user.getRole().name(); }
    public Long getOrgId() { return user.getOrganization().getId(); }
    public String getOrgCode() { return user.getOrganization().getOrgCode(); }
    public Organization getOrganization() { return user.getOrganization(); }
    public String getUserNumber() { return user.getUserNumber(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        // SUPER_ADMIN inherits all ADMIN permissions
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        return authorities;
    }

    @Override
    public String getPassword() { return user.getPasswordHash(); }

    @Override
    public String getUsername() { return user.getUsername(); }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
