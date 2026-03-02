import { pool } from '../config/db';

export interface User {
  user_id?: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'buyer' | 'vendor' | 'sponsor' | 'admin' | 'creator' | 'donor' | 'driver' | 'rider';
  country?: string;
  is_active?: boolean;
  email_verified?: boolean;
  bio?: string;
  profile_photo_url?: string;
  banner_image_url?: string;
  banner_color?: string;
  license_number?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  is_verified_driver?: boolean;
  current_location?: any;
  created_at?: Date;
  // Alias for compatibility
  password?: string;
}

export class UserModel {
  static async create(user: User): Promise<User> {
    const { name, email, password_hash, role, country } = user;
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, country, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *, password_hash AS password`,
      [name, email, password_hash, role || 'buyer', country, false]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT *, password_hash AS password FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT *, password_hash AS password FROM users WHERE user_id = $1', [id]);
    return result.rows[0] || null;
  }
}
