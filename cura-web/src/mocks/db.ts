import {
  seedFacilities, seedUnits, seedResidents,
  seedNotes, seedActivity, seedUsers,
} from './data';

let facilities = structuredClone(seedFacilities);
let units      = structuredClone(seedUnits);
let residents  = structuredClone(seedResidents);
let notes      = structuredClone(seedNotes);
const activity = structuredClone(seedActivity);
let users      = structuredClone(seedUsers);
let nextId     = 200;

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
};
