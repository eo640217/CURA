package com.cura.room;

import com.cura.unit.Unit;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(name = "bed_count", nullable = false)
    private Integer bedCount = 1;

    @Column(name = "is_occupied", nullable = false)
    private boolean isOccupied = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Room() {}

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getRoomNumber() { return roomNumber; }
    public Unit getUnit() { return unit; }
    public Integer getBedCount() { return bedCount; }
    public boolean isOccupied() { return isOccupied; }
    public Instant getCreatedAt() { return createdAt; }

    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public void setUnit(Unit unit) { this.unit = unit; }
    public void setBedCount(Integer bedCount) { this.bedCount = bedCount; }
    public void setOccupied(boolean occupied) { this.isOccupied = occupied; }
}
