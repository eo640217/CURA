import { apiGet } from "./http";

export function getResidentPhotoUrl(residentId: number) {
  return apiGet<string | null>(`/residents/${residentId}/photo-url`);
}