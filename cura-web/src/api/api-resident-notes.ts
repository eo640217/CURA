import { apiGet, apiPost } from "./http";

export type ResidentNote = {
  id: number;
  residentId: number;
  body: string;
  createdAt: string;
  createdBy?: string | null;
};

export function listResidentNotes(residentId: number) {
  return apiGet<ResidentNote[]>(`/residents/${residentId}/notes`);
}

export function createResidentNote(residentId: number, payload: { body: string }) {
  return apiPost<ResidentNote>(`/residents/${residentId}/notes`, payload);
}