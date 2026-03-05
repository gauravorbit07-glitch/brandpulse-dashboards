/**
 * Date & Timezone Utilities
 * 
 * All timestamps displayed in the app should go through these helpers
 * to ensure consistent local-timezone formatting.
 * 
 * Uses date-fns + date-fns-tz for reliable timezone handling.
 */

import { format, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, startOfDay, addDays, isBefore, isAfter } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

// ─── Local Timezone ────────────────────────────────────────────────────────

/** Get the user's IANA timezone string (e.g. "Asia/Kolkata") */
export const getLocalTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// ─── Epoch → Date ──────────────────────────────────────────────────────────

/** Convert a Unix epoch (seconds) to a JS Date */
export const epochToDate = (epoch: number): Date => new Date(epoch * 1000);

/** Convert a Unix epoch (seconds) to a local-formatted date string */
export const formatEpoch = (epoch: number, fmt: string = "MMM dd, yyyy 'at' h:mm a"): string => {
  const tz = getLocalTimezone();
  return formatInTimeZone(epochToDate(epoch), tz, fmt);
};

/** Format a Date or ISO string in the user's local timezone */
export const formatLocalDate = (date: Date | string, fmt: string = "MMM dd, yyyy 'at' h:mm a"): string => {
  const tz = getLocalTimezone();
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return formatInTimeZone(d, tz, fmt);
};

/** Format date as short (e.g. "Mar 12, 2026") */
export const formatShortDate = (date: Date | string | number): string => {
  if (typeof date === "number") return formatEpoch(date, "MMM dd, yyyy");
  return formatLocalDate(date, "MMM dd, yyyy");
};

/** Format date with full time (e.g. "Mar 12, 2026 at 9:31 PM") */
export const formatFullDateTime = (date: Date | string | number): string => {
  if (typeof date === "number") return formatEpoch(date, "MMM dd, yyyy 'at' h:mm a");
  return formatLocalDate(date, "MMM dd, yyyy 'at' h:mm a");
};

// ─── Relative Time ─────────────────────────────────────────────────────────

