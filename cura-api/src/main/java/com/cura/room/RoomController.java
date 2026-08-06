package com.cura.room;

import com.cura.common.TenantUtil;
import com.cura.room.dto.CreateRoomRequest;
import com.cura.room.dto.RoomDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/units/{unitId}/rooms")
    public List<RoomDto> getRoomsByUnit(
            @PathVariable Long unitId,
            @RequestParam(required = false) Boolean available,
            Authentication auth) {
        Long orgId = TenantUtil.orgId(auth);
        if (Boolean.TRUE.equals(available)) {
            return roomService.getAvailableRoomsByUnit(unitId, orgId);
        }
        return roomService.getRoomsByUnit(unitId, orgId);
    }

    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomDto createRoom(@Valid @RequestBody CreateRoomRequest request, Authentication auth) {
        return roomService.createRoom(request, TenantUtil.orgId(auth));
    }
}
