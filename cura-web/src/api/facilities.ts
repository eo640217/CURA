import { http } from "./http";

export type Facility = {
  id: number;
  name: string;
  address: string;
};

export type FacilityCreateRequest = {
  name: string;
  address: string;
};

export async function listFacilities(): Promise<Facility[]> {
  const res = await http.get<Facility[]>("/facilities");
  return res.data;
}

export async function getFacility(id: number): Promise<Facility> {
  const res = await http.get<Facility>(`/facilities/${id}`);
  return res.data;
}

export async function createFacility(req: FacilityCreateRequest): Promise<Facility> {
  const res = await http.post<Facility>("/facilities", req);
  return res.data;
}

export type FacilityUpdateRequest = Partial<Pick<Facility, "name" | "address">>;

export async function patchFacility(facilityId: number, payload: FacilityUpdateRequest): Promise<Facility> {
  const res = await http.patch<Facility>(`/facilities/${facilityId}`, payload);
  return res.data;
}

