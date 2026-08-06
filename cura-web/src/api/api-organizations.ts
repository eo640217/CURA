import { http } from "./http";

export type OrganizationResponse = {
  id: number;
  name: string;
  contactEmail: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationCreateRequest = {
  name: string;
  contactEmail?: string;
  phone?: string;
};

export type OrganizationUpdateRequest = OrganizationCreateRequest;

export type CreateRootUserRequest = {
  username: string;
  password: string;
};

export type RootUserResponse = {
  id: number;
  username: string;
  role: string;
};

export type OrgBrandingResponse = {
  id: number;
  name: string;
  orgCode: string;
  logoUrl: string | null;
  primaryColor: string | null;
};

export async function getOrgBranding(orgCode: string): Promise<OrgBrandingResponse> {
  const res = await http.get<OrgBrandingResponse>(`/organizations/by-code/${orgCode}`);
  return res.data;
}

export async function listOrganizations(): Promise<OrganizationResponse[]> {
  const res = await http.get<OrganizationResponse[]>("/organizations");
  return res.data;
}

export async function createOrganization(req: OrganizationCreateRequest): Promise<OrganizationResponse> {
  const res = await http.post<OrganizationResponse>("/organizations", req);
  return res.data;
}

export async function updateOrganization(id: number, req: OrganizationUpdateRequest): Promise<OrganizationResponse> {
  const res = await http.put<OrganizationResponse>(`/organizations/${id}`, req);
  return res.data;
}

export async function createRootUser(orgId: number, req: CreateRootUserRequest): Promise<RootUserResponse> {
  const res = await http.post<RootUserResponse>(`/organizations/${orgId}/root-user`, req);
  return res.data;
}
