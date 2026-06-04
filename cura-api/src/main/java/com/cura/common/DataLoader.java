package com.cura.common;

import com.cura.facility.Facility;
import com.cura.facility.FacilityRepository;
import com.cura.organization.Organization;
import com.cura.organization.OrganizationRepository;
import com.cura.resident.Resident;
import com.cura.resident.ResidentRepository;
import com.cura.unit.Unit;
import com.cura.unit.UnitRepository;
import com.cura.unit.UnitType;
import com.cura.user.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final OrganizationRepository orgRepo;
    private final FacilityRepository facilityRepo;
    private final UnitRepository unitRepo;
    private final ResidentRepository residentRepo;
    private final UserNumberGenerator numberGenerator;

    @Value("${app.demo-seed:false}")
    private boolean demoSeed;

    public DataLoader(UserRepository repo, PasswordEncoder encoder, OrganizationRepository orgRepo,
                      FacilityRepository facilityRepo, UnitRepository unitRepo,
                      ResidentRepository residentRepo, UserNumberGenerator numberGenerator) {
        this.repo = repo;
        this.encoder = encoder;
        this.orgRepo = orgRepo;
        this.facilityRepo = facilityRepo;
        this.unitRepo = unitRepo;
        this.residentRepo = residentRepo;
        this.numberGenerator = numberGenerator;
    }

    @Override
    public void run(String... args) {
        Organization defaultOrg = orgRepo.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    Organization o = new Organization("Default Organization");
                    o.setOrgCode("DEFAULT");
                    return orgRepo.save(o);
                });

        seedUser("superadmin", UserRole.SUPER_ADMIN, defaultOrg);
        seedUser("admin", UserRole.ADMIN, defaultOrg);
        seedUser("staff", UserRole.STAFF, defaultOrg);

        if (demoSeed && facilityRepo.count() == 0) {
            seedDemoData(defaultOrg);
        }
    }

    private void seedUser(String username, UserRole role, Organization org) {
        if (repo.findByUsername(username).isPresent()) return;
        String userNumber = numberGenerator.generate(
                n -> repo.existsByOrganizationIdAndUserNumber(org.getId(), n));
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode("password"));
        u.setRole(role);
        u.setOrganization(org);
        u.setUserNumber(userNumber);
        u.setAccountStatus(AccountStatus.ACTIVE);
        repo.save(u);
    }

    private void seedDemoData(Organization org) {
        Facility sunrise = new Facility("Sunrise Memory Care", "123 Maple Street, Portland, OR 97201");
        sunrise.setOrganization(org);
        sunrise.setPhone("(503) 555-0142");
        sunrise.setEmail("info@sunrisememorycare.com");
        sunrise = facilityRepo.save(sunrise);

        Unit eastWing = unitRepo.save(new Unit(sunrise, "East Wing", UnitType.WING, 12));
        Unit westWing = unitRepo.save(new Unit(sunrise, "West Wing", UnitType.WING, 10));
        Unit groundFloor = unitRepo.save(new Unit(sunrise, "Ground Floor", UnitType.FLOOR, 8));

        saveResident("Margaret", "Thompson", LocalDate.of(1938, 3, 14), "E-101", eastWing);
        saveResident("Harold",   "Jenkins",  LocalDate.of(1934, 7, 22), "E-102", eastWing);
        saveResident("Dorothy",  "Kaufman",  LocalDate.of(1940, 11, 5), "E-103", eastWing);
        saveResident("Robert",   "Sanchez",  LocalDate.of(1936, 1, 30), "W-101", westWing);
        saveResident("Eleanor",  "Vasquez",  LocalDate.of(1942, 9, 18), "W-102", westWing);
        saveResident("George",   "Whitmore", LocalDate.of(1933, 4, 11), "G-101", groundFloor);

        Facility oakwood = new Facility("Oakwood Senior Living", "456 Oak Avenue, Portland, OR 97202");
        oakwood.setOrganization(org);
        oakwood.setPhone("(503) 555-0198");
        oakwood.setEmail("contact@oakwoodsenior.com");
        oakwood = facilityRepo.save(oakwood);

        Unit roomA = unitRepo.save(new Unit(oakwood, "Room Block A", UnitType.ROOM, 10));
        Unit roomB = unitRepo.save(new Unit(oakwood, "Room Block B", UnitType.ROOM, 10));

        saveResident("Patricia", "Nguyen",   LocalDate.of(1944, 6, 2),  "A-201", roomA);
        saveResident("William",  "O'Brien",  LocalDate.of(1939, 12, 8), "A-202", roomA);
        saveResident("Betty",    "Chambers", LocalDate.of(1941, 8, 25), "B-301", roomB);
        saveResident("Frank",    "Deluca",   LocalDate.of(1937, 2, 19), "B-302", roomB);
    }

    private void saveResident(String firstName, String lastName, LocalDate dob, String room, Unit unit) {
        Resident r = new Resident();
        r.setFirstName(firstName);
        r.setLastName(lastName);
        r.setDateOfBirth(dob);
        r.setRoomNumber(room);
        r.setUnit(unit);
        residentRepo.save(r);
    }
}
