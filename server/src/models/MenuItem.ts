import { pool } from '../config/db';

export interface MenuItem {
  item_id?: number;
  section_id: number;
  item_name: string;
  description?: string;
  price: number;
  created_at?: Date;
  updated_at?: Date;
}

export class MenuItemModel {
  static async findAll(section_id: number): Promise<MenuItem[]> {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE section_id = $1 ORDER BY item_id',
      [section_id]
    );
    return result.rows;
  }

  static async findById(item_id: number): Promise<MenuItem | null> {
    const result = await pool.query('SELECT * FROM menu_items WHERE item_id = $1', [item_id]);
    return result.rows[0] || null;
  }

  static async create(item: MenuItem): Promise<MenuItem> {
    const result = await pool.query(
      'INSERT INTO menu_items (section_id, item_name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [item.section_id, item.item_name, item.description, item.price]
    );
    return result.rows[0];
  }

  static async update(item_id: number, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE menu_items SET ${setClause} WHERE item_id = $${fields.length + 1} RETURNING *`,
      [...values, item_id]
    );
    
    return result.rows[0] || null;
  }

  static async delete(item_id: number): Promise<boolean> {
    await pool.query('DELETE FROM menu_items WHERE item_id = $1', [item_id]);
    return true;
  }
}
