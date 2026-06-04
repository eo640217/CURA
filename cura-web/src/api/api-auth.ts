import { http } from "./http";

export type OrgLoginRequest  = { orgCode: string; userNumber: string; password: string };
export type UserLoginRequest = { username: string; password: string };
export type LoginRequest = OrgLoginRequest | UserLoginRequest;

export type LoginResponse = {
  token: string;
  username: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  userNumber: string | null;
  orgCode: string | null;
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await http.post<LoginResponse>("/auth/login", req);
  return res.data;
}

export async function setupPassword(token: string, newPassword: string): Promise<void> {
  await http.post("/auth/setup-password", { token, newPassword });
}
