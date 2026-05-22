/** Trim whitespace/quotes GCP and CI often add around secrets and contract IDs. */
export function cleanEnvString(value: string | undefined | null): string | null {
  if (value == null) return null;
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.length > 0 ? s : null;
}
