-- Migration 041: Fix Full-Text Search Schema
-- Adds search_vector + verified columns to listings & vendors, with update triggers and GIN indexes.
-- This makes searchController.ts work on any installation.

-- =============================================
-- 1. Listings: add missing columns
-- =============================================
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- =============================================
-- 2. Vendors: add search_vector column
-- =============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
        ALTER TABLE vendors ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
    END IF;
END $$;

-- =============================================
-- 3. Trigger function: update listings search_vector
-- =============================================
CREATE OR REPLACE FUNCTION listings_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.sub_category, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_search_vector_trigger ON listings;
CREATE TRIGGER listings_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, description, category, sub_category
    ON listings
    FOR EACH ROW
    EXECUTE FUNCTION listings_search_vector_update();

-- =============================================
-- 4. Trigger function: update vendors search_vector
-- =============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
        -- Create or replace the trigger function
        EXECUTE $func$
            CREATE OR REPLACE FUNCTION vendors_search_vector_update()
            RETURNS TRIGGER AS $trig$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.business_name, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
                RETURN NEW;
            END;
            $trig$ LANGUAGE plpgsql;
        $func$;

        EXECUTE 'DROP TRIGGER IF EXISTS vendors_search_vector_trigger ON vendors';
        EXECUTE '
            CREATE TRIGGER vendors_search_vector_trigger
                BEFORE INSERT OR UPDATE OF business_name, bio, location
                ON vendors
                FOR EACH ROW
                EXECUTE FUNCTION vendors_search_vector_update()
        ';
    END IF;
END $$;

-- =============================================
-- 5. Backfill existing data
-- =============================================
UPDATE listings SET
    search_vector =
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(category, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(sub_category, '')), 'D')
WHERE search_vector IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
        EXECUTE $upd$
            UPDATE vendors SET
                search_vector =
                    setweight(to_tsvector('english', coalesce(business_name, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(bio, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(location, '')), 'C')
            WHERE search_vector IS NULL
        $upd$;
    END IF;
END $$;

-- =============================================
-- 6. GIN Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN(search_vector);

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vendors_search_vector ON vendors USING GIN(search_vector)';
    END IF;
END $$;
