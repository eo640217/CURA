package com.cura.user;

import com.cura.common.ConflictException;
import com.cura.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public UserService(UserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    @Transactional
    public User createUser(String username, String rawPassword, UserRole role) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ConflictException("Username already exists: " + username);
        }

        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRole(role);

        return userRepository.save(u);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(String usernameQuery) {
        List<User> users;

        if (usernameQuery == null || usernameQuery.isBlank()) {
            users = userRepository.findAllByOrderByUsernameAsc();
        } else {
            users = userRepository.findByUsernameContainingIgnoreCaseOrderByUsernameAsc(usernameQuery.trim());
        }

        return users.stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getRole()))
                .toList();
    }
}
