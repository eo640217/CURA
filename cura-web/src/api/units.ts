import { http } from "./http";

export type UnitType = "ROOM" | "WING" | "FLOOR";

export type Unit = {
  id: number;
  facilityId: number;
  name: string;
  type: UnitType;
  capacity: number;
};

export type UnitCreateRequest = {
  name: string;
  type: UnitType;
  capacity: number;
};

export async function listUnitsByFacility(facilityId: number): Promise<Unit[]> {
  const res = await http.get<Unit[]>(`/api/v1/facilities/${facilityId}/units`);
  return res.data;
}

export async function createUnit(facilityId: number, payload: UnitCreateRequest): Promise<Unit> {
  const res = await http.post<Unit>(`/api/v1/facilities/${facilityId}/units`, payload);
  return res.data;
}

export async function deleteUnit(unitId: number): Promise<void> {
  await http.delete(`/api/v1/units/${unitId}`);
}
