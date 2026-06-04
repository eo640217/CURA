import { http } from "./http";

export type ProfileStaffSummary = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  employeeNumber: string | null;
  jobTitle: string;
  department: string;
  employmentType: string;
  status: string;
  hireDate: string | null;
};

export type ProfileResponse = {
  userId: number;
  username: string;
  role: "ADMIN" | "STAFF";
  staffMember: ProfileStaffSummary | null;
};

export async function getProfile(): Promise<ProfileResponse> {
  const res = await http.get<ProfileResponse>("/profile");
  return res.data;
}
