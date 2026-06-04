package com.cura.user;

import com.cura.auth.SetupTokenService;
import com.cura.common.ConflictException;
import com.cura.common.UserNumberGenerator;
import com.cura.common.error.ApiException;
import com.cura.common.error.ErrorCode;
import com.cura.organization.Organization;
import com.cura.user.dto.UserInviteRequest;
import com.cura.user.dto.UserInviteResponse;
import com.cura.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final UserNumberGenerator numberGenerator;
    private final SetupTokenService setupTokenService;

    public UserService(UserRepository userRepository, PasswordEncoder encoder,
                       UserNumberGenerator numberGenerator, SetupTokenService setupTokenService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.numberGenerator = numberGenerator;
        this.setupTokenService = setupTokenService;
    }

    @Transactional
    public User createUser(String username, String rawPassword, UserRole role, Organization organization) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ConflictException("Username already exists: " + username);
        }
        String userNumber = numberGenerator.generate(
                n -> userRepository.existsByOrganizationIdAndUserNumber(organization.getId(), n));
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRole(role);
        u.setOrganization(organization);
        u.setUserNumber(userNumber);
        u.setAccountStatus(AccountStatus.ACTIVE);
        return userRepository.save(u);
    }

    @Transactional
    public User createPendingUser(String username, UserRole role, Organization organization) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ConflictException("Username already exists: " + username);
        }
        String userNumber = numberGenerator.generate(
                n -> userRepository.existsByOrganizationIdAndUserNumber(organization.getId(), n));
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
        u.setRole(role);
        u.setOrganization(organization);
        u.setUserNumber(userNumber);
        u.setAccountStatus(AccountStatus.PENDING);
        return userRepository.save(u);
    }

    @Transactional
    public UserInviteResponse inviteUser(UserInviteRequest req, Organization organization) {
        UserRole role;
        try {
            role = UserRole.valueOf(req.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED,
                    "Invalid role: " + req.role());
        }
        User user = createPendingUser(req.username(), role, organization);
        String rawToken = setupTokenService.generate(user.getId());
        String setupLink = "/setup-password?token=" + rawToken;
        return new UserInviteResponse(user.getId(), user.getUsername(), user.getUserNumber(),
                user.getRole().name(), setupLink);
    }

    @Transactional(readOnly = true)
    public boolean hasAdminForOrg(Long orgId) {
        return userRepository.existsByOrganizationIdAndRole(orgId, UserRole.ADMIN);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(String usernameQuery, Long orgId) {
        List<User> users;
        if (orgId == null) {
            users = (usernameQuery == null || usernameQuery.isBlank())
                    ? userRepository.findAllByOrderByUsernameAsc()
                    : userRepository.findByUsernameContainingIgnoreCaseOrderByUsernameAsc(usernameQuery.trim());
        } else {
            users = (usernameQuery == null || usernameQuery.isBlank())
                    ? userRepository.findByOrganizationIdOrderByUsernameAsc(orgId)
                    : userRepository.findByOrganizationIdAndUsernameContainingIgnoreCaseOrderByUsernameAsc(orgId, usernameQuery.trim());
        }
        return users.stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getRole()))
                .toList();
    }
}
