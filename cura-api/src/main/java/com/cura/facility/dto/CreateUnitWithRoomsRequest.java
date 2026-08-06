package com.cura.facility.dto;

import com.cura.unit.UnitType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class CreateUnitWithRoomsRequest {

    @NotBlank
    private String name;

    private UnitType type;

    @Min(1)
    private Integer capacity;

    private List<String> rooms;

    public CreateUnitWithRoomsRequest() {}

    public String getName() { return name; }
    public UnitType getType() { return type; }
    public Integer getCapacity() { return capacity; }
    public List<String> getRooms() { return rooms; }

    public void setName(String name) { this.name = name; }
    public void setType(UnitType type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setRooms(List<String> rooms) { this.rooms = rooms; }
}
