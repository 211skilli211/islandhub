import { pool } from '../config/db';

export interface AdminSetting {
    id?: number;
    setting_key: string;
    setting_value: string;
    setting_type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export class AdminSettingModel {
    static async getAll(): Promise<AdminSetting[]> {
        const result = await pool.query('SELECT * FROM admin_settings ORDER BY setting_key');
        return result.rows;
    }

    static async getByKey(setting_key: string): Promise<AdminSetting | null> {
        const result = await pool.query('SELECT * FROM admin_settings WHERE setting_key = $1', [setting_key]);
        return result.rows[0] || null;
    }

    static async upsert(setting: Omit<AdminSetting, 'id' | 'created_at' | 'updated_at'>): Promise<AdminSetting> {
        const { setting_key, setting_value, setting_type, description } = setting;
        const result = await pool.query(
            `INSERT INTO admin_settings (setting_key, setting_value, setting_type, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = EXCLUDED.setting_value,
                     setting_type = EXCLUDED.setting_type,
                     description = EXCLUDED.description,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [setting_key, setting_value, setting_type, description || '']
        );
        return result.rows[0];
    }

    static async updateMultiple(settings: Omit<AdminSetting, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const setting of settings) {
                await client.query(
                    `INSERT INTO admin_settings (setting_key, setting_value, setting_type, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (setting_key)
           DO UPDATE SET setting_value = EXCLUDED.setting_value,
                         setting_type = EXCLUDED.setting_type,
                         description = EXCLUDED.description,
                         updated_at = CURRENT_TIMESTAMP`,
                    [setting.setting_key, setting.setting_value, setting.setting_type, setting.description || '']
                );
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}