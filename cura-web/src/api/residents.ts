import { http } from "./http";

export type Resident = {
  id: number;
  facilityId: number | null;
  unitId: number | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null; // ISO date: "YYYY-MM-DD"
  roomNumber: string | null;
  createdAt: string; // ISO instant
};

export type ResidentCreateRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  roomNumber?: string | null;
};

export async function listResidentsByUnit(unitId: number): Promise<Resident[]> {
  const res = await http.get<Resident[]>(`/units/${unitId}/residents`);
  return res.data;
}

export async function createResidentUnderUnit(
  unitId: number,
  payload: ResidentCreateRequest
): Promise<Resident> {
  const res = await http.post<Resident>(`/units/${unitId}/residents`, payload);
  return res.data;
}

export type ResidentTransferRequest = {
  toUnitId: number;
  roomNumber?: string | null;
};

export async function transferResident(
  residentId: number,
  payload: ResidentTransferRequest
): Promise<Resident> {
  const res = await http.patch<Resident>(`/residents/${residentId}/transfer`, payload);
  return res.data;
}

