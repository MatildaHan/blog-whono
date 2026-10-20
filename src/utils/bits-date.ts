import { parseDateOnlyUtc, parseEssayPublishedAtInput } from './date-only';

// 动态统一采用北京时间；不依赖构建服务器或阅读者设备的本地时区。
export const BITS_TIME_ZONE = 'Asia/Shanghai';
const BITS_DATETIME_RE = /^(\d{4}-\d{2}-\d{2})(?:[Tt ]((?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?)(Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?)?$/;

export const parseBitsDateInput = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isFinite(value.valueOf()) ? new Date(value.valueOf()) : null;
  }
  if (typeof value !== 'string') return null;
  const match = BITS_DATETIME_RE.exec(value.trim());
  if (!match || !parseDateOnlyUtc(match[1]!)) return null;
  const [, dateText, time = '00:00', zone = '+08:00'] = match;
  const offset = zone === 'Z' || zone.includes(':') ? zone : `${zone.slice(0, 3)}:${zone.slice(3)}`;
  return parseEssayPublishedAtInput(`${dateText}T${time}${offset}`);
};

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BITS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

export const formatBitsDateTime = (date: Date): string => {
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
};

export const getBitsYear = (date: Date): number => Number(formatBitsDateTime(date).slice(0, 4));
