export interface DatedEntry {
  data: { date: Date; endDate?: Date };
}

/** An event stays upcoming until its last day has started. */
function lastDay(e: DatedEntry): number {
  return (e.data.endDate ?? e.data.date).getTime();
}

/** Formats a date, or a date range for multi-day events (e.g. "2027年1月26日至28日"). */
export function formatEventDate(
  data: { date: Date; endDate?: Date },
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const fmt = new Intl.DateTimeFormat(locale, options);
  const { date, endDate } = data;
  if (!endDate || endDate.getTime() === date.getTime()) return fmt.format(date);
  if (locale.startsWith('zh')) {
    // Intl's zh-TW ranges fall back to "2027/1/26至2027/1/28"; write it the way people do.
    const part = (d: Date, type: Intl.DateTimeFormatPartTypes) =>
      fmt.formatToParts(d).find((p) => p.type === type)?.value;
    const sameMonth = part(date, 'year') === part(endDate, 'year') && part(date, 'month') === part(endDate, 'month');
    return sameMonth ? `${fmt.format(date)}至${part(endDate, 'day')}日` : `${fmt.format(date)}至${fmt.format(endDate)}`;
  }
  return fmt.formatRange(date, endDate);
}

export function isCamp(e: { data: { tags: string[] } }): boolean {
  return hasAnyTag([e], CAMP_TAGS).length > 0;
}

export function splitEvents<T extends DatedEntry>(
  events: T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[] } {
  const upcoming = events
    .filter((e) => lastDay(e) >= now.getTime())
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const past = events
    .filter((e) => lastDay(e) < now.getTime())
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return { upcoming, past };
}

/** Tags (in either language) that mark an event as a camp. */
export const CAMP_TAGS = ['營隊', 'Camp'];

export function hasAnyTag<T extends { data: { tags: string[] } }>(
  events: T[],
  tags: string[],
): T[] {
  const wanted = new Set(tags.map((t) => t.toLowerCase()));
  return events.filter((e) => e.data.tags.some((t) => wanted.has(t.toLowerCase())));
}
