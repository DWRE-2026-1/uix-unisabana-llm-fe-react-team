const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatConversationDate(value) {
  const date = toDate(value);
  if (!date) return "Sin fecha";

  const now = new Date();
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === -1) return "Ayer";
  if (diffDays === 1) return "Mañana";
  if (diffDays > -7 && diffDays < 0) {
    return RELATIVE_FORMATTER.format(diffDays, "day");
  }

  return DATE_FORMATTER.format(date);
}
