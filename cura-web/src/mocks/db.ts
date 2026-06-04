import {
  seedFacilities, seedUnits, seedResidents,
  seedNotes, seedActivity, seedUsers, seedStaff, seedOrganizations,
} from './data';

let facilities = structuredClone(seedFacilities);
let units      = structuredClone(seedUnits);
let residents  = structuredClone(seedResidents);
let notes      = structuredClone(seedNotes);
const activity = structuredClone(seedActivity);
let users      = structuredClone(seedUsers);
let staff      = structuredClone(seedStaff);
let orgs       = structuredClone(seedOrganizations);
let nextId     = 300;

function uid() { return ++nextId; }

function recount(unitId: number) {
  const u = units.find(x => x.id === unitId);
  if (u) u.occupiedCount = residents.filter(r => r.unitId === unitId).length;
}

export const db = {
  facilities: {
    list: () => facilities,
    get:  (id: number) => facilities.find(f => f.id === id) ?? null,
    create: (body: { name: string; address: string }) => {
      const f = { id: uid(), name: body.name, address: body.address };
      facilities.push(f);
      return f;
    },
    patch: (id: number, body: Partial<{ name: string; address: string }>) => {
      const f = facilities.find(x => x.id === id);
      if (!f) return null;
      if (body.name    !== undefined) f.name    = body.name;
      if (body.address !== undefined) f.address = body.address;
      return f;
    },
  },

  units: {
    listByFacility: (facilityId: number) => units.filter(u => u.facilityId === facilityId),
    get: (id: number) => units.find(u => u.id === id) ?? null,
    create: (facilityId: number, body: { name: string; type: string; capacity: number }) => {
      const u = { id: uid(), facilityId, name: body.name, type: body.type as 'ROOM' | 'WING' | 'FLOOR', capacity: body.capacity, occupiedCount: 0 };
      units.push(u);
      return u;
    },
    patch: (id: number, body: Partial<{ name: string; type: string; capacity: number }>) => {
      const u = units.find(x => x.id === id);
      if (!u) return null;
      if (body.name     !== undefined) u.name     = body.name;
      if (body.type     !== undefined) u.type     = body.type as 'ROOM' | 'WING' | 'FLOOR';
      if (body.capacity !== undefined) u.capacity = body.capacity;
      return u;
    },
    delete: (id: number) => {
      units = units.filter(u => u.id !== id);
    },
  },

  residents: {
    listByUnit: (unitId: number) => residents.filter(r => r.unitId === unitId),
    get: (id: number) => {
      const r = residents.find(x => x.id === id);
      if (!r) return null;
      const unit = units.find(u => u.id === r.unitId);
      const facility = facilities.find(f => f.id === r.facilityId);
      return {
        id: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        dateOfBirth: r.dateOfBirth,
        roomNumber: r.roomNumber,
        unitId: r.unitId,
        unitName: unit?.name ?? '',
        unitType: unit?.type ?? 'ROOM',
        unitCapacity: unit?.capacity ?? null,
        facilityId: r.facilityId,
        facilityName: facility?.name ?? '',
        facilityAddress: facility?.address ?? null,
      };
    },
    create: (unitId: number, body: { firstName: string; lastName: string; dateOfBirth?: string | null; roomNumber?: string | null }) => {
      const unit = units.find(u => u.id === unitId);
      const r = {
        id: uid(),
        unitId,
        facilityId: unit?.facilityId ?? null,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ?? null,
        roomNumber: body.roomNumber ?? null,
        createdAt: new Date().toISOString(),
      };
      residents.push(r);
      recount(unitId);
      return r;
    },
    transfer: (id: number, body: { toUnitId: number; roomNumber?: string | null }) => {
      const r = residents.find(x => x.id === id);
      if (!r) return null;
      const oldUnit = r.unitId;
      const unit = units.find(u => u.id === body.toUnitId);
      r.unitId     = body.toUnitId;
      r.facilityId = unit?.facilityId ?? r.facilityId;
      r.roomNumber = body.roomNumber ?? r.roomNumber;
      recount(oldUnit);
      recount(body.toUnitId);
      return r;
    },
    directory: (q: string, page: number, size: number) => {
      const items = residents
        .filter(r => {
          if (!q) return true;
          const lower = q.toLowerCase();
          return (
            r.firstName.toLowerCase().includes(lower) ||
            r.lastName.toLowerCase().includes(lower) ||
            (r.roomNumber ?? '').toLowerCase().includes(lower)
          );
        })
        .map(r => {
          const unit     = units.find(u => u.id === r.unitId);
          const facility = facilities.find(f => f.id === r.facilityId);
          return {
            residentId:   r.id,
            firstName:    r.firstName,
            lastName:     r.lastName,
            dateOfBirth:  r.dateOfBirth,
            roomNumber:   r.roomNumber,
            unitId:       r.unitId ?? 0,
            unitName:     unit?.name ?? '',
            unitType:     unit?.type ?? '',
            unitCapacity: unit?.capacity ?? null,
            facilityId:   r.facilityId ?? 0,
            facilityName: facility?.name ?? '',
          };
        });
      const start = page * size;
      return {
        content:       items.slice(start, start + size),
        totalElements: items.length,
        totalPages:    Math.ceil(items.length / size),
        number:        page,
        size,
      };
    },
  },

  notes: {
    listByResident: (residentId: number) => notes.filter(n => n.residentId === residentId),
    create: (residentId: number, body: string, actor: string) => {
      const n = { id: uid(), residentId, body, createdAt: new Date().toISOString(), createdBy: actor };
      notes.push(n);
      return n;
    },
  },

  activity: {
    list: (limit: number) => activity.slice(0, limit),
  },

  users: {
    list: () => users,
    create: (body: { username: string; password: string; role: 'ADMIN' | 'STAFF' }) => {
      const u = { id: uid(), username: body.username, role: body.role };
      users.push(u);
      return u;
    },
  },

  staff: {
    toResponse: (s: typeof staff[0]) => ({
      id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email,
      phone: s.phone, employeeNumber: s.employeeNumber ?? null, username: s.username ?? null,
      jobTitle: s.jobTitle, department: s.department,
      employmentType: s.employmentType, status: s.status, hireDate: s.hireDate,
      createdAt: s.createdAt,
    }),
    toDetail: (s: typeof staff[0]) => ({
      id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email,
      phone: s.phone, employeeNumber: s.employeeNumber ?? null, username: s.username ?? null,
      jobTitle: s.jobTitle, department: s.department,
      employmentType: s.employmentType, status: s.status, hireDate: s.hireDate,
      dateOfBirth: s.dateOfBirth, notes: s.notes, userId: s.userId,
      facilities: facilities.filter(f => s.facilityIds.includes(f.id)).map(f => ({ id: f.id, name: f.name })),
      createdAt: s.createdAt, updatedAt: s.updatedAt,
    }),
    search: (q: string | null, status: string | null, department: string | null, page: number, size: number) => {
      const items = staff.filter(s => {
        if (q && !`${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (status && s.status !== status) return false;
        if (department && s.department !== department) return false;
        return true;
      });
      const start = page * size;
      return {
        content: items.slice(start, start + size).map(db.staff.toResponse),
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size) || 1,
        number: page,
        size,
      };
    },
    get: (id: number) => staff.find(s => s.id === id) ?? null,
    create: (body: { firstName: string; lastName: string; email: string; phone?: string; employeeNumber?: string; username?: string; jobTitle: string; department: string; employmentType: string; hireDate: string; dateOfBirth?: string; notes?: string }) => {
      const s = { id: uid(), ...body, phone: body.phone ?? null, employeeNumber: body.employeeNumber ?? null, username: body.username ?? null, dateOfBirth: body.dateOfBirth ?? null, notes: body.notes ?? null, userId: null, status: 'ACTIVE' as const, facilityIds: [] as number[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      staff.push(s as any);
      return db.staff.toDetail(s as any);
    },
    update: (id: number, body: { firstName: string; lastName: string; email: string; phone?: string; employeeNumber?: string; username?: string; jobTitle: string; department: string; employmentType: string; hireDate: string; dateOfBirth?: string; notes?: string }) => {
      const s = staff.find(x => x.id === id);
      if (!s) return null;
      Object.assign(s, { ...body, phone: body.phone ?? null, dateOfBirth: body.dateOfBirth ?? null, notes: body.notes ?? null, updatedAt: new Date().toISOString() });
      return db.staff.toDetail(s);
    },
    patchStatus: (id: number, status: string) => {
      const s = staff.find(x => x.id === id);
      if (!s) return null;
      s.status = status as any;
      s.updatedAt = new Date().toISOString();
      return db.staff.toDetail(s);
    },
    delete: (id: number) => {
      const s = staff.find(x => x.id === id);
      if (s) { s.status = 'TERMINATED' as any; s.updatedAt = new Date().toISOString(); }
    },
    assignFacility: (staffId: number, facilityId: number) => {
      const s = staff.find(x => x.id === staffId);
      if (!s) return null;
      if (!s.facilityIds.includes(facilityId)) s.facilityIds.push(facilityId);
      return db.staff.toDetail(s);
    },
    removeFacility: (staffId: number, facilityId: number) => {
      const s = staff.find(x => x.id === staffId);
      if (!s) return null;
      s.facilityIds = s.facilityIds.filter(id => id !== facilityId);
      return db.staff.toDetail(s);
    },
    list: () => staff,
    listByFacility: (facilityId: number) => staff.filter(s => s.facilityIds.includes(facilityId)).map(db.staff.toResponse),
    findByUserId: (userId: number) => staff.find(s => s.userId === userId) ?? null,
  },

  organizations: {
    toResponse: (o: typeof orgs[0]) => ({ ...o }),
    list: () => orgs.map(db.organizations.toResponse),
    get: (id: number) => orgs.find(o => o.id === id) ?? null,
    create: (body: { name: string; contactEmail?: string; phone?: string }) => {
      const o = { id: uid(), name: body.name, contactEmail: body.contactEmail ?? null, phone: body.phone ?? null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      orgs.push(o);
      return o;
    },
    update: (id: number, body: { name: string; contactEmail?: string; phone?: string }) => {
      const o = orgs.find(x => x.id === id);
      if (!o) return null;
      o.name = body.name;
      o.contactEmail = body.contactEmail ?? null;
      o.phone = body.phone ?? null;
      o.updatedAt = new Date().toISOString();
      return o;
    },
  },
};
