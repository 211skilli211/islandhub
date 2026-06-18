import { pool } from '../config/db';

export interface MenuSection {
  section_id?: number;
  listing_id: number;
  section_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export class MenuSectionModel {
  static async findAll(listing_id: number): Promise<MenuSection[]> {
    const result = await pool.query(
      'SELECT * FROM menu_sections WHERE listing_id = $1 ORDER BY section_id',
      [listing_id]
    );
    return result.rows;
  }

  static async findById(section_id: number): Promise<MenuSection | null> {
    const result = await pool.query('SELECT * FROM menu_sections WHERE section_id = $1', [section_id]);
    return result.rows[0] || null;
  }

  static async create(section: MenuSection): Promise<MenuSection> {
    const result = await pool.query(
      'INSERT INTO menu_sections (listing_id, section_name) VALUES ($1, $2) RETURNING *',
      [section.listing_id, section.section_name]
    );
    return result.rows[0];
  }

  static async update(section_id: number, updates: Partial<MenuSection>): Promise<MenuSection | null> {
    if (!updates.section_name) return null;
    
    const result = await pool.query(
      'UPDATE menu_sections SET section_name = $1 WHERE section_id = $2 RETURNING *',
      [updates.section_name, section_id]
    );
    return result.rows[0] || null;
  }

  static async delete(section_id: number): Promise<boolean> {
    await pool.query('DELETE FROM menu_sections WHERE section_id = $1', [section_id]);
    return true;
  }
}
