const CACHE_NAME = 'kid-check-writer-v0.47'; // 增加版本號
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 刪除舊版本的緩存
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 先返回緩存的內容
                if (response) {
                    return response;
                }
                
                // 嘗試從網絡獲取最新內容
                return fetch(event.request).then((fetchResponse) => {
                    // 檢查是否需要緩存新的響應
                    if (!fetchResponse || fetchResponse.status !== 200) {
                        return fetchResponse;
                    }

                    // 複製響應
                    const responseToCache = fetchResponse.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return fetchResponse;
                });
            })
    );
});

// 監聽 update 事件，提示用戶更新
self.addEventListener('message', (event) => {
    if (event.data === 'CHECK_UPDATE') {
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage('UPDATE_AVAILABLE');
            });
        });
    }
});
