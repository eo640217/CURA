package com.cura.user;

import com.cura.common.ConflictException;
import com.cura.common.UserNumberGenerator;
import com.cura.organization.Organization;
import com.cura.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final UserNumberGenerator numberGenerator;

    public UserService(UserRepository userRepository, PasswordEncoder encoder, UserNumberGenerator numberGenerator) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.numberGenerator = numberGenerator;
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
        return userRepository.save(u);
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
