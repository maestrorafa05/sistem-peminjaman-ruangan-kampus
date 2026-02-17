/**
 * Convert datetime-local input value (YYYY-MM-DDTHH:mm) to ISO-like string with seconds (YYYY-MM-DDTHH:mm:ss)
 * WITHOUT timezone (DateTime "unspecified") so backend .NET DateTime parses as local/unspecified.
 */
export function toApiDateTime(localValue: string): string {
  // localValue typically: 2026-02-16T09:00
  if (!localValue) return localValue;
  return localValue.length === 16 ? `${localValue}:00` : localValue;
}

export function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}
