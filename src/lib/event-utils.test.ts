import { describe, it, expect } from 'vitest';
import { splitEvents, hasAnyTag, CAMP_TAGS, formatEventDate } from './event-utils';

const ev = (iso: string) => ({ data: { date: new Date(iso) } });

describe('splitEvents', () => {
  const now = new Date('2026-06-16T00:00:00Z');

  it('splits upcoming (>= now) and past (< now)', () => {
    const { upcoming, past } = splitEvents([ev('2026-01-01'), ev('2026-12-01'), ev('2026-07-01')], now);
    expect(upcoming.map((e) => e.data.date.getFullYear())).toHaveLength(2);
    expect(past).toHaveLength(1);
    expect(past[0].data.date.toISOString().slice(0, 10)).toBe('2026-01-01');
  });

  it('sorts upcoming ascending and past descending', () => {
    const events = [ev('2026-08-01'), ev('2026-07-01'), ev('2026-03-01'), ev('2026-01-01')];
    const { upcoming, past } = splitEvents(events, now);
    expect(upcoming.map((e) => e.data.date.toISOString().slice(0, 10))).toEqual(['2026-07-01', '2026-08-01']);
    expect(past.map((e) => e.data.date.toISOString().slice(0, 10))).toEqual(['2026-03-01', '2026-01-01']);
  });
});

describe('hasAnyTag', () => {
  const tagged = (...tags: string[]) => ({ data: { tags } });

  it('keeps events with any matching tag, case-insensitively', () => {
    const events = [tagged('營隊'), tagged('camp', 'Workshop'), tagged('Meetup'), tagged()];
    expect(hasAnyTag(events, CAMP_TAGS)).toEqual([events[0], events[1]]);
  });
});

describe('splitEvents with endDate', () => {
  it('keeps a multi-day event upcoming while it is running', () => {
    const running = { data: { date: new Date('2027-01-26'), endDate: new Date('2027-01-28') } };
    const { upcoming } = splitEvents([running], new Date('2027-01-27T12:00:00Z'));
    expect(upcoming).toEqual([running]);
  });
});

describe('formatEventDate', () => {
  const opts = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' } as const;

  it('formats a single day', () => {
    expect(formatEventDate({ date: new Date('2027-01-26') }, 'en-US', opts)).toBe('January 26, 2027');
  });

  it('formats a multi-day range', () => {
    const data = { date: new Date('2027-01-26'), endDate: new Date('2027-01-28') };
    expect(formatEventDate(data, 'en-US', opts).replace(/\s/g, ' ')).toBe('January 26 – 28, 2027');
  });

  it('formats a zh-TW range the way people write it', () => {
    const data = { date: new Date('2027-01-26'), endDate: new Date('2027-01-28') };
    expect(formatEventDate(data, 'zh-TW', opts)).toBe('2027年1月26日至28日');
    expect(formatEventDate(data, 'zh-TW', { ...opts, month: 'short' })).toBe('2027年1月26日至28日');
  });
});
