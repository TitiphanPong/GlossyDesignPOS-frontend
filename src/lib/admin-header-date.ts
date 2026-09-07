export type AdminHeaderDate = Date | string | null | undefined;

const timestampFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok',
  calendar: 'gregory',
  numberingSystem: 'latn',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  timeZone: 'Asia/Bangkok',
  calendar: 'buddhist',
  numberingSystem: 'latn',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  era: 'short',
});

export function formatAdminHeaderDate(value: AdminHeaderDate): { lastSynced: string; thaiDate: string } {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!date || Number.isNaN(date.getTime())) {
    return { lastSynced: '-', thaiDate: 'ยังไม่มีข้อมูลวันที่' };
  }
  const parts = timestampFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value;
  return {
    lastSynced: `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}`,
    thaiDate: thaiDateFormatter.format(date),
  };
}
