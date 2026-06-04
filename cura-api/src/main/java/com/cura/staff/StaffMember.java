package com.cura.staff;

import com.cura.facility.Facility;
import com.cura.organization.Organization;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "staff_members")
public class StaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "job_title", nullable = false, length = 100)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StaffDepartment department;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 30)
    private StaffEmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StaffStatus status;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "user_number", nullable = false, length = 6)
    private String userNumber;

    @Column(name = "employee_number", length = 30)
    private String employeeNumber;

    @Column(unique = true, length = 100)
    private String username;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "user_id")
    private Long userId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "staff_facilities",
        joinColumns = @JoinColumn(name = "staff_id"),
        inverseJoinColumns = @JoinColumn(name = "facility_id")
    )
    private Set<Facility> facilities = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = StaffStatus.ACTIVE;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getJobTitle() { return jobTitle; }
    public StaffDepartment getDepartment() { return department; }
    public StaffEmploymentType getEmploymentType() { return employmentType; }
    public StaffStatus getStatus() { return status; }
    public LocalDate getHireDate() { return hireDate; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getNotes() { return notes; }
    public String getUserNumber() { return userNumber; }
    public void setUserNumber(String userNumber) { this.userNumber = userNumber; }
    public String getEmployeeNumber() { return employeeNumber; }
    public String getUsername() { return username; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public Long getUserId() { return userId; }
    public Set<Facility> getFacilities() { return facilities; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public void setDepartment(StaffDepartment department) { this.department = department; }
    public void setEmploymentType(StaffEmploymentType employmentType) { this.employmentType = employmentType; }
    public void setStatus(StaffStatus status) { this.status = status; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
    public void setUsername(String username) { this.username = username; }
    public void setUserId(Long userId) { this.userId = userId; }
}