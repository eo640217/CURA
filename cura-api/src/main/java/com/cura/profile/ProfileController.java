package com.cura.profile;

import com.cura.auth.UserPrincipal;
import com.cura.common.error.ApiException;
import com.cura.common.error.ErrorCode;
import com.cura.staff.StaffMember;
import com.cura.staff.StaffMemberRepository;
import com.cura.user.User;
import com.cura.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final UserRepository userRepo;
    private final StaffMemberRepository staffRepo;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepo, StaffMemberRepository staffRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.staffRepo = staffRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {
        User user = loadUser(authentication);
        Optional<StaffMember> staffOpt = staffRepo.findByUserId(user.getId());
        ProfileResponse.StaffSummary staffSummary = staffOpt.map(s -> new ProfileResponse.StaffSummary(
                s.getId(), s.getFirstName(), s.getLastName(), s.getEmail(), s.getPhone(),
                s.getEmployeeNumber(), s.getJobTitle(), s.getDepartment().name(),
                s.getEmploymentType().name(), s.getStatus().name(),
                s.getHireDate() != null ? s.getHireDate().toString() : null
        )).orElse(null);
        return new ProfileResponse(user.getId(), user.getUsername(), user.getRole().name(), staffSummary);
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest req, Authentication authentication) {
        User user = loadUser(authentication);
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_FAILED, "Current password is incorrect");
        }
        if (req.currentPassword().equals(req.newPassword())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_FAILED, "New password must differ from current password");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(user);
    }

    @PatchMapping("/username")
    public ProfileResponse changeUsername(@Valid @RequestBody ChangeUsernameRequest req, Authentication authentication) {
        User user = loadUser(authentication);
        String newUsername = req.newUsername().trim();
        if (userRepo.findByUsername(newUsername).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Username already taken");
        }
        user.setUsername(newUsername);
        userRepo.save(user);
        return new ProfileResponse(user.getId(), user.getUsername(), user.getRole().name(), null);
    }

    private User loadUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "User not found"));
    }
}
