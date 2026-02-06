import { Request, Response } from 'express';
import { AdminSettingModel, AdminSetting } from '../models/AdminSetting';

export const getAdminSettings = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const settings = await AdminSettingModel.getAll();
        res.json({ settings });
    } catch (error) {
        console.error('Error fetching admin settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

import { logAdminAction } from './adminController';

export const updateAdminSettings = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { settings }: { settings: Omit<AdminSetting, 'id' | 'created_at' | 'updated_at'>[] } = req.body;

        if (!settings || !Array.isArray(settings)) {
            return res.status(400).json({ message: 'Settings array is required' });
        }

        await AdminSettingModel.updateMultiple(settings);

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'update_settings', undefined, {
                keys: settings.map(s => s.setting_key)
            });
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSettingValue = async (key: string): Promise<string | null> => {
    try {
        const setting = await AdminSettingModel.getByKey(key);
        return setting ? setting.setting_value : null;
    } catch (error) {
        console.error(`Error getting setting ${key}:`, error);
        return null;
    }
};

export const getBooleanSetting = async (key: string, defaultValue: boolean = false): Promise<boolean> => {
    const value = await getSettingValue(key);
    if (value === null) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
};

export const getNumberSetting = async (key: string, defaultValue: number = 0): Promise<number> => {
    const value = await getSettingValue(key);
    if (value === null) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

export const getStringSetting = async (key: string, defaultValue: string = ''): Promise<string> => {
    const value = await getSettingValue(key);
    return value || defaultValue;
};