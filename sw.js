/* K-GUIDE Web Push service worker */
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  var title = d.title || 'K-GUIDE';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: d.icon || './icon-192.png',
    badge: d.badge || './icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || './home.html' }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './home.html';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ws) {
    for (var i = 0; i < ws.length; i++) { if (ws[i].url.indexOf(url) >= 0 && 'focus' in ws[i]) return ws[i].focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
