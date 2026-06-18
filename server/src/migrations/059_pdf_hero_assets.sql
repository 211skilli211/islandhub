-- Migration 059: Add PDF support to hero_assets
-- Drops the old constraint that only allowed 'image' and 'video'
-- Adds a new constraint that also allows 'pdf'

ALTER TABLE hero_assets DROP CONSTRAINT IF EXISTS hero_assets_asset_type_check;
ALTER TABLE hero_assets ADD CONSTRAINT hero_assets_asset_type_check CHECK (((asset_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'pdf'::character varying])::text[])));
