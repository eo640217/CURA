package com.cura.unit.dto;

import com.cura.unit.Unit;
import com.cura.unit.UnitType;

public class UnitResponse {

    private Long id;
    private Long facilityId;
    private String name;
    private UnitType type;
    private Integer capacity;

    public UnitResponse() {}

    public UnitResponse(Unit unit) {
        this.id = unit.getId();
        this.facilityId = unit.getFacility().getId();
        this.name = unit.getName();
        this.type = unit.getType();
        this.capacity = unit.getCapacity();
    }

    public Long getId() { return id; }
    public Long getFacilityId() { return facilityId; }
    public String getName() { return name; }
    public UnitType getType() { return type; }
    public Integer getCapacity() { return capacity; }
}
