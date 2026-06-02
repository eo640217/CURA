package com.cura.common;

import com.cura.organization.Organization;
import com.cura.organization.OrganizationRepository;
import com.cura.user.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final OrganizationRepository orgRepo;

    public DataLoader(UserRepository repo, PasswordEncoder encoder, OrganizationRepository orgRepo) {
        this.repo = repo;
        this.encoder = encoder;
        this.orgRepo = orgRepo;
    }

    @Override
    public void run(String... args) {
        Organization defaultOrg = orgRepo.findAll().stream()
                .findFirst()
                .orElseGet(() -> orgRepo.save(new Organization("Default Organization")));

        // ADMIN
        if (repo.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(encoder.encode("password"));
            admin.setRole(UserRole.ADMIN);
            admin.setOrganization(defaultOrg);
            repo.save(admin);
        }

        // STAFF
        if (repo.findByUsername("staff").isEmpty()) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setPasswordHash(encoder.encode("password"));
            staff.setRole(UserRole.STAFF);
            staff.setOrganization(defaultOrg);
            repo.save(staff);
        }
    }
}
