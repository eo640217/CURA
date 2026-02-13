package com.cura.unit;

import com.cura.facility.Facility;
import jakarta.persistence.*;



@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType type;

    @Column(nullable = false)
    private Integer capacity;

    public Unit() {}

    public Unit(Facility facility, String name, UnitType type, Integer capacity) {
        this.facility = facility;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
    }

    public Long getId() { return id; }
    public Facility getFacility() { return facility; }
    public String getName() { return name; }
    public UnitType getType() { return type; }
    public Integer getCapacity() { return capacity; }

    public void setFacility(Facility facility) { this.facility = facility; }
    public void setName(String name) { this.name = name; }
    public void setType(UnitType type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
