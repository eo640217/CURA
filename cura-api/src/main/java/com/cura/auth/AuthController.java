package com.cura.auth;

import com.cura.auth.dto.LoginRequest;
import com.cura.auth.dto.LoginResponse;
import com.cura.auth.dto.RegisterRequest;
import com.cura.auth.dto.RegisterResponse;
import com.cura.user.User;
import com.cura.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );

            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            String token = jwtService.generateToken(principal);

            // role should match what your frontend wants; I'd send "ADMIN"/"STAFF"
            return new LoginResponse(token, principal.getUsername(), principal.getRole());

        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest req) {
        User created = userService.createUser(req.username(), req.password(), req.role());
        return new RegisterResponse(created.getId(), created.getUsername(), created.getRole());
    }
}
