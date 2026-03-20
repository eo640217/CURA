import lexicon from "./lexicon";

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function format(template: string, vars?: Record<string, any>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`).toString());
}

/**
 * Usage:
 *  t("common.back")
 *  t("adminUsers.errors.createdMsg", { username: "bob", role: "STAFF" })
 */
export function t(path: string, vars?: Record<string, any>) {
  const v = getPath(lexicon, path);
  if (typeof v !== "string") return path; 
  return format(v, vars);
}

export default lexicon;
