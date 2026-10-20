import { describe, expect, it } from 'vitest';
import { getMemoYearPath, getVisibleMemoYears } from '../src/lib/memo-years';

const memo = (year: number, draft = false, id = String(year)) => ({ id, data: { year, draft } });

describe('annual memo routing', () => {
  it('orders years descending without changing sources and routes the legacy index by its year', () => {
    const entries = [memo(2024), memo(2026, false, 'index'), memo(2025)];
    const sorted = getVisibleMemoYears(entries);
    expect(sorted.map((entry) => entry.data.year)).toEqual([2026, 2025, 2024]);
    expect(entries[0]?.data.year).toBe(2024);
    expect(getMemoYearPath(sorted[0]!.data.year)).toBe('/memo/2026/');
  });

  it('excludes drafts from production lists and routes, while allowing development previews', () => {
    const entries = [memo(2026), memo(2027, true)];
    expect(getVisibleMemoYears(entries).map((entry) => entry.data.year)).toEqual([2026]);
    expect(getVisibleMemoYears(entries, true).map((entry) => entry.data.year)).toEqual([2027, 2026]);
  });

  it('fails on duplicate visible years instead of silently overwriting a detail route', () => {
    expect(() => getVisibleMemoYears([memo(2026), memo(2026, false, 'index')])).toThrow('纪年年份重复');
    expect(() => getVisibleMemoYears([memo(2026), memo(2026, true, 'draft')])).not.toThrow();
    expect(() => getVisibleMemoYears([memo(2026), memo(2026, true, 'draft')], true)).toThrow('纪年年份重复');
  });

  it.each([999, 10000, 2026.5, Number.NaN])('rejects invalid year %s', (year) => {
    expect(() => getVisibleMemoYears([memo(year)])).toThrow('四位年份');
  });
});
