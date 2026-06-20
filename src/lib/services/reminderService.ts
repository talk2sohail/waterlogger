export function isPermissionGranted(): boolean {
  return Notification.permission === 'granted';
}

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendReminder(currentMl: number, targetMl: number) {
  if (!isPermissionGranted()) return;

  const remaining = Math.max(0, targetMl - currentMl);
  const percent = targetMl > 0 ? Math.round((currentMl / targetMl) * 100) : 0;

  let body: string;
  if (remaining <= 0) {
    body = `🎉 You've reached your goal of ${targetMl}ml! Great job!`;
  } else {
    body = `You've had ${currentMl}ml (${percent}%) today. ${remaining}ml to go!`;
  }

  new Notification('💧 WaterLogger Reminder', {
    body,
    icon: '/icons/icon.svg',
    silent: false,
    tag: 'water-reminder',
  });
}

export function startReminderService(
  getState: () => Promise<{ currentMl: number; targetMl: number; intervalMinutes: number }>,
) {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let lastNotifiedMinute = -1;

  async function checkAndNotify() {
    const state = await getState();
    if (state.intervalMinutes <= 0 || !isPermissionGranted()) return;

    const now = new Date();
    const currentMinute = Math.floor(
      (now.getHours() * 60 + now.getMinutes()) / state.intervalMinutes,
    );

    if (currentMinute === lastNotifiedMinute) return;
    lastNotifiedMinute = currentMinute;

    sendReminder(state.currentMl, state.targetMl);
  }

  return {
    start: () => {
      if (intervalId) return;
      // Check every minute
      intervalId = setInterval(checkAndNotify, 60000);
      checkAndNotify();
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    checkNow: checkAndNotify,
  };
}
