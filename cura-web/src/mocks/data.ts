export const seedFacilities = [
  { id: 1, name: 'Sunrise Memory Care',    address: '123 Maple Street, Portland, OR 97201' },
  { id: 2, name: 'Oakwood Senior Living',  address: '456 Oak Avenue, Portland, OR 97202' },
];

export const seedUnits = [
  { id: 1, facilityId: 1, name: 'East Wing',     type: 'WING' as const, capacity: 12, occupiedCount: 3 },
  { id: 2, facilityId: 1, name: 'West Wing',     type: 'WING' as const, capacity: 10, occupiedCount: 2 },
  { id: 3, facilityId: 1, name: 'Ground Floor',  type: 'FLOOR' as const, capacity: 8,  occupiedCount: 1 },
  { id: 4, facilityId: 2, name: 'Room Block A',  type: 'ROOM' as const, capacity: 10, occupiedCount: 2 },
  { id: 5, facilityId: 2, name: 'Room Block B',  type: 'ROOM' as const, capacity: 10, occupiedCount: 2 },
];

export const seedResidents = [
  { id: 1,  unitId: 1, facilityId: 1, firstName: 'Margaret', lastName: 'Thompson', dateOfBirth: '1938-03-14', roomNumber: 'E-101', createdAt: '2024-01-10T09:00:00Z' },
  { id: 2,  unitId: 1, facilityId: 1, firstName: 'Harold',   lastName: 'Jenkins',  dateOfBirth: '1934-07-22', roomNumber: 'E-102', createdAt: '2024-01-10T09:01:00Z' },
  { id: 3,  unitId: 1, facilityId: 1, firstName: 'Dorothy',  lastName: 'Kaufman',  dateOfBirth: '1940-11-05', roomNumber: 'E-103', createdAt: '2024-01-10T09:02:00Z' },
  { id: 4,  unitId: 2, facilityId: 1, firstName: 'Robert',   lastName: 'Sanchez',  dateOfBirth: '1936-01-30', roomNumber: 'W-101', createdAt: '2024-01-10T09:03:00Z' },
  { id: 5,  unitId: 2, facilityId: 1, firstName: 'Eleanor',  lastName: 'Vasquez',  dateOfBirth: '1942-09-18', roomNumber: 'W-102', createdAt: '2024-01-10T09:04:00Z' },
  { id: 6,  unitId: 3, facilityId: 1, firstName: 'George',   lastName: 'Whitmore', dateOfBirth: '1933-04-11', roomNumber: 'G-101', createdAt: '2024-01-10T09:05:00Z' },
  { id: 7,  unitId: 4, facilityId: 2, firstName: 'Patricia', lastName: 'Nguyen',   dateOfBirth: '1944-06-02', roomNumber: 'A-201', createdAt: '2024-01-10T09:06:00Z' },
  { id: 8,  unitId: 4, facilityId: 2, firstName: 'William',  lastName: "O'Brien",  dateOfBirth: '1939-12-08', roomNumber: 'A-202', createdAt: '2024-01-10T09:07:00Z' },
  { id: 9,  unitId: 5, facilityId: 2, firstName: 'Betty',    lastName: 'Chambers', dateOfBirth: '1941-08-25', roomNumber: 'B-301', createdAt: '2024-01-10T09:08:00Z' },
  { id: 10, unitId: 5, facilityId: 2, firstName: 'Frank',    lastName: 'Deluca',   dateOfBirth: '1937-02-19', roomNumber: 'B-302', createdAt: '2024-01-10T09:09:00Z' },
];

export const seedNotes = [
  { id: 1, residentId: 1, body: 'Resident responded well to morning therapy session.', createdAt: '2024-06-01T08:30:00Z', createdBy: 'staff' },
  { id: 2, residentId: 1, body: 'Family visited this afternoon. Resident was in good spirits.', createdAt: '2024-06-02T15:00:00Z', createdBy: 'admin' },
];

export const seedActivity = [
  { id: 'a1', type: 'RESIDENT' as const,  title: 'New resident admitted — Margaret Thompson',  status: 'COMPLETED' as const,  createdAt: '2024-06-01T09:00:00Z', actor: 'admin' },
  { id: 'a2', type: 'FACILITY' as const,  title: 'Oakwood Senior Living profile updated',       status: 'COMPLETED' as const,  createdAt: '2024-06-01T11:30:00Z', actor: 'admin' },
  { id: 'a3', type: 'UNIT' as const,      title: 'East Wing capacity review',                   status: 'IN_REVIEW' as const,  createdAt: '2024-06-01T14:00:00Z', actor: 'staff' },
  { id: 'a4', type: 'INCIDENT' as const,  title: 'Fall incident reported — Room B-301',         status: 'PENDING' as const,    createdAt: '2024-06-02T07:45:00Z', actor: 'staff' },
  { id: 'a5', type: 'HOURS' as const,     title: 'Weekly staff hours submitted',                status: 'COMPLETED' as const,  createdAt: '2024-06-02T10:00:00Z', actor: 'staff' },
  { id: 'a6', type: 'RESIDENT' as const,  title: 'Resident transfer — Robert Sanchez to W-101', status: 'COMPLETED' as const, createdAt: '2024-06-02T13:15:00Z', actor: 'admin' },
];

