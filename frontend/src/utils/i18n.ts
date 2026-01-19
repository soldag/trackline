export const getPossessiveForm = (name: string | undefined, locale: string) => {
  if (name == null) {
    return name;
  } else if (locale.startsWith("en")) {
    return name.endsWith("s") ? `${name}'` : `${name}'s`;
  } else if (locale.startsWith("de")) {
    return name.match(/[sxzß]$/i) ? `${name}’` : `${name}s`;
  }
  return name;
};

export const formatRelativeTime = (
  timestamp: string,
  locale: string,
): string => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const epochNow = Date.now();
  const epochTimestamp = new Date(timestamp).getTime();
  const diff = (epochTimestamp - epochNow) / 1000;

  const thresholds: {
    limit: number;
    unit: Intl.RelativeTimeFormatUnit;
    factor?: number;
  }[] = [
    { limit: 60, unit: "second" },
    { limit: 3600, unit: "minute", factor: 60 },
    { limit: 86400, unit: "hour", factor: 3600 },
    { limit: 604800, unit: "day", factor: 86400 },
    { limit: 2629800, unit: "week", factor: 604800 },
    { limit: 31557600, unit: "month", factor: 2629800 },
    { limit: Infinity, unit: "year", factor: 31557600 },
  ];

  for (const { limit, unit, factor = 1 } of thresholds) {
    if (Math.abs(diff) < limit) {
      return rtf.format(Math.round(diff / factor), unit);
    }
  }
  return "";
};
