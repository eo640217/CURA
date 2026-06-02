import { http, HttpResponse } from 'msw';
import { db } from './db';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? 'http://localhost:8080/api/v1';

const USERS: Record<string, { password: string; role: 'ADMIN' | 'STAFF' }> = {
  admin: { password: 'password', role: 'ADMIN' },
  staff: { password: 'password', role: 'STAFF' },
};

export const handlers = [

  // ── Auth ─────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const { username, password } = await request.json() as { username: string; password: string };
    const user = USERS[username];
    if (!user || user.password !== password) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({ token: 'mock-token', username, role: user.role });
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string; role: 'ADMIN' | 'STAFF' };
    const u = db.users.create(body);
    return HttpResponse.json(u, { status: 201 });
  }),

  // ── Facilities ────────────────────────────────────────────────────────────
  http.get(`${BASE}/facilities`, () =>
    HttpResponse.json(db.facilities.list())),

  http.get(`${BASE}/facilities/:id`, ({ params }) => {
    const f = db.facilities.get(Number(params.id));
    if (!f) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(f);
  }),

  http.post(`${BASE}/facilities`, async ({ request }) => {
    const body = await request.json() as { name: string; address: string };
    return HttpResponse.json(db.facilities.create(body), { status: 201 });
  }),

  http.patch(`${BASE}/facilities/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<{ name: string; address: string }>;
    const f = db.facilities.patch(Number(params.id), body);
    if (!f) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(f);
  }),

  // ── Units ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/facilities/:facilityId/units`, ({ params }) =>
    HttpResponse.json(db.units.listByFacility(Number(params.facilityId)))),

  http.post(`${BASE}/facilities/:facilityId/units`, async ({ params, request }) => {
    const body = await request.json() as { name: string; type: string; capacity: number };
    return HttpResponse.json(db.units.create(Number(params.facilityId), body), { status: 201 });
  }),

  http.patch(`${BASE}/units/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<{ name: string; type: string; capacity: number }>;
    const u = db.units.patch(Number(params.id), body);
    if (!u) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(u);
  }),

  http.delete(`${BASE}/units/:id`, ({ params }) => {
    db.units.delete(Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Residents ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/residents/directory`, ({ request }) => {
    const url    = new URL(request.url);
    const q      = url.searchParams.get('q') ?? '';
    const page   = Number(url.searchParams.get('page') ?? 0);
    const size   = Number(url.searchParams.get('size') ?? 20);
    return HttpResponse.json(db.residents.directory(q, page, size));
  }),

  http.get(`${BASE}/units/:unitId/residents`, ({ params }) =>
    HttpResponse.json(db.residents.listByUnit(Number(params.unitId)))),

  http.post(`${BASE}/units/:unitId/residents`, async ({ params, request }) => {
    const body = await request.json() as { firstName: string; lastName: string; dateOfBirth?: string | null; roomNumber?: string | null };
    return HttpResponse.json(db.residents.create(Number(params.unitId), body), { status: 201 });
  }),

  http.patch(`${BASE}/residents/:id/transfer`, async ({ params, request }) => {
    const body = await request.json() as { toUnitId: number; roomNumber?: string | null };
    const r = db.residents.transfer(Number(params.id), body);
    if (!r) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(r);
  }),

  http.get(`${BASE}/residents/:id`, ({ params }) => {
    const r = db.residents.get(Number(params.id));
    if (!r) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(r);
  }),

  http.put(`${BASE}/residents/:id`, async ({ params, request }) => {
    const body = await request.json() as { roomNumber?: string };
    const residents = db.residents;
    const detail = residents.get(Number(params.id));
    if (!detail) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(detail);
  }),

  // ── Notes ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/residents/:residentId/notes`, ({ params }) =>
    HttpResponse.json(db.notes.listByResident(Number(params.residentId)))),

  http.post(`${BASE}/residents/:residentId/notes`, async ({ params, request }) => {
    const body = await request.json() as { body: string };
    return HttpResponse.json(db.notes.create(Number(params.residentId), body.body, 'admin'), { status: 201 });
  }),

  // ── Photo ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/residents/:residentId/photo-url`, () =>
    HttpResponse.json(null)),

  // ── Activity ──────────────────────────────────────────────────────────────
  http.get(`${BASE}/activity`, ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 10);
    return HttpResponse.json(db.activity.list(limit));
  }),

  // ── Users ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/users`, () =>
    HttpResponse.json(db.users.list())),
];
