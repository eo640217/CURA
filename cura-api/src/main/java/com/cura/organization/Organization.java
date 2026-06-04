package com.cura.organization;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "org_code", nullable = false, unique = true, length = 20)
    private String orgCode;

    @Column(name = "plan_tier", nullable = false, length = 30)
    private String planTier = "TRIAL";

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(length = 30)
    private String phone;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Organization() {}

    public Organization(String name) {
        this.name = name;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getOrgCode() { return orgCode; }
    public String getPlanTier() { return planTier; }
    public String getLogoUrl() { return logoUrl; }
    public String getPrimaryColor() { return primaryColor; }
    public String getContactEmail() { return contactEmail; }
    public String getPhone() { return phone; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setName(String name) { this.name = name; }
    public void setOrgCode(String orgCode) { this.orgCode = orgCode; }
    public void setPlanTier(String planTier) { this.planTier = planTier; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public void setPhone(String phone) { this.phone = phone; }
}
