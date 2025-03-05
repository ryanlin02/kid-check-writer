// 在 service-worker.js 文件中添加版本控制
const CACHE_VERSION = 'v0.23'; // 每次更新網站時更改這個版本號
const CACHE_NAME = `kid-check-writer-${CACHE_VERSION}`;
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在快取中找到響應，則返回快取的版本
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // 確認響應有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 複製響應
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 更新 Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 添加定期檢查更新的邏輯
self.addEventListener('install', event => {
  self.skipWaiting(); // 強制激活新的 Service Worker
  
  // 原有的緩存代碼...
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 確保新的 Service Worker 立即接管
self.addEventListener('activate', event => {
  // 立即接管所有客戶端
  event.waitUntil(clients.claim());
  
  // 清理舊版本緩存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
