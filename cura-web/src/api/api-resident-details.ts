import { http } from "./http";

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

export async function getResidentDetails(id: number): Promise<ResidentDetailsResponse> {
  const res = await http.get<ResidentDetailsResponse>(`/residents/${id}/details`);
  return res.data;
}
