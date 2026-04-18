/**
 * Shared slot generation utility for the patient-facing web app.
 * Mirror of the ERP service — kept in sync manually or extracted to a shared package later.
 */

export interface DayHours { open: string; close: string }
export type ClinicWorkingHours = Record<string, DayHours | null>;

export interface DoctorSchedule {
  doctorId: string;
  clinicId: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  sessionDurationMinutes: number;
  breaks: { start: string; end: string }[];
  dateOverrides: Record<string, DayHours | null>;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  slotId: string;
}

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function parseTime(t: string): number { const [h,m] = t.split(":").map(Number); return h*60+m; }
function formatTime(mins: number): string { return `${String(Math.floor(mins/60)).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`; }

export function generateSlots(
  date: Date,
  clinicHours: ClinicWorkingHours,
  schedule: DoctorSchedule,
  bookedTimes: string[] = []
): TimeSlot[] {
  const dayName = DAY_NAMES[date.getDay()];
  const dateKey = date.toISOString().split("T")[0];
  const override = schedule.dateOverrides?.[dateKey];
  if (override === null) return [];
  const clinicDay = clinicHours[dayName];
  if (!clinicDay) return [];
  if (!override && !schedule.availableDays.includes(dayName)) return [];
  const effectiveStart = Math.max(parseTime(clinicDay.open), parseTime(schedule.startTime));
  const effectiveEnd = Math.min(parseTime(clinicDay.close), parseTime(schedule.endTime));
  if (effectiveStart >= effectiveEnd) return [];
  const breakMins = new Set<number>();
  for (const br of schedule.breaks ?? []) {
    for (let t = parseTime(br.start); t < parseTime(br.end); t++) breakMins.add(t);
  }
  const slots: TimeSlot[] = [];
  const duration = schedule.sessionDurationMinutes || 30;
  for (let t = effectiveStart; t + duration <= effectiveEnd; t += duration) {
    const timeStr = formatTime(t);
    let inBreak = false;
    for (let bt = t; bt < t + duration; bt++) { if (breakMins.has(bt)) { inBreak = true; break; } }
    if (inBreak) continue;
    const slotDT = new Date(date); slotDT.setHours(Math.floor(t/60), t%60, 0, 0);
    if (slotDT <= new Date()) continue;
    slots.push({ time: timeStr, available: !bookedTimes.includes(timeStr), slotId: `${dateKey}_${timeStr}` });
  }
  return slots;
}

export function getDefaultSchedule(doctorId: string, clinicId: string): DoctorSchedule {
  return {
    doctorId, clinicId,
    availableDays: ["Sunday","Monday","Tuesday","Wednesday","Thursday"],
    startTime: "09:00", endTime: "17:00",
    sessionDurationMinutes: 30,
    breaks: [{ start: "13:00", end: "14:00" }],
    dateOverrides: {},
  };
}

export function getDefaultClinicHours(): ClinicWorkingHours {
  return {
    Sunday:    { open: "08:00", close: "20:00" },
    Monday:    { open: "08:00", close: "20:00" },
    Tuesday:   { open: "08:00", close: "20:00" },
    Wednesday: { open: "08:00", close: "20:00" },
    Thursday:  { open: "08:00", close: "20:00" },
    Friday:    null,
    Saturday:  { open: "10:00", close: "16:00" },
  };
}
