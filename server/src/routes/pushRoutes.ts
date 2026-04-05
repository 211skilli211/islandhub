import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
    registerDeviceToken,
    unregisterDeviceToken,
    sendPushNotification,
    getNotificationHistory
} from '../services/pushNotificationService';

const router = Router();

// Register device token for push notifications
router.post('/register-device', authenticateJWT, async (req, res) => {
    try {
        const user = (req as any).user;
        const { token, platform, device_name, device_id, app_version } = req.body;

        if (!token || !platform) {
            return res.status(400).json({ error: 'Token and platform are required' });
        }

        const validPlatforms = ['ios', 'android', 'web', 'desktop'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        const success = await registerDeviceToken(
            user.id,
            token,
            platform,
            device_name,
            device_id,
            app_version
        );

        if (success) {
            res.json({ success: true, message: 'Device registered for push notifications' });
        } else {
            res.status(500).json({ error: 'Failed to register device' });
        }
    } catch (error) {
        console.error('Register device error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Unregister device token
router.post('/unregister-device', authenticateJWT, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const success = await unregisterDeviceToken(token);

        if (success) {
            res.json({ success: true, message: 'Device unregistered' });
        } else {
            res.status(500).json({ error: 'Failed to unregister device' });
        }
    } catch (error) {
        console.error('Unregister device error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get notification history
router.get('/notifications', authenticateJWT, async (req, res) => {
    try {
        const user = (req as any).user;
        const limit = parseInt(req.query.limit as string) || 50;

        const notifications = await getNotificationHistory(user.id, limit);

        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// Test push notification (admin only)
router.post('/test', authenticateJWT, async (req, res) => {
    try {
        const { user_id, title, message, data } = req.body;

        if (!user_id || !title || !message) {
            return res.status(400).json({ error: 'user_id, title, and message are required' });
        }

        const count = await sendPushNotification({
            user_id,
            title,
            message,
            data,
            event_type: 'test'
        });

        res.json({ success: true, sent_to: count });
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

export default router;