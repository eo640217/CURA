package com.cura.auth;

import com.cura.auth.dto.LoginRequest;
import com.cura.auth.dto.LoginResponse;
import com.cura.auth.dto.RegisterRequest;
import com.cura.auth.dto.RegisterResponse;
import com.cura.organization.Organization;
import com.cura.organization.OrganizationRepository;
import com.cura.user.User;
import com.cura.user.UserRepository;
import com.cura.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final OrganizationRepository orgRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          UserService userService, OrganizationRepository orgRepo,
                          UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.orgRepo = orgRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        if (req.orgCode() != null && !req.orgCode().isBlank()
                && req.userNumber() != null && !req.userNumber().isBlank()) {
            return orgLogin(req);
        } else if (req.username() != null && !req.username().isBlank()) {
            return usernameLogin(req);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Provide either (orgCode + userNumber) or username");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest req, Authentication authentication) {
        UserPrincipal caller = (UserPrincipal) authentication.getPrincipal();
        User created = userService.createUser(req.username(), req.password(), req.role(), caller.getOrganization());
        return new RegisterResponse(created.getId(), created.getUsername(), created.getRole());
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private LoginResponse orgLogin(LoginRequest req) {
        Organization org = orgRepo.findByOrgCode(req.orgCode().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        User user = userRepo.findByOrganizationIdAndUserNumber(org.getId(), req.userNumber())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        UserPrincipal principal = new UserPrincipal(user);
        return new LoginResponse(
                jwtService.generateToken(principal),
                user.getUsername(),
                user.getRole().name(),
                user.getUserNumber(),
                org.getOrgCode()
        );
    }

    private LoginResponse usernameLogin(LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            return new LoginResponse(
                    jwtService.generateToken(principal),
                    principal.getUsername(),
                    principal.getRole(),
                    principal.getUserNumber(),
                    principal.getOrgCode()
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }
}
