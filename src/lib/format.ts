const STUDIO_TZ = "Asia/Almaty";

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const WEEKDAYS_RU = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return Number(parts.find((item) => item.type === type)?.value ?? "0");
}

export function studioNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: STUDIO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  return {
    year: part(parts, "year"),
    month: part(parts, "month"),
    day: part(parts, "day"),
    hour: part(parts, "hour"),
    minute: part(parts, "minute"),
  };
}

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function todayIso() {
  const now = studioNow();
  return toIsoDate(now.year, now.month, now.day);
}

export function addDaysIso(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function pickupDays(leadDays: number, count = 18) {
  const start = addDaysIso(todayIso(), Math.max(leadDays, 0));
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(addDaysIso(start, i));
  }
  return out;
}

export function isDatePast(iso: string) {
  return iso < todayIso();
}

export function formatPrice(tenge: number) {
  return `${tenge.toLocaleString("ru-RU")} ₸`;
}

export function formatDateRu(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS_RU[month - 1]}`;
}

export function weekdayShort(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(utc));
  const map: Record<string, string> = {
    Sun: "вс",
    Mon: "пн",
    Tue: "вт",
    Wed: "ср",
    Thu: "чт",
    Fri: "пт",
    Sat: "сб",
  };
  return map[weekday] ?? WEEKDAYS_RU[new Date(utc).getUTCDay()] ?? "";
}

export function dayNumber(iso: string) {
  return iso.split("-")[2]?.replace(/^0/, "") ?? iso;
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneInput(value: string) {
  const digits = phoneDigits(value).slice(0, 11);
  if (!digits) return "";
  let rest = digits;
  if (rest.startsWith("8")) rest = `7${rest.slice(1)}`;
  if (!rest.startsWith("7")) rest = `7${rest}`;
  rest = rest.slice(0, 11);
  const a = rest.slice(1, 4);
  const b = rest.slice(4, 7);
  const c = rest.slice(7, 9);
  const d = rest.slice(9, 11);
  let out = "+7";
  if (a) out += ` ${a}`;
  if (b) out += ` ${b}`;
  if (c) out += ` ${c}`;
  if (d) out += ` ${d}`;
  return out;
}

export function isCompletePhone(value: string) {
  return phoneDigits(value).length === 11;
}
