package com.cura.unit.dto;

import com.cura.unit.UnitType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UnitCreateRequest {

    @NotBlank
    private String name;

    @NotNull
    private UnitType type;

    @NotNull
    @Min(1)
    private Integer capacity;

    public UnitCreateRequest() {}

    public String getName() { return name; }
    public UnitType getType() { return type; }
    public Integer getCapacity() { return capacity; }

    public void setName(String name) { this.name = name; }
    public void setType(UnitType type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
