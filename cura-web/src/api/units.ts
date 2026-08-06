import { http } from "./http";

export type UnitType = "ROOM" | "WING" | "FLOOR";

export type Unit = {
  id: number;
  facilityId: number;
  name: string;
  type: UnitType;
  capacity: number;
  occupiedCount: number;
  careSpeciality?: string;
  rooms?: string[];
};

export type Room = {
  id: number;
  roomNumber: string;
  unitId: number;
  bedCount: number;
  isOccupied: boolean;
};

export type UnitCreateRequest = {
  name: string;
  type: UnitType;
  capacity: number;
};

export async function listUnitsByFacility(facilityId: number): Promise<Unit[]> {
  const res = await http.get<Unit[]>(`/facilities/${facilityId}/units`);
  return res.data;
}

export async function createUnit(facilityId: number, payload: UnitCreateRequest): Promise<Unit> {
  const res = await http.post<Unit>(`/facilities/${facilityId}/units`, payload);
  return res.data;
}

export async function deleteUnit(unitId: number): Promise<void> {
  await http.delete(`/units/${unitId}`);
}

export type UnitPatchRequest = Partial<Pick<Unit, "name" | "type" | "capacity">>;

export async function patchUnit(unitId: number, payload: UnitPatchRequest): Promise<Unit> {
  const res = await http.patch<Unit>(`/units/${unitId}`, payload);
  return res.data;
}

export async function listRoomsByUnit(unitId: number, available?: boolean): Promise<Room[]> {
  const params = available ? "?available=true" : "";
  const res = await http.get<Room[]>(`/units/${unitId}/rooms${params}`);
  return res.data;
}