export const seedUsers = [
  { id: 1, username: 'superadmin', role: 'SUPER_ADMIN' as const, userNumber: '100000' },
  { id: 2, username: 'admin',      role: 'ADMIN'       as const, userNumber: '100001' },
  { id: 3, username: 'staff',      role: 'STAFF'       as const, userNumber: '100002' },
];

export const seedOrganizations = [
  { id: 1, name: 'Sunrise Health Group', orgCode: 'SUNRISE', contactEmail: 'ops@sunrisehealth.com', phone: '+1 (503) 555-0100', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Oakwood Care Network', orgCode: 'OAKWOOD',  contactEmail: 'admin@oakwoodcare.com',  phone: '+1 (503) 555-0200', createdAt: '2023-06-15T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

export const seedStaff = [
  { id: 101, firstName: 'Sarah',   lastName: 'Mitchell', email: 'sarah.mitchell@cura.com',  phone: '+1 (503) 555-0101', userNumber: '500000', employeeNumber: 'EMP-500000', username: 'sarah.mitchell', jobTitle: 'Head Nurse',         department: 'NURSING'        as const, employmentType: 'FULL_TIME' as const, status: 'ACTIVE'    as const, hireDate: '2020-03-15', dateOfBirth: '1985-06-10', notes: null,                              userId: null,  facilityIds: [1],    createdAt: '2020-03-15T09:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 102, firstName: 'James',   lastName: 'Okafor',   email: 'james.okafor@cura.com',    phone: '+1 (503) 555-0102', userNumber: '500001', employeeNumber: 'EMP-500001', username: 'james.okafor',   jobTitle: 'Care Assistant',     department: 'CARE'           as const, employmentType: 'FULL_TIME' as const, status: 'ACTIVE'    as const, hireDate: '2021-07-01', dateOfBirth: '1990-11-22', notes: null,                              userId: null,  facilityIds: [1],    createdAt: '2021-07-01T09:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 103, firstName: 'Linda',   lastName: 'Park',     email: 'linda.park@cura.com',      phone: null,                userNumber: '500002', employeeNumber: 'EMP-500002', username: 'linda.park',     jobTitle: 'Facility Manager',   department: 'MANAGEMENT'     as const, employmentType: 'FULL_TIME' as const, status: 'ACTIVE'    as const, hireDate: '2019-01-10', dateOfBirth: '1978-03-05', notes: 'Senior manager, oversees both sites.', userId: 1, facilityIds: [1, 2], createdAt: '2019-01-10T09:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 104, firstName: 'Marcus',  lastName: 'Rivera',   email: 'marcus.rivera@cura.com',   phone: '+1 (503) 555-0104', userNumber: '500003', employeeNumber: 'EMP-500003', username: 'marcus.rivera',  jobTitle: 'Registered Nurse',   department: 'NURSING'        as const, employmentType: 'PART_TIME' as const, status: 'ON_LEAVE'  as const, hireDate: '2022-04-20', dateOfBirth: '1992-08-14', notes: null,                              userId: null,  facilityIds: [2],    createdAt: '2022-04-20T09:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 105, firstName: 'Amelia',  lastName: 'Stone',    email: 'amelia.stone@cura.com',    phone: '+1 (503) 555-0105', userNumber: '500004', employeeNumber: 'EMP-500004', username: 'amelia.stone',   jobTitle: 'Administrator',      department: 'ADMINISTRATION' as const, employmentType: 'FULL_TIME' as const, status: 'ACTIVE'    as const, hireDate: '2023-02-01', dateOfBirth: '1988-01-30', notes: null,                              userId: null,  facilityIds: [1],    createdAt: '2023-02-01T09:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 106, firstName: 'Tom',     lastName: 'Harris',   email: 'tom.harris@cura.com',      phone: null,                userNumber: '500005', employeeNumber: 'EMP-500005', username: 'tom.harris',     jobTitle: 'Maintenance Tech',   department: 'MAINTENANCE'    as const, employmentType: 'AGENCY'    as const, status: 'INACTIVE'  as const, hireDate: '2023-06-15', dateOfBirth: '1980-05-17', notes: null,                              userId: null,  facilityIds: [2],    createdAt: '2023-06-15T09:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];
