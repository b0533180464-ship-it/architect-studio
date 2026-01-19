export const MEETING_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  site_visit: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  client_meeting: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  supplier: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  internal: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  presentation: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  installation: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  other: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};

export const MEETING_TYPE_LABELS: Record<string, string> = {
  site_visit: 'ביקור באתר',
  client_meeting: 'פגישת לקוח',
  supplier: 'פגישת ספק',
  internal: 'פגישה פנימית',
  presentation: 'מצגת',
  installation: 'התקנה',
  other: 'אחר',
};

export const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
export const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

export const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8-20

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
