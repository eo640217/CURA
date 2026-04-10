import { http } from "./http";

export type ResidentDirectoryItem = {
  residentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  roomNumber: string | null;
  unitId: number;
  unitName: string;
  unitType: string;
  unitCapacity: number | null;
  facilityId: number;
  facilityName: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function listResidentDirectory(params: { q?: string; page?: number; size?: number }) {
  const res = await http.get<Page<ResidentDirectoryItem>>("/residents/directory", { params });
  return res.data;
}
