import { supabase } from "@/integrations/supabase/client";

export type AvailabilityRecord = {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0=Sun .. 6=Sat
  start_time: string; // 24h "HH:MM"
  end_time: string; // 24h "HH:MM"
  status: string;
  created_at: string;
  updated_at: string;
};

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Convert 24h "HH:MM" to 12h "h:mm AM/PM" for display. */
export function to12h(time: string): string {
  const parts = time.split(":");
  let h = parseInt(parts[0] ?? "0", 10);
  const m = parts[1] ?? "00";
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${suffix}`;
}

/** Convert 12h "h:mm AM/PM" back to 24h "HH:MM". */
export function to24h(time: string): string {
  const trimmed = time.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return "";
  let h = parseInt(match[1] ?? "0", 10);
  const m = match[2] ?? "00";
  const suffix = match[3] ?? "AM";
  if (suffix === "PM" && h !== 12) h += 12;
  if (suffix === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

/** Fetch the current doctor's availability records (ordered by day, then start). */
export async function fetchDoctorAvailability(doctorId: string): Promise<AvailabilityRecord[]> {
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("status", "active")
    .order("day_of_week")
    .order("start_time");

  if (error) throw error;
  return (data as AvailabilityRecord[]) || [];
}

/**
 * Compare two day-of-week records for overlap, given the doctor already has a
 * record on that day. Used for client-side validation before insert.
 */
export function isOverlapping(
  day: number,
  start: string,
  end: string,
  existing: AvailabilityRecord[],
): boolean {
  const s = to24h(start);
  const e = to24h(end);
  if (!s || !e || s >= e) return true;
  return existing.some(
    (r) => r.day_of_week === day && r.status === "active" && s < r.end_time && e > r.start_time,
  );
}

/** Add an availability record for the current doctor. */
export async function createAvailability(
  doctorId: string,
  day: number,
  start12h: string,
  end12h: string,
): Promise<AvailabilityRecord> {
  const start = to24h(start12h);
  const end = to24h(end12h);
  if (!start || !end || start >= end) {
    throw new Error("Please provide a valid start and end time.");
  }

  const existing = await fetchDoctorAvailability(doctorId);
  if (isOverlapping(day, start, end, existing)) {
    throw new Error("This time range overlaps with an existing availability slot.");
  }

  const { data, error } = await supabase
    .from("doctor_availability")
    .insert({
      doctor_id: doctorId,
      day_of_week: day,
      start_time: start,
      end_time: end,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as AvailabilityRecord;
}

/** Remove (soft-delete) an availability record. */
export async function deleteAvailability(id: string): Promise<void> {
  const { error } = await supabase
    .from("doctor_availability")
    .update({ status: "inactive" })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Fetch the bookable time slots for a doctor on a given date using the
 * get_available_slots RPC. Falls back gracefully (all standard slots) if the
 * function does not exist yet (i.e. migration not applied).
 */
export async function fetchAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc("get_available_slots", {
      p_doctor_id: doctorId,
      p_date: date,
    });
    if (error) throw error;
    const rows = (data as { slot: string; available: boolean }[]) || [];
    return rows.filter((r) => r.available).map((r) => r.slot);
  } catch (err) {
    console.warn("get_available_slots not available, using defaults:", err);
    return [];
  }
}
