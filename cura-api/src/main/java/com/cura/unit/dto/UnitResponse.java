package com.cura.unit.dto;

import com.cura.unit.Unit;
import com.cura.unit.UnitType;

public class UnitResponse {

    private Long id;
    private Long facilityId;
    private String name;
    private UnitType type;
    private Integer capacity;

    private Long occupiedCount;
    public UnitResponse() {}

    public UnitResponse(Unit unit) {
        this.id = unit.getId();
        this.facilityId = unit.getFacility().getId();
        this.name = unit.getName();
        this.type = unit.getType();
        this.capacity = unit.getCapacity();
        this.occupiedCount = null;
    }

    public UnitResponse(Long id, Long facilityId, String name, UnitType type, Integer capacity, Long occupiedCount) {
        this.id = id;
        this.facilityId = facilityId;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.occupiedCount = occupiedCount;
    }

    public Long getId() { return id; }
    public Long getFacilityId() { return facilityId; }
    public String getName() { return name; }
    public UnitType getType() { return type; }
    public Integer getCapacity() { return capacity; }

    public Long getOccupiedCount() { return occupiedCount; }

}
