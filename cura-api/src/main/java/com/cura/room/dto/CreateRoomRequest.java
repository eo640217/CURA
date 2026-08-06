package com.cura.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateRoomRequest {

    @NotBlank
    @Size(max = 20)
    private String roomNumber;

    @NotNull
    private Long unitId;

    @Min(1)
    private Integer bedCount = 1;

    public CreateRoomRequest() {}

    public String getRoomNumber() { return roomNumber; }
    public Long getUnitId() { return unitId; }
    public Integer getBedCount() { return bedCount; }

    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public void setBedCount(Integer bedCount) { this.bedCount = bedCount; }
}
