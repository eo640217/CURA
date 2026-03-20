package com.cura.resident;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "resident_notes")
public class ResidentNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resident_id", nullable = false)
    private Long residentId;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getResidentId() { return residentId; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }

    public void setResidentId(Long residentId) { this.residentId = residentId; }
    public void setBody(String body) { this.body = body; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}