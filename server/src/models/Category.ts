import { pool } from '../config/db';

export interface VendorCategory {
    category_id: number;
    category_key: string;
    display_name: string;
    icon?: string;
    description?: string;
    layout_type: string;
    is_active: boolean;
    sort_order: number;
}

export interface VendorSubtype {
    subtype_id: number;
    category_id: number;
    subtype_key: string;
    display_name: string;
    icon?: string;
    description?: string;
    is_active: boolean;
    sort_order: number;
}

export interface FormField {
    field_id: number;
    category_id: number;
    subtype_id?: number;
    field_key: string;
    field_type: string;
    field_label: string;
    field_placeholder?: string;
    options?: any;
    is_required: boolean;
    validation_rules?: any;
    sort_order: number;
}

export const CategoryModel = {
    // Get all active categories
    async getAllCategories(): Promise<VendorCategory[]> {
        const result = await pool.query(`
            SELECT * FROM vendor_categories 
            WHERE is_active = TRUE 
            ORDER BY sort_order ASC
        `);
        return result.rows;
    },

    // Get category by key
    async getCategoryByKey(key: string): Promise<VendorCategory | null> {
        const result = await pool.query(`
            SELECT * FROM vendor_categories WHERE category_key = $1
        `, [key]);
        return result.rows[0] || null;
    },

    // Get subtypes for a category
    async getSubtypesByCategory(categoryId: number): Promise<VendorSubtype[]> {
        const result = await pool.query(`
            SELECT * FROM vendor_subtypes 
            WHERE category_id = $1 AND is_active = TRUE 
            ORDER BY sort_order ASC
        `, [categoryId]);
        return result.rows;
    },

    // Get subtypes by category key
    async getSubtypesByCategoryKey(categoryKey: string): Promise<VendorSubtype[]> {
        const result = await pool.query(`
            SELECT vs.* FROM vendor_subtypes vs
            JOIN vendor_categories vc ON vs.category_id = vc.category_id
            WHERE vc.category_key = $1 AND vs.is_active = TRUE
            ORDER BY vs.sort_order ASC
        `, [categoryKey]);
        return result.rows;
    },

    // Get subtype by ID
    async getSubtypeById(subtypeId: number): Promise<VendorSubtype | null> {
        const result = await pool.query(`
            SELECT * FROM vendor_subtypes WHERE subtype_id = $1
        `, [subtypeId]);
        return result.rows[0] || null;
    },

    // Get all categories with their subtypes
    async getCategoriesWithSubtypes(): Promise<(VendorCategory & { subtypes: VendorSubtype[] })[]> {
        const categories = await this.getAllCategories();
        const result = await Promise.all(
            categories.map(async (cat) => ({
                ...cat,
                subtypes: await this.getSubtypesByCategory(cat.category_id)
            }))
        );
        return result;
    },

    // Get form fields for a category/subtype
    async getFormFields(categoryId: number, subtypeId?: number): Promise<FormField[]> {
        let query = `
            SELECT * FROM category_form_fields 
            WHERE category_id = $1 AND is_active = TRUE
        `;
        const params: any[] = [categoryId];

        if (subtypeId) {
            query += ` AND (subtype_id IS NULL OR subtype_id = $2)`;
            params.push(subtypeId);
        } else {
            query += ` AND subtype_id IS NULL`;
        }

        query += ` ORDER BY sort_order ASC`;
        const result = await pool.query(query, params);
        return result.rows;
    },

    // Admin: Create category
    async createCategory(data: Partial<VendorCategory>): Promise<VendorCategory> {
        const result = await pool.query(`
            INSERT INTO vendor_categories (category_key, display_name, icon, description, layout_type, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [data.category_key, data.display_name, data.icon, data.description, data.layout_type || 'product', data.sort_order || 0]);
        return result.rows[0];
    },

    // Admin: Update category
    async updateCategory(categoryId: number, data: Partial<VendorCategory>): Promise<VendorCategory> {
        const result = await pool.query(`
            UPDATE vendor_categories 
            SET display_name = COALESCE($2, display_name),
                icon = COALESCE($3, icon),
                description = COALESCE($4, description),
                layout_type = COALESCE($5, layout_type),
                is_active = COALESCE($6, is_active),
                sort_order = COALESCE($7, sort_order)
            WHERE category_id = $1
            RETURNING *
        `, [categoryId, data.display_name, data.icon, data.description, data.layout_type, data.is_active, data.sort_order]);
        return result.rows[0];
    },

    // Admin: Create subtype
    async createSubtype(data: Partial<VendorSubtype>): Promise<VendorSubtype> {
        const result = await pool.query(`
            INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, description, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [data.category_id, data.subtype_key, data.display_name, data.icon, data.description, data.sort_order || 0]);
        return result.rows[0];
    },

    // Admin: Update subtype
    async updateSubtype(subtypeId: number, data: Partial<VendorSubtype>): Promise<VendorSubtype> {
        const result = await pool.query(`
            UPDATE vendor_subtypes 
            SET display_name = COALESCE($2, display_name),
                icon = COALESCE($3, icon),
                description = COALESCE($4, description),
                is_active = COALESCE($5, is_active),
                sort_order = COALESCE($6, sort_order)
            WHERE subtype_id = $1
            RETURNING *
        `, [subtypeId, data.display_name, data.icon, data.description, data.is_active, data.sort_order]);
        return result.rows[0];
    },

    // Admin: Create form field
    async createFormField(data: Partial<FormField>): Promise<FormField> {
        const result = await pool.query(`
            INSERT INTO category_form_fields 
            (category_id, subtype_id, field_key, field_type, field_label, field_placeholder, options, is_required, validation_rules, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            data.category_id, data.subtype_id, data.field_key, data.field_type,
            data.field_label, data.field_placeholder, JSON.stringify(data.options),
            data.is_required, JSON.stringify(data.validation_rules), data.sort_order || 0
        ]);
        return result.rows[0];
    }
};
