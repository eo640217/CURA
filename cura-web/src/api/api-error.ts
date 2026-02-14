export function apiErrorMessage(err: any): string {
  return (
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message ??
    "Request failed"
  );
}
