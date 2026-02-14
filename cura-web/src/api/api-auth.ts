import { http } from "./http";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  username: string;
  role: "ADMIN" | "STAFF";
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await http.post<LoginResponse>("/auth/login", req);
  return res.data;
}
