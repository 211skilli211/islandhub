import { pool } from '../config/db';

export const seedLogisticsPricing = async () => {
    try {
        const check = await pool.query('SELECT count(*) FROM logistics_pricing');
        if (parseInt(check.rows[0].count) > 0) {
            console.log('Logistics pricing already seeded.');
            return;
        }

        await pool.query(`
            INSERT INTO logistics_pricing 
            (service_type, base_fare, per_km_rate, per_min_rate, minimum_fare, surge_multiplier, is_active, item_size_multipliers)
            VALUES 
            ('taxi', 15.00, 2.50, 0.50, 25.00, 1.0, TRUE, '{}'),
            ('delivery', 10.00, 1.50, 0.30, 20.00, 1.0, TRUE, '{"small": 1.0, "medium": 1.5, "large": 2.0, "extra_large": 3.0}'),
            ('pickup', 25.00, 3.50, 1.00, 50.00, 1.0, TRUE, '{"light_load": 1.0, "medium_load": 1.8, "heavy_equipment": 3.5}')
        `);
        console.log('✅ Logistics Pricing Seeded');
    } catch (e) {
        console.error('❌ Seeding Error:', e);
    }
};

seedLogisticsPricing();
