import { http } from "./http";
import { UnitType } from "./units";

export type Resident = {
  id: number;
  facilityId: number | null;
  unitId: number | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  roomNumber: string | null;
  createdAt: string;
  condition?: string | null;
  careLevel?: string | null;
  status?: string | null;
  gpName?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  roomId?: number | null;
  gender?: string | null;
  admissionDate?: string | null;
  nhsNumber?: string | null;
  emergencyContactRelationship?: string | null;
  carePlan?: string | null;
  photoUrl?: string | null;
};

export type ResidentCreateRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  roomNumber?: string | null;
  condition?: string | null;
  careLevel?: string | null;
  status?: string | null;
  gpName?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  roomId?: number | null;
  gender?: string | null;
  admissionDate?: string | null;
  nhsNumber?: string | null;
  carePlan?: string | null;
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

export type ResidentDetailResponse = {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  roomNumber: string | null;

  unitId: number;
  unitName: string;
  unitType: UnitType;
  unitCapacity: number | null;

  facilityId: number;
  facilityName: string;
  facilityAddress: string | null;
};

export async function getResidentDetail(id: number): Promise<ResidentDetailResponse> {
  const res = await http.get<ResidentDetailResponse>(`/residents/${id}`);
  return res.data;
}

export async function uploadResidentPhoto(residentId: number, file: File): Promise<Resident> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await http.post<Resident>(`/residents/${residentId}/photo`, formData);
  return res.data;
}
