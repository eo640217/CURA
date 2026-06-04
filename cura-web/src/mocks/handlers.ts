import { http, HttpResponse } from 'msw';
import { db } from './db';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? 'http://localhost:8080/api/v1';

const USERS: Record<string, { password: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' }> = {
  superadmin: { password: 'password', role: 'SUPER_ADMIN' },
  admin: { password: 'password', role: 'ADMIN' },
  staff: { password: 'password', role: 'STAFF' },
};

export const handlers = [

  // ── Auth ─────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;

    if (body.orgCode && body.userNumber) {
      const org = db.organizations.list().find((o: any) => o.orgCode === body.orgCode);
      if (!org || body.password !== 'password')
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      const found = db.staff.list().find((s: any) => s.userNumber === body.userNumber)
                 ?? db.users.list().find((u: any) => u.userNumber === body.userNumber);
      if (!found) return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      const role = (found as any).role ?? 'STAFF';
      const uname = (found as any).username ?? `${(found as any).firstName} ${(found as any).lastName}`;
      return HttpResponse.json({ token: 'mock-token', username: uname, role, userNumber: body.userNumber, orgCode: body.orgCode });
    }

    const user = USERS[body.username as string];
    if (!user || user.password !== body.password)
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    const mockUser = db.users.list().find((u: any) => u.username === body.username);
    return HttpResponse.json({ token: 'mock-token', username: body.username, role: user.role, userNumber: mockUser?.userNumber ?? null, orgCode: 'ORG001' });
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

  // ── Staff ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/staff`, ({ request }) => {
    const url        = new URL(request.url);
    const q          = url.searchParams.get('q');
    const status     = url.searchParams.get('status');
    const department = url.searchParams.get('department');
    const page       = Number(url.searchParams.get('page') ?? 0);
    const size       = Number(url.searchParams.get('size') ?? 20);
    return HttpResponse.json(db.staff.search(q, status, department, page, size));
  }),

  http.get(`${BASE}/staff/:id`, ({ params }) => {
    const s = db.staff.get(Number(params.id));
    if (!s) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(db.staff.toDetail(s));
  }),

  http.post(`${BASE}/staff`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json(db.staff.create(body), { status: 201 });
  }),

  http.put(`${BASE}/staff/:id`, async ({ params, request }) => {
    const body = await request.json() as any;
    const updated = db.staff.update(Number(params.id), body);
    if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.patch(`${BASE}/staff/:id/status`, async ({ params, request }) => {
    const body = await request.json() as { status: string };
    const updated = db.staff.patchStatus(Number(params.id), body.status);
    if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.delete(`${BASE}/staff/:id`, ({ params }) => {
    db.staff.delete(Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/staff/:staffId/facilities/:facilityId`, ({ params }) => {
    const updated = db.staff.assignFacility(Number(params.staffId), Number(params.facilityId));
    if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.delete(`${BASE}/staff/:staffId/facilities/:facilityId`, ({ params }) => {
    const updated = db.staff.removeFacility(Number(params.staffId), Number(params.facilityId));
    if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.get(`${BASE}/facilities/:facilityId/staff`, ({ params }) =>
    HttpResponse.json(db.staff.listByFacility(Number(params.facilityId)))),

  // ── Organizations ─────────────────────────────────────────────────────────
  http.get(`${BASE}/organizations`, () =>
    HttpResponse.json(db.organizations.list())),

  http.post(`${BASE}/organizations`, async ({ request }) => {
    const body = await request.json() as { name: string; contactEmail?: string; phone?: string };
    return HttpResponse.json(db.organizations.create(body), { status: 201 });
  }),

  http.put(`${BASE}/organizations/:id`, async ({ params, request }) => {
    const body = await request.json() as { name: string; contactEmail?: string; phone?: string };
    const updated = db.organizations.update(Number(params.id), body);
    if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.post(`${BASE}/organizations/:id/root-user`, async ({ params, request }) => {
    const body = await request.json() as { username: string; password: string };
    const u = db.users.create({ username: body.username, password: body.password, role: 'ADMIN' });
    return HttpResponse.json(u, { status: 201 });
  }),

  // ── Settings ──────────────────────────────────────────────────────────────
  http.patch(`${BASE}/profile/password`, async ({ request }) => {
    const { currentPassword } = await request.json() as { currentPassword: string; newPassword: string };
    if (currentPassword !== 'password') {
      return HttpResponse.json({ message: 'Current password is incorrect' }, { status: 422 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${BASE}/profile/username`, async ({ request }) => {
    const { newUsername } = await request.json() as { newUsername: string };
    const taken = db.users.list().some((u: any) => u.username === newUsername);
    if (taken) return HttpResponse.json({ message: 'Username already taken' }, { status: 409 });
    return HttpResponse.json({ userId: 1, username: newUsername, role: 'ADMIN', staffMember: null });
  }),

  // ── Profile ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/profile`, ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    // In mock mode the token is "mock-token"; derive username from the mock login cookie stored in localStorage
    // We can't access localStorage in a service worker, so we use a simpler approach:
    // parse the "username" from the token if it's a real JWT, else default to admin
    let username = 'admin';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.sub ?? 'admin';
    } catch { /* mock-token is not a real JWT */ }

    const mockUsers: Record<string, { id: number; role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' }> = {
      superadmin: { id: 1, role: 'SUPER_ADMIN' },
      admin:      { id: 2, role: 'ADMIN' },
      staff:      { id: 3, role: 'STAFF' },
    };
    const user = mockUsers[username] ?? mockUsers['admin'];
    const linked = db.staff.findByUserId(user.id);

    return HttpResponse.json({
      userId: user.id,
      username,
      role: user.role,
      staffMember: linked ? {
        id: linked.id,
        firstName: linked.firstName,
        lastName: linked.lastName,
        email: linked.email,
        phone: linked.phone,
        employeeNumber: linked.employeeNumber ?? null,
        jobTitle: linked.jobTitle,
        department: linked.department,
        employmentType: linked.employmentType,
        status: linked.status,
        hireDate: linked.hireDate,
      } : null,
    });
  }),
];
