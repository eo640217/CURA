package com.cura.resident;

import com.cura.unit.Unit;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "residents")
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "dob")
    private LocalDate dateOfBirth;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Column(name = "resident_number", nullable = false, length = 6)
    private String residentNumber;

//    @Column(name = "notes")
//    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

//    @Column(name = "updated_at", nullable = false)
//    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
//        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
//        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getRoomNumber() { return roomNumber; }

    public String getResidentNumber() { return residentNumber; }
    public void setResidentNumber(String residentNumber) { this.residentNumber = residentNumber; }

    public Unit getUnit() { return unit; }

    public void setUnit(Unit unit) { this.unit = unit; }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

}
