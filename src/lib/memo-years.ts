type AnnualMemo = {
  id: string;
  data: { year: number; draft: boolean };
};

// Public URLs belong to the year, independently of the source filename.
export const getMemoYearPath = (year: number): string => `/memo/${year}/`;

export const getVisibleMemoYears = <T extends AnnualMemo>(
  entries: readonly T[],
  includeDrafts = false
): T[] => {
  const years = new Set<number>();
  const visible = entries.filter((entry) => includeDrafts || !entry.data.draft);
  for (const entry of visible) {
    const year = entry.data.year;
    if (!Number.isInteger(year) || year < 1000 || year > 9999) {
      throw new Error(`纪年 ${entry.id} 的 year 必须为四位年份`);
    }
    if (years.has(year)) throw new Error(`纪年年份重复：${year}，每年只能有一份 MD`);
    years.add(year);
  }
  return [...visible].sort((a, b) => b.data.year - a.data.year);
};
