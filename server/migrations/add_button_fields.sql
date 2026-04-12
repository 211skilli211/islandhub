-- Migration: Add button fields to advertisements table style_config
-- The button fields will be stored in the existing style_config JSON column

-- Verify style_config is JSON type
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'advertisements'
AND column_name = 'style_config';

-- The button fields are stored in style_config JSON:
-- show_button (boolean)
-- button_text (string)
-- button_style (string: filled, outline, ghost, gradient)
-- button_text_color (string: hex color)
-- button_bg_color (string: hex color)
