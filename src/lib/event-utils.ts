export interface DatedEntry {
  data: { date: Date };
}

export function splitEvents<T extends DatedEntry>(
  events: T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[] } {
  const upcoming = events
    .filter((e) => e.data.date.getTime() >= now.getTime())
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const past = events
    .filter((e) => e.data.date.getTime() < now.getTime())
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
