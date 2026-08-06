package com.cura.facility;

import com.cura.common.NotFoundException;
import com.cura.facility.dto.FacilityCreateRequest;
import com.cura.facility.dto.FacilityResponse;
import com.cura.facility.dto.FacilityUpdateRequest;
import com.cura.organization.Organization;
import com.cura.organization.OrganizationRepository;
import com.cura.room.RoomRepository;
import com.cura.unit.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacilityServiceTest {

    @Mock FacilityRepository facilityRepository;
    @Mock OrganizationRepository orgRepository;
    @Mock UnitRepository unitRepository;
    @Mock RoomRepository roomRepository;

    @InjectMocks FacilityService facilityService;

    private Organization org;
    private Facility facility;

    @BeforeEach
    void setUp() {
        org = new Organization("Test Org");
        ReflectionTestUtils.setField(org, "id", 1L);

        facility = new Facility("Sunrise Home", "123 Main St");
        ReflectionTestUtils.setField(facility, "id", 10L);
        facility.setOrganization(org);
    }

    @Test
    void create_savesAndReturnsFacility() {
        when(orgRepository.findById(1L)).thenReturn(Optional.of(org));
        when(facilityRepository.save(any())).thenReturn(facility);

        FacilityCreateRequest req = new FacilityCreateRequest("Sunrise Home", "123 Main St", null);
        FacilityResponse response = facilityService.create(req, 1L);

        assertThat(response.name()).isEqualTo("Sunrise Home");
        assertThat(response.id()).isEqualTo(10L);
        verify(facilityRepository).save(any(Facility.class));
    }

    @Test
    void create_throwsWhenOrgNotFound() {
        when(orgRepository.findById(99L)).thenReturn(Optional.empty());

        FacilityCreateRequest req = new FacilityCreateRequest("Test", "Addr", null);
        assertThatThrownBy(() -> facilityService.create(req, 99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void get_returnsFacility() {
        when(facilityRepository.existsByIdAndOrganizationId(10L, 1L)).thenReturn(true);
        when(facilityRepository.findById(10L)).thenReturn(Optional.of(facility));

        FacilityResponse response = facilityService.get(10L, 1L);

        assertThat(response.name()).isEqualTo("Sunrise Home");
    }

    @Test
    void get_throwsWhenOwnershipFails() {
        when(facilityRepository.existsByIdAndOrganizationId(10L, 2L)).thenReturn(false);

        assertThatThrownBy(() -> facilityService.get(10L, 2L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void list_returnsFacilitiesForOrg() {
        when(facilityRepository.findByOrganizationId(1L)).thenReturn(List.of(facility));

        List<FacilityResponse> results = facilityService.list(1L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Sunrise Home");
    }

    @Test
    void list_returnsAllWhenOrgIdNull() {
        when(facilityRepository.findAll()).thenReturn(List.of(facility));

        List<FacilityResponse> results = facilityService.list(null);

        assertThat(results).hasSize(1);
        verify(facilityRepository).findAll();
    }

    @Test
    void update_patchesNameAndAddress() {
        when(facilityRepository.existsByIdAndOrganizationId(10L, 1L)).thenReturn(true);
        when(facilityRepository.findById(10L)).thenReturn(Optional.of(facility));
        when(facilityRepository.save(any())).thenReturn(facility);

        FacilityUpdateRequest req = new FacilityUpdateRequest("New Name", null, null, null);
        FacilityResponse response = facilityService.update(10L, req, 1L);

        assertThat(response.name()).isEqualTo("New Name");
    }

    @Test
    void delete_callsDeleteById() {
        when(facilityRepository.existsByIdAndOrganizationId(10L, 1L)).thenReturn(true);
        when(facilityRepository.existsById(10L)).thenReturn(true);

        facilityService.delete(10L, 1L);

        verify(facilityRepository).deleteById(10L);
    }

    @Test
    void delete_throwsWhenFacilityNotFound() {
        when(facilityRepository.existsByIdAndOrganizationId(10L, 1L)).thenReturn(true);
        when(facilityRepository.existsById(10L)).thenReturn(false);

        assertThatThrownBy(() -> facilityService.delete(10L, 1L))
                .isInstanceOf(NotFoundException.class);
    }
}