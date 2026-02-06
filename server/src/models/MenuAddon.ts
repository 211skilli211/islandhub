import { pool } from '../config/db';

export interface MenuAddon {
  addon_id?: number;
  item_id: number;
  addon_name: string;
  price: number;
  created_at?: Date;
  updated_at?: Date;
}

export class MenuAddonModel {
  static async findAll(item_id: number): Promise<MenuAddon[]> {
    const result = await pool.query(
      'SELECT * FROM menu_addons WHERE item_id = $1 ORDER BY addon_id',
      [item_id]
    );
    return result.rows;
  }

  static async findById(addon_id: number): Promise<MenuAddon | null> {
    const result = await pool.query('SELECT * FROM menu_addons WHERE addon_id = $1', [addon_id]);
    return result.rows[0] || null;
  }

  static async create(addon: MenuAddon): Promise<MenuAddon> {
    const result = await pool.query(
      'INSERT INTO menu_addons (item_id, addon_name, price) VALUES ($1, $2, $3) RETURNING *',
      [addon.item_id, addon.addon_name, addon.price]
    );
    return result.rows[0];
  }

  static async update(addon_id: number, updates: Partial<MenuAddon>): Promise<MenuAddon | null> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE menu_addons SET ${setClause} WHERE addon_id = $${fields.length + 1} RETURNING *`,
      [...values, addon_id]
    );
    
    return result.rows[0] || null;
  }

  static async delete(addon_id: number): Promise<boolean> {
    await pool.query('DELETE FROM menu_addons WHERE addon_id = $1', [addon_id]);
    return true;
  }
}
