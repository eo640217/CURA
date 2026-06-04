import { http } from "./http";
import type { Page } from "./page";

export type StaffDepartment = "NURSING" | "CARE" | "ADMINISTRATION" | "MANAGEMENT" | "MAINTENANCE" | "OTHER";
export type StaffEmploymentType = "FULL_TIME" | "PART_TIME" | "AGENCY" | "VOLUNTEER";
export type StaffStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED";

export type StaffResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  employeeNumber: string | null;
  username: string | null;
  jobTitle: string;
  department: StaffDepartment;
  employmentType: StaffEmploymentType;
  status: StaffStatus;
  hireDate: string | null;
  createdAt: string;
};

export type FacilitySummary = { id: number; name: string };

export type StaffDetailResponse = StaffResponse & {
  dateOfBirth: string | null;
  notes: string | null;
  userId: number | null;
  facilities: FacilitySummary[];
  updatedAt: string;
};

export type StaffCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeNumber?: string;
  username?: string;
  jobTitle: string;
  department: StaffDepartment;
  employmentType: StaffEmploymentType;
  hireDate: string;
  dateOfBirth?: string;
  notes?: string;
};

export type StaffUpdateRequest = StaffCreateRequest;

export async function listStaff(params: {
  q?: string;
  status?: StaffStatus | "";
  department?: StaffDepartment | "";
  page?: number;
  size?: number;
}): Promise<Page<StaffResponse>> {
  const res = await http.get<Page<StaffResponse>>("/staff", { params });
  return res.data;
}

export async function getStaff(id: number): Promise<StaffDetailResponse> {
  const res = await http.get<StaffDetailResponse>(`/staff/${id}`);
  return res.data;
}

export async function createStaff(req: StaffCreateRequest): Promise<StaffDetailResponse> {
  const res = await http.post<StaffDetailResponse>("/staff", req);
  return res.data;
}

export async function updateStaff(id: number, req: StaffUpdateRequest): Promise<StaffDetailResponse> {
  const res = await http.put<StaffDetailResponse>(`/staff/${id}`, req);
  return res.data;
}

export async function patchStaffStatus(id: number, status: StaffStatus): Promise<StaffDetailResponse> {
  const res = await http.patch<StaffDetailResponse>(`/staff/${id}/status`, { status });
  return res.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await http.delete(`/staff/${id}`);
}

export async function assignFacility(staffId: number, facilityId: number): Promise<StaffDetailResponse> {
  const res = await http.post<StaffDetailResponse>(`/staff/${staffId}/facilities/${facilityId}`);
  return res.data;
}

export async function removeFacility(staffId: number, facilityId: number): Promise<StaffDetailResponse> {
  const res = await http.delete<StaffDetailResponse>(`/staff/${staffId}/facilities/${facilityId}`);
  return res.data;
}

export async function listStaffByFacility(facilityId: number): Promise<StaffResponse[]> {
  const res = await http.get<StaffResponse[]>(`/facilities/${facilityId}/staff`);
  return res.data;
}

export const DEPARTMENTS: StaffDepartment[] = ["NURSING", "CARE", "ADMINISTRATION", "MANAGEMENT", "MAINTENANCE", "OTHER"];
export const EMPLOYMENT_TYPES: StaffEmploymentType[] = ["FULL_TIME", "PART_TIME", "AGENCY", "VOLUNTEER"];
export const STATUSES: StaffStatus[] = ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"];

export function fmtDepartment(d: StaffDepartment): string {
  return { NURSING: "Nursing", CARE: "Care", ADMINISTRATION: "Administration", MANAGEMENT: "Management", MAINTENANCE: "Maintenance", OTHER: "Other" }[d];
}

export function fmtEmploymentType(e: StaffEmploymentType): string {
  return { FULL_TIME: "Full Time", PART_TIME: "Part Time", AGENCY: "Agency", VOLUNTEER: "Volunteer" }[e];
}

export function fmtStatus(s: StaffStatus): string {
  return { ACTIVE: "Active", INACTIVE: "Inactive", ON_LEAVE: "On Leave", TERMINATED: "Terminated" }[s];
}
