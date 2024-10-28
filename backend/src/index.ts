// src/index.ts

import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const app = express();
app.use(cors());
app.use(express.json());

const publicVapidKey = 'BJPjeR66OOzF7NAgpT9lxOSpCIqjCXhaA97B8-ZGQKFtO-AElc0HjgJjUhtA4xGvu9cO_GTo2fkE-cU1EbeyQCU';
const privateVapidKey = 'Idm7zS4mXC0rNwZBQxZBKpYQD_dPxaa0xLdquDUJ-zE';

// Set VAPID keys for web-push
webpush.setVapidDetails(
    'mailto:example@yourdomain.com',
    publicVapidKey,
    privateVapidKey
);

let subscriptions: any[] = [];
let intervals: { [key: string]: NodeJS.Timeout } = {};

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    console.log('Received subscription:', subscription); // Log the subscription
    subscriptions.push(subscription);
    res.status(201).json({});
});

app.post('/start-messages', (req, res) => {
    const { username } = req.body;
    console.log(`Starting messages for ${username}`); // Log when messages start

    const interval = setInterval(() => {
        const payload = JSON.stringify({
            title: 'Message Notification',
            message: `Hello ${username}, Don't Miss to Visit The Website!`,
        });

        subscriptions.forEach((subscription) => {
            webpush.sendNotification(subscription, payload)
                .then(() => console.log(`Notification sent to ${subscription.endpoint}`))
                .catch((err) => {
                    console.error('Error sending notification, ', err);
                    // Optionally remove the subscription if it fails
                });
        });
    }, 60000);

    res.send({ message: `Messages started for ${username}` });
});


app.listen(5000, () => console.log('Server running on http://localhost:5000'));
