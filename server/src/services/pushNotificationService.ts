/**
 * Push Notification Service
 * Handles device tokens and push notifications
 */

import { pool } from '../config/db';

interface PushNotification {
    user_id: number;
    title: string;
    message: string;
    data?: Record<string, any>;
    event_type?: string;
}

// Register device token
export const registerDeviceToken = async (
    userId: number,
    token: string,
    platform: 'ios' | 'android' | 'web' | 'desktop',
    deviceName?: string,
    deviceId?: string,
    appVersion?: string
): Promise<boolean> => {
    try {
        await pool.query(
            `INSERT INTO device_tokens (user_id, token, platform, device_name, device_id, app_version, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE)
             ON CONFLICT (token) DO UPDATE SET 
                user_id = $1, 
                device_name = COALESCE($4, device_tokens.device_name),
                device_id = COALESCE($5, device_tokens.device_id),
                app_version = COALESCE($6, device_tokens.app_version),
                is_active = TRUE,
                last_used_at = NOW()`,
            [userId, token, platform, deviceName || null, deviceId || null, appVersion || null]
        );
        return true;
    } catch (error) {
        console.error('Failed to register device token:', error);
        return false;
    }
};

// Remove device token
export const unregisterDeviceToken = async (token: string): Promise<boolean> => {
    try {
        await pool.query(
            `UPDATE device_tokens SET is_active = FALSE WHERE token = $1`,
            [token]
        );
        return true;
    } catch (error) {
        console.error('Failed to unregister device token:', error);
        return false;
    }
};

// Send push notification to user
export const sendPushNotification = async (notification: PushNotification): Promise<number> => {
    const { user_id, title, message, data, event_type } = notification;

    try {
        // Get all active devices for user
        const devices = await pool.query(
            `SELECT token, platform FROM device_tokens 
             WHERE user_id = $1 AND is_active = TRUE`,
            [user_id]
        );

        if (devices.rows.length === 0) {
            return 0;
        }

        // Insert notification record
        const result = await pool.query(
            `INSERT INTO push_notifications (user_id, notification_type, title, message, data, status, device_token)
             VALUES ($1, $2, $3, $4, $5, 'pending', $6)
             RETURNING id`,
            [user_id, event_type || 'general', title, message, JSON.stringify(data || {}), devices.rows[0].token]
        );

        // In production, integrate with FCM/APNS/OneSignal here
        // For now, we'll mark as sent and use SSE as fallback
        
        await pool.query(
            `UPDATE push_notifications SET status = 'sent', sent_at = NOW() 
             WHERE id = $1`,
            [result.rows[0].id]
        );

        // Broadcast via SSE if user is connected
        try {
            const { emitToUser } = await import('../services/notificationService');
            emitToUser(user_id, 'push_notification', {
                id: result.rows[0].id,
                title,
                message,
                data,
                event_type
            });
        } catch (e) { /* User not connected via SSE */ }

        return devices.rows.length;
    } catch (error) {
        console.error('Failed to send push notification:', error);
        return 0;
    }
};

// Send to multiple users
export const sendBulkPushNotification = async (
    userIds: number[],
    title: string,
    message: string,
    data?: Record<string, any>
): Promise<number> => {
    let sentCount = 0;
    
    for (const userId of userIds) {
        const result = await sendPushNotification({
            user_id: userId,
            title,
            message,
            data,
            event_type: 'bulk'
        });
        sentCount += result;
    }
    
    return sentCount;
};

// Get push templates
export const getPushTemplate = async (eventType: string): Promise<any> => {
    try {
        const result = await pool.query(
            `SELECT * FROM push_templates WHERE event_type = $1`,
            [eventType]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Failed to get push template:', error);
        return null;
    }
};

// Send templated notification
export const sendTemplatedPushNotification = async (
    userId: number,
    eventType: string,
    variables: Record<string, string>
): Promise<boolean> => {
    try {
        const template = await getPushTemplate(eventType);
        
        if (!template) {
            console.warn(`No template found for event type: ${eventType}`);
            return false;
        }

        let body = template.body_template;
        let title = template.title;
        
        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
            title = title.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        await sendPushNotification({
            user_id: userId,
            title,
            message: body,
            data: template.data_template,
            event_type: eventType
        });

        return true;
    } catch (error) {
        console.error('Failed to send templated notification:', error);
        return false;
    }
};

// Get notification history for user
export const getNotificationHistory = async (userId: number, limit: number = 50): Promise<any[]> => {
    try {
        const result = await pool.query(
            `SELECT * FROM push_notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Failed to get notification history:', error);
        return [];
    }
};

export default {
    registerDeviceToken,
    unregisterDeviceToken,
    sendPushNotification,
    sendBulkPushNotification,
    getPushTemplate,
    sendTemplatedPushNotification,
    getNotificationHistory
};