-- Migration: Add 'shader' and 'particle' to hero_assets asset_type constraint
-- Drop the existing check constraint and recreate with the full set of allowed types

ALTER TABLE hero_assets
  DROP CONSTRAINT IF EXISTS hero_assets_asset_type_check;

ALTER TABLE hero_assets
  ADD CONSTRAINT hero_assets_asset_type_check
  CHECK (asset_type IN ('image', 'video', 'pdf', 'shader', 'particle'));
