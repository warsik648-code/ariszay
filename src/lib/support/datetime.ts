const MADRID_TZ = "Europe/Madrid";

/** Format a Date in Europe/Madrid, e.g. "27 July 2026, 14:30 CET". */
export function formatMadridDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(d);

  // en-GB yields like "27 July 2026, 14:30 CEST" — normalize comma spacing
  return formatted.replace(",", ",");
}

export function formatMadridDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
