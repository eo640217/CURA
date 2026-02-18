import { http } from "./http";

export type RegisterRequest = {
  username: string;
  password: string;
  role: "ADMIN" | "STAFF";
};

export type RegisterResponse = {
  id: number;
  username: string;
  role: "ADMIN" | "STAFF";
};

export type UserResponse = {
  id: number;
  username: string;
  role: "ADMIN" | "STAFF";
};

export async function registerUser(req: RegisterRequest): Promise<RegisterResponse> {
  const res = await http.post<RegisterResponse>("/auth/register", req);
  return res.data;
}

export async function listUsers(username?: string): Promise<UserResponse[]> {
  const res = await http.get<UserResponse[]>("/users", {
    params: username?.trim() ? { username: username.trim() } : {},
  });
  return res.data;
}
