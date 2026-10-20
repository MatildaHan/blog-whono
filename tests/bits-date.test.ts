import { describe, expect, it } from 'vitest';
import { formatBitsDateTime, getBitsYear, parseBitsDateInput } from '../src/utils/bits-date';

describe('bits publication dates', () => {
  it.each(['2026-10-20 17:56', '2026-10-20T17:56', '2026-10-20T17:56:00+08:00', '2026-10-20T17:56:00+0800'])(
    'reads %s as the same publication time', (input) => {
      const date = parseBitsDateInput(input)!;
      expect(date.toISOString()).toBe('2026-10-20T09:56:00.000Z');
      expect(formatBitsDateTime(date)).toBe('2026-10-20 17:56');
    }
  );

  it('uses midnight Beijing time for a date without a time', () => {
    const date = parseBitsDateInput('2026-01-01')!;
    expect(date.toISOString()).toBe('2025-12-31T16:00:00.000Z');
    expect(formatBitsDateTime(date)).toBe('2026-01-01 00:00');
    expect(getBitsYear(date)).toBe(2026);
  });

  it('honors explicit timezones and preserves real chronological ordering', () => {
    const utc = parseBitsDateInput('2026-10-20T09:56:00Z')!;
    const west = parseBitsDateInput('2026-10-20T05:56:00-04:00')!;
    const later = parseBitsDateInput('2026-10-20 17:57')!;
    expect(utc.valueOf()).toBe(west.valueOf());
    expect(formatBitsDateTime(utc)).toBe('2026-10-20 17:56');
    expect(later.valueOf()).toBeGreaterThan(utc.valueOf());
  });

  it('preserves timestamps already parsed by the content loader', () => {
    const date = new Date('2026-10-20T17:56:00+08:00');
    expect(parseBitsDateInput(date)?.toISOString()).toBe('2026-10-20T09:56:00.000Z');
  });

  it.each(['2026-02-30 12:00', '2026-10-20 24:00', '2026-10-20 12:60', 'not-a-date', '', null, 0, new Date(NaN)])(
    'rejects invalid date input %s', (input) => {
      expect(parseBitsDateInput(input)).toBeNull();
    }
  );
});
