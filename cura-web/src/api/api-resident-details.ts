import { http, apiPut, apiGet} from "./http";

export type ResidentDetailsResponse = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  roomNumber: string | null;

  unitId: number;
  unitName: string;
  unitType: "ROOM" | "WING" | "FLOOR";
  unitCapacity: number | null;

  facilityId: number;
  facilityName: string;
  facilityAddress: string;
};

export function getResidentDetails(id: number) {
  return apiGet<ResidentDetailsResponse>(`/residents/${id}`);
}

export function updateResident(id: number, payload: { roomNumber?: string }) {
  return apiPut(`/residents/${id}`, payload);
}
