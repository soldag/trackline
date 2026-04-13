import { Duration } from "luxon";

export const formatPercent = (value: number | null): string | null => {
  if (value == null) {
    return null;
  }

  return value.toLocaleString(undefined, { style: "percent" });
};

export const formatDuration = (isoValue: string | null): string | null => {
  if (isoValue == null) {
    return null;
  }

  const duration = Duration.fromISO(isoValue);
  return duration.toFormat(duration.hours > 0 ? "hh:mm:ss" : "mm:ss");
};
