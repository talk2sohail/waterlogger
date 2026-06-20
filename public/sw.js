const CACHE = 'waterlogger-v1';

const ASSETS = [
  '/',
  '/history',
  '/settings',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, copy));
        }
        return response;
      });
      return cached ?? fetched;
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      }
      return clients.openWindow('/');
    }),
  );
});

self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  self.registration.showNotification(data.title || '💧 WaterLogger', {
    body: data.body || 'Time to drink water!',
    icon: '/icons/icon.svg',
    tag: 'water-reminder',
  });
});

let reminderConfig = null;
let reminderIntervalId = null;

self.addEventListener('message', (e) => {
  if (e.data?.type === 'REMINDER_CONFIG') {
    reminderConfig = e.data.config;
    if (reminderConfig && reminderConfig.intervalMinutes > 0) {
      startReminderTimer();
    } else {
      stopReminderTimer();
    }
  }
});

function startReminderTimer() {
  stopReminderTimer();
  reminderIntervalId = setInterval(() => {
    if (!reminderConfig || reminderConfig.intervalMinutes <= 0) return;

    const now = new Date();
    const currentSlot = Math.floor(
      (now.getHours() * 60 + now.getMinutes()) / reminderConfig.intervalMinutes,
    );

    if (currentSlot === reminderConfig.lastNotifiedSlot) return;
    reminderConfig.lastNotifiedSlot = currentSlot;

    const remaining = Math.max(0, reminderConfig.targetMl - (reminderConfig.currentMl || 0));
    const percent = reminderConfig.targetMl > 0
      ? Math.round(((reminderConfig.currentMl || 0) / reminderConfig.targetMl) * 100)
      : 0;

    let body;
    if (remaining <= 0) {
      body = `🎉 You've reached your goal of ${reminderConfig.targetMl}ml! Great job!`;
    } else {
      body = `You've had ${reminderConfig.currentMl || 0}ml (${percent}%) today. ${remaining}ml to go!`;
    }

    self.registration.showNotification('💧 WaterLogger Reminder', {
      body,
      icon: '/icons/icon.svg',
      tag: 'water-reminder',
    });
  }, 60000);
}

function stopReminderTimer() {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
}
