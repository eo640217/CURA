import { http } from "./http";

export type Facility = {
  id: number;
  name: string;
  address: string;
};

export async function listFacilities(): Promise<Facility[]> {
  const res = await http.get<Facility[]>("/api/v1/facilities");
  return res.data;
}

export async function getFacility(id: number): Promise<Facility> {
  const res = await http.get<Facility>(`/api/v1/facilities/${id}`);
  return res.data;
}
