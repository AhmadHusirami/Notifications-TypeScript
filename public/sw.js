self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.message,
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
