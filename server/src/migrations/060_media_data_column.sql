-- Migration 060: Add data column to media table for DB-based file storage
-- This enables persistent file storage in Neon PostgreSQL instead of ephemeral filesystem

ALTER TABLE media ADD COLUMN IF NOT EXISTS data text;
ALTER TABLE media ADD COLUMN IF NOT EXISTS storage_type varchar(20) DEFAULT 'local';
