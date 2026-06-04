package com.cura.common;

import com.cura.auth.UserPrincipal;
import org.springframework.security.core.Authentication;

public final class TenantUtil {

    private TenantUtil() {}

    public static UserPrincipal principal(Authentication auth) {
        return (UserPrincipal) auth.getPrincipal();
    }

    /**
     * Returns the caller's orgId, or null for SUPER_ADMIN (bypasses all org filters).
     */
    public static Long orgId(Authentication auth) {
        UserPrincipal p = principal(auth);
        return "SUPER_ADMIN".equals(p.getRole()) ? null : p.getOrgId();
    }
}
