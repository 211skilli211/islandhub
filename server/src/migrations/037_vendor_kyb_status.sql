-- Migration: Add vendor KYB status columns
-- Run this to add status, kyb_verified, admin_notes, verified_at, rejected_at columns to vendors table

-- Add status column if not exists (with ENUM-like values)
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected'));
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column status already exists';
END $$;

-- Add kyb_verified column if not exists
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS kyb_verified BOOLEAN DEFAULT FALSE;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column kyb_verified already exists';
END $$;

-- Add admin_notes column if not exists
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS admin_notes TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column admin_notes already exists';
END $$;

-- Add verified_at column if not exists
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column verified_at already exists';
END $$;

-- Add verified_by column if not exists
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(user_id);
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column verified_by already exists';
END $$;

-- Add rejected_at column if not exists
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column rejected_at already exists';
END $$;

-- Add rejected_by column if not exists
DO $$ BEGIN
    ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rejected_by INTEGER REFERENCES users(user_id);
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column rejected_by already exists';
END $$;

-- Update existing vendors to 'active' status (backward compatibility)
UPDATE vendors SET status = 'active' WHERE status IS NULL OR status = '';

-- Create index for faster queries on pending vendors
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_kyb_verified ON vendors(kyb_verified);
