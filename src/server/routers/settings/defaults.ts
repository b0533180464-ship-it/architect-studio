// Default settings values
export const DEFAULT_SETTINGS = {
  display: {
    language: 'he',
    theme: 'system',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'Asia/Jerusalem',
    startOfWeek: 'sunday',
    currency: 'ILS',
  },
  notifications: {
    inApp: { enabled: true, sound: true },
    email: {
      enabled: true,
      taskAssigned: true,
      taskDue: true,
      taskOverdue: true,
      mentions: true,
      comments: false,
      approvalNeeded: true,
      approvalReceived: true,
      paymentReceived: true,
      deliveryUpdates: true,
      weeklyDigest: true,
      digestFrequency: 'weekly',
      digestDay: 'sunday',
      digestTime: '09:00',
    },
    push: {
      enabled: false,
      taskAssigned: true,
      mentions: true,
      urgentOnly: false,
    },
  },
  shortcuts: {
    enabled: true,
    customShortcuts: {},
  },
  dashboard: {
    defaultView: 'overview',
    widgetOrder: ['tasks', 'calendar', 'projects', 'payments'],
    hiddenWidgets: [],
  },
  privacy: {
    showOnlineStatus: true,
    showCurrentActivity: true,
  },
};

// Helper to deep merge objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge(target: any, source: any): any {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}
