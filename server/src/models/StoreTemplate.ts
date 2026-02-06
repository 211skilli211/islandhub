import { pool } from '../config/db';

export interface StoreTemplateType {
  template_id: number;
  template_key: string;
  template_name: string;
  description: string;
  category: string;
  icon: string;
  color_theme: string;
  is_active: boolean;
}

export interface StoreTemplateFeature {
  feature_id: number;
  template_id: number;
  feature_key: string;
  feature_name: string;
  description: string;
  is_required: boolean;
  configuration: any;
}

export interface StoreTemplateConfig {
  config_id: number;
  store_id: number;
  template_id: number;
  configuration: any;
  custom_fields: any;
  enabled_features: string[];
}

export class StoreTemplateModel {
  // Get all template types
  static async getAllTemplates(): Promise<StoreTemplateType[]> {
    const result = await pool.query(
      'SELECT * FROM store_template_types WHERE is_active = true ORDER BY category, template_name'
    );
    return result.rows;
  }

  // Get templates by category
  static async getTemplatesByCategory(category: string): Promise<StoreTemplateType[]> {
    const result = await pool.query(
      'SELECT * FROM store_template_types WHERE category = $1 AND is_active = true ORDER BY template_name',
      [category]
    );
    return result.rows;
  }

  // Get template by key
  static async getTemplateByKey(templateKey: string): Promise<StoreTemplateType | null> {
    const result = await pool.query(
      'SELECT * FROM store_template_types WHERE template_key = $1',
      [templateKey]
    );
    return result.rows[0] || null;
  }

  // Get template features
  static async getTemplateFeatures(templateId: number): Promise<StoreTemplateFeature[]> {
    const result = await pool.query(
      'SELECT * FROM store_template_features WHERE template_id = $1 ORDER BY is_required DESC, feature_name',
      [templateId]
    );
    return result.rows;
  }

  // Get store template configuration
  static async getStoreConfig(storeId: number): Promise<StoreTemplateConfig | null> {
    const result = await pool.query(
      `SELECT stc.*, stt.template_key, stt.template_name, stt.category, stt.icon, stt.color_theme
       FROM store_template_configs stc
       JOIN store_template_types stt ON stc.template_id = stt.template_id
       WHERE stc.store_id = $1`,
      [storeId]
    );
    return result.rows[0] || null;
  }

  // Assign template to store
  static async assignTemplateToStore(
    storeId: number, 
    templateId: number, 
    enabledFeatures: string[] = [],
    customConfig: any = {}
  ): Promise<StoreTemplateConfig> {
    // Get default features for this template
    const featuresResult = await pool.query(
      'SELECT feature_key FROM store_template_features WHERE template_id = $1 AND is_required = true',
      [templateId]
    );
    const requiredFeatures = featuresResult.rows.map(f => f.feature_key);
    
    // Merge required + enabled features
    const allFeatures = [...new Set([...requiredFeatures, ...enabledFeatures])];

    const result = await pool.query(
      `INSERT INTO store_template_configs (store_id, template_id, configuration, custom_fields, enabled_features)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (store_id) 
       DO UPDATE SET 
         template_id = EXCLUDED.template_id,
         configuration = EXCLUDED.configuration,
         custom_fields = EXCLUDED.custom_fields,
         enabled_features = EXCLUDED.enabled_features,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [storeId, templateId, JSON.stringify(customConfig), JSON.stringify({}), JSON.stringify(allFeatures)]
    );

    return result.rows[0];
  }

  // Update store template configuration
  static async updateStoreConfig(
    storeId: number, 
    updates: Partial<StoreTemplateConfig>
  ): Promise<StoreTemplateConfig | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount}`);
      values.push(JSON.stringify(updates.configuration));
      paramCount++;
    }

    if (updates.custom_fields !== undefined) {
      fields.push(`custom_fields = $${paramCount}`);
      values.push(JSON.stringify(updates.custom_fields));
      paramCount++;
    }

    if (updates.enabled_features !== undefined) {
      fields.push(`enabled_features = $${paramCount}`);
      values.push(JSON.stringify(updates.enabled_features));
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(storeId);

    const result = await pool.query(
      `UPDATE store_template_configs 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE store_id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Check if feature is enabled for store
  static async isFeatureEnabled(storeId: number, featureKey: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT enabled_features 
       FROM store_template_configs 
       WHERE store_id = $1`,
      [storeId]
    );

    if (result.rows.length === 0) return false;
    
    const features = result.rows[0].enabled_features || [];
    return features.includes(featureKey);
  }

  // Get all categories
  static async getCategories(): Promise<string[]> {
    const result = await pool.query(
      'SELECT DISTINCT category FROM store_template_types WHERE is_active = true ORDER BY category'
    );
    return result.rows.map(r => r.category);
  }
}

export default StoreTemplateModel;
