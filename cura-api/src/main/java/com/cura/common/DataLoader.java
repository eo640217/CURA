package com.cura.common;

import com.cura.user.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public DataLoader(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        // ADMIN
        if (repo.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(encoder.encode("password"));
            admin.setRole(UserRole.ADMIN);
            repo.save(admin);
        }

        // STAFF
        if (repo.findByUsername("staff").isEmpty()) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setPasswordHash(encoder.encode("password"));
            staff.setRole(UserRole.STAFF);
            repo.save(staff);
        }
    }
}
