import { http } from "./http";

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await http.patch("/profile/password", { currentPassword, newPassword });
}

export async function changeUsername(newUsername: string): Promise<{ username: string }> {
  const res = await http.patch<{ username: string }>("/profile/username", { newUsername });
  return res.data;
}
