-- Vendor Compliance Tracking System
-- Run on Neon database

-- Compliance Check Requirements Table
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'business', 'identity', 'taxes', 'licenses', 'insurance'
    is_required BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Compliance Status Table
CREATE TABLE IF NOT EXISTS vendor_compliance (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    requirement_id INTEGER REFERENCES compliance_requirements(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, approved, rejected
    document_url TEXT,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, requirement_id)
);

-- Compliance Audit Log
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    action VARCHAR(50) NOT NULL, -- submitted, approved, rejected, requested_info
    requirement_id INTEGER REFERENCES compliance_requirements(id),
    user_id INTEGER REFERENCES users(user_id),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default compliance requirements
INSERT INTO compliance_requirements (name, description, category, display_order) VALUES
    ('Business License', 'Valid business registration document', 'business', 1),
    ('Tax Registration (TIN)', 'Tax Identification Number', 'taxes', 2),
    ('Government ID', 'Valid photo ID (passport, drivers license)', 'identity', 3),
    ('Proof of Address', 'Utility bill or bank statement (recent)', 'identity', 4),
    ('Food Safety Certificate', 'Health department permit (for food vendors)', 'licenses', 5),
    ('Professional License', 'Industry-specific license or certification', 'licenses', 6),
    ('Insurance Certificate', 'Liability insurance (if applicable)', 'insurance', 7)
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_vendor ON vendor_compliance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_status ON vendor_compliance(status);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_vendor ON compliance_audit_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_created ON compliance_audit_log(created_at DESC);
