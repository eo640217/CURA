package com.cura.user;

import com.cura.common.TenantUtil;
import com.cura.user.dto.UserResponse;
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
    public List<UserResponse> list(@RequestParam(value = "username", required = false) String username, Authentication auth) {
        return userService.listUsers(username, TenantUtil.orgId(auth));
    }
}