/** Get a human-readable relative time string (e.g. "in 7 days", "3 hours ago") */
export const getRelativeTime = (date: Date | number): string => {
  const d = typeof date === "number" ? epochToDate(date) : date;
  if (isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
};

// ─── Plan Expiry Helpers ───────────────────────────────────────────────────

export interface PlanExpiryInfo {
  expiryDate: Date;
  formattedExpiry: string;
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // within 3 days
  relativeText: string;
  /** Progress percentage of trial (0-100). Pass trialDurationDays for accuracy */
  trialProgress: number;
  trialDaysUsed: number;
  trialDurationDays: number;
}

/**
 * Compute plan expiry info from a Unix epoch timestamp.
 * @param planExpiresAt  Unix epoch in seconds
 * @param trialDurationDays  Total trial length (default 7 for free, 14 for paid)
 */
export const getPlanExpiryInfo = (
  planExpiresAt: number,
  trialDurationDays: number = 14
): PlanExpiryInfo => {
  const now = new Date();
  const expiryDate = epochToDate(planExpiresAt);
  
  const daysRemaining = Math.max(0, differenceInDays(expiryDate, now));
  const hoursRemaining = Math.max(0, differenceInHours(expiryDate, now));
  const isExpired = isBefore(expiryDate, now);
  const isExpiringSoon = !isExpired && daysRemaining <= 3;
  
  const trialDaysUsed = Math.max(0, trialDurationDays - daysRemaining);
  const trialProgress = Math.min(100, Math.round((trialDaysUsed / trialDurationDays) * 100));

  return {
    expiryDate,
    formattedExpiry: formatFullDateTime(expiryDate),
    daysRemaining,
    hoursRemaining,
    isExpired,
    isExpiringSoon,
    relativeText: isExpired ? "Expired" : getRelativeTime(expiryDate),
    trialProgress,
    trialDaysUsed,
    trialDurationDays,
  };
};

// ─── Analytics Cooldown (Midnight-Rounding) ────────────────────────────────

/**
 * Calculate when the next analytics run is available, using midnight-rounding rules:
 * 
 * - Cooldown ≥ 48hrs: block until midnight of the target day
 *   e.g. ran on Mar 5 4PM with 48hr cooldown → blocked until Mar 7 12:00 AM (midnight)
 * 
 * - Cooldown = 24hrs: block until next midnight
 *   e.g. ran on Mar 5 4PM with 24hr cooldown → blocked until Mar 6 12:00 AM (midnight)
 * 
 * - Cooldown < 24hrs: exact timestamp (no rounding)
 *   e.g. ran on Mar 5 4PM with 1hr cooldown → blocked until Mar 5 5:00 PM
 * 
 * @param lastRunAt  When the analysis was last run (Date or ISO string)
 * @param cooldownHours  Cooldown period in hours
 * @returns The Date when the next run becomes available
 */
export const getNextAnalyticsAvailableAt = (
  lastRunAt: Date | string,
  cooldownHours: number
): Date => {
  const lastRun = typeof lastRunAt === "string" ? new Date(lastRunAt) : lastRunAt;
  
  if (cooldownHours >= 48) {
    // Round to midnight of the target day
    // e.g. 48hrs from Mar 5 4PM = Mar 7 4PM → round to Mar 8 12:00 AM (start of Mar 8)
    // But the requirement says "block until 7th March midnight" which means start of Mar 7
    // So: add cooldownHours, then take start of that day (midnight)
    const rawTarget = new Date(lastRun.getTime() + cooldownHours * 60 * 60 * 1000);
    return startOfDay(rawTarget);
  }
  
  if (cooldownHours >= 24) {
    // Block until next midnight
    // e.g. 24hrs from Mar 5 4PM = Mar 6 4PM → round to Mar 6 12:00 AM (start of day)
    const rawTarget = new Date(lastRun.getTime() + cooldownHours * 60 * 60 * 1000);
    return startOfDay(rawTarget);
  }
  
  // < 24hrs: exact timestamp
  return new Date(lastRun.getTime() + cooldownHours * 60 * 60 * 1000);
};

/**
 * Check if analytics generation is currently blocked based on cooldown rules.
 */
export const isAnalyticsCooldownActive = (
  lastRunAt: Date | string,
  cooldownHours: number
): boolean => {
  const nextAvailable = getNextAnalyticsAvailableAt(lastRunAt, cooldownHours);
  return isAfter(nextAvailable, new Date());
};

/**
 * Get a human-readable string for when the next analytics run is available.
 */
export const getAnalyticsCooldownText = (
  lastRunAt: Date | string,
  cooldownHours: number
): string | null => {
  const nextAvailable = getNextAnalyticsAvailableAt(lastRunAt, cooldownHours);
  const now = new Date();
  
  if (isBefore(nextAvailable, now)) return null; // Not blocked
  
  const hoursLeft = differenceInHours(nextAvailable, now);
  const minutesLeft = differenceInMinutes(nextAvailable, now) % 60;
  const daysLeft = differenceInDays(nextAvailable, now);
  
  if (daysLeft > 0) {
    return `Available ${formatLocalDate(nextAvailable, "MMM dd 'at' h:mm a")}`;
  }
  if (hoursLeft > 0) {
    return `Available in ${hoursLeft}h ${minutesLeft}m`;
  }
  return `Available in ${minutesLeft}m`;
};

/**
 * Given a next_analytics_generation_time from the API (ISO string), 
 * check if blocked and format for display using local timezone.
 */
export const formatNextAnalyticsTime = (nextGenerationTimestamp: string | null): {
  blocked: boolean;
  formattedTime: string | null;
  relativeText: string | null;
} => {
  if (!nextGenerationTimestamp) return { blocked: false, formattedTime: null, relativeText: null };
  
  const next = new Date(nextGenerationTimestamp);
  if (isNaN(next.getTime())) return { blocked: false, formattedTime: null, relativeText: null };
  
  const now = new Date();
  const blocked = isAfter(next, now);
  
  if (!blocked) return { blocked: false, formattedTime: null, relativeText: null };
  
  return {
    blocked: true,
    formattedTime: formatFullDateTime(next),
    relativeText: getRelativeTime(next),
  };
};
