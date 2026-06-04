type FieldViolation = { field: string; message: string };

export function apiErrorMessage(err: any): string {
  const data = err?.response?.data;
  if (!data) return err?.message ?? "Request failed";

  // Surface individual field violations (validation errors)
  const violations: FieldViolation[] = data.violations;
  if (Array.isArray(violations) && violations.length > 0) {
    return violations.map((v) => `${v.field}: ${v.message}`).join("; ");
  }

  return data.message ?? data.error ?? err?.message ?? "Request failed";
}

export function apiFieldErrors(err: any): Record<string, string> {
  const violations: FieldViolation[] = err?.response?.data?.violations ?? [];
  return Object.fromEntries(violations.map((v) => [v.field, v.message]));
}
