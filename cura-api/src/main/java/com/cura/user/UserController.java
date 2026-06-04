package com.cura.user;

import com.cura.auth.UserPrincipal;
import com.cura.common.TenantUtil;
import com.cura.user.dto.UserInviteRequest;
import com.cura.user.dto.UserInviteResponse;
import com.cura.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam(value = "username", required = false) String username,
                                   Authentication auth) {
        return userService.listUsers(username, TenantUtil.orgId(auth));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public UserInviteResponse invite(@Valid @RequestBody UserInviteRequest req, Authentication auth) {
        UserPrincipal caller = TenantUtil.principal(auth);
        return userService.inviteUser(req, caller.getOrganization());
    }
}
