self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.message,
        icon: '/logo.png', // Add a suitable icon path
        badge: '/logo.png' // Optional: add a badge
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
