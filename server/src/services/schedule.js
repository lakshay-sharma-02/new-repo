/** Schedule helpers: laundry days, drop-off windows and ETA calculation. */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function minutes(hhmm) {
  const [h, m] = String(hhmm || "").split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function dayName(date = new Date()) {
  return DAY_NAMES[date.getDay()];
}

export function isLaundryDay(schedule, date = new Date()) {
  return (schedule?.laundryDays || []).includes(dayName(date));
}

export function isWithinDropoff(schedule, date = new Date()) {
  const start = minutes(schedule?.dropoffStart);
  const end = minutes(schedule?.dropoffEnd);
  if (start === null || end === null) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  return now >= start && now <= end;
}

/**
 * Estimated ready date: the current cycle if today is a laundry day and the
 * cut-off has not passed, otherwise the next laundry day. Ready at 18:00.
 */
export function computeEstimatedReady(schedule, from = new Date()) {
  const turnaround = Number(schedule?.turnaroundDays) || 2;
  const cutoff = minutes(schedule?.cutoffTime || schedule?.dropoffEnd || "12:00") ?? 12 * 60;
  const now = from.getHours() * 60 + from.getMinutes();
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);

  let cycleStart = null;
  if (isLaundryDay(schedule, from) && now <= cutoff) {
    cycleStart = new Date(today);
  } else {
    for (let offset = 1; offset <= 7; offset++) {
      const candidate = new Date(today);
      candidate.setDate(candidate.getDate() + offset);
      if (isLaundryDay(schedule, candidate)) {
        cycleStart = candidate;
        break;
      }
    }
  }
  if (!cycleStart) cycleStart = new Date(today);

  const ready = new Date(cycleStart);
  ready.setDate(ready.getDate() + turnaround);
  ready.setHours(18, 0, 0, 0);
  return ready;
}

/**
 * Returns { ok, lateDrop, reason }. A non-laundry day is rejected; a
 * submission outside the drop-off window is accepted and flagged as a late
 * drop so staff can see it.
 */
export function submissionWindow(schedule, now = new Date()) {
  if (!isLaundryDay(schedule, now)) {
    return {
      ok: false,
      lateDrop: false,
      reason: `No laundry drop-off today for block ${schedule?.hostelBlock || ""}. Laundry days: ${(schedule?.laundryDays || []).join(", ")}.`,
    };
  }
  return { ok: true, lateDrop: !isWithinDropoff(schedule, now) };
}
