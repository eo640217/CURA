package com.cura.unit.dto;

import com.cura.unit.UnitType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class UnitPatchRequest {

    @Size(max = 80)
    private String name;

    private UnitType type;

    @Min(1)
    private Integer capacity;

    public UnitPatchRequest() {}

    public String getName() { return name; }
    public UnitType getType() { return type; }
    public Integer getCapacity() { return capacity; }

    public void setName(String name) { this.name = name; }
    public void setType(UnitType type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
