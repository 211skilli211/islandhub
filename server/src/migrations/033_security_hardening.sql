-- ============================================
-- Security Hardening Migration
-- Adds 2FA fields and security improvements
-- ============================================

-- Add 2FA fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(64),
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_history JSONB DEFAULT '[]'::jsonb;

-- Create failed login attempts log table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    attempt_id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    ip_address INET,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_logins_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_failed_logins_time ON failed_login_attempts(attempted_at);

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON security_audit_log(user_id);
CREATE INDEX idx_audit_action ON security_audit_log(action);
CREATE INDEX idx_audit_time ON security_audit_log(created_at);

-- Function to check if user is locked out
CREATE OR REPLACE FUNCTION check_account_lockout(p_user_id INTEGER)
RETURNS TABLE (
    is_locked BOOLEAN,
    locked_until TIMESTAMP,
    attempts_remaining INTEGER
) AS $$
DECLARE
    v_locked_until TIMESTAMP;
    v_attempts INTEGER;
    v_max_attempts INTEGER := 5;
BEGIN
    SELECT locked_until, failed_login_attempts 
    INTO v_locked_until, v_attempts
    FROM users 
    WHERE user_id = p_user_id;
    
    IF v_locked_until IS NOT NULL AND v_locked_until > CURRENT_TIMESTAMP THEN
        RETURN QUERY SELECT TRUE, v_locked_until, 0::INTEGER;
    ELSE
        RETURN QUERY SELECT 
            FALSE, 
            NULL::TIMESTAMP, 
            GREATEST(0, v_max_attempts - COALESCE(v_attempts, 0))::INTEGER;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to record failed login
CREATE OR REPLACE FUNCTION record_failed_login(p_user_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_attempts INTEGER;
BEGIN
    SELECT failed_login_attempts INTO v_attempts 
    FROM users WHERE user_id = p_user_id;
    
    IF v_attempts >= 4 THEN -- 5th attempt locks account
        UPDATE users 
        SET failed_login_attempts = 5,
            locked_until = CURRENT_TIMESTAMP + INTERVAL '30 minutes'
        WHERE user_id = p_user_id;
    ELSE
        UPDATE users 
        SET failed_login_attempts = COALESCE(v_attempts, 0) + 1
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_login_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id INTEGER,
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id VARCHAR,
    p_ip_address INET,
    p_user_agent TEXT,
    p_details JSONB,
    p_severity VARCHAR
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO security_audit_log 
        (user_id, action, resource_type, resource_id, ip_address, user_agent, details, severity)
    VALUES 
        (p_user_id, p_action, p_resource_type, p_resource_id, p_ip_address, p_user_agent, p_details, p_severity);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log password changes
CREATE OR REPLACE FUNCTION log_password_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.password_hash != NEW.password_hash THEN
        INSERT INTO security_audit_log 
            (user_id, action, resource_type, details, severity)
        VALUES 
            (NEW.user_id, 'password_changed', 'user', 
             jsonb_build_object('changed_at', CURRENT_TIMESTAMP), 
             'warning');
        
        -- Update password history (keep last 5 passwords)
        NEW.password_history = jsonb_build_array(
            OLD.password_hash
        ) || CASE 
            WHEN jsonb_array_length(COALESCE(OLD.password_history, '[]'::jsonb)) >= 5 
            THEN (SELECT jsonb_agg(elem) FROM jsonb_array_elements(OLD.password_history) WITH ORDINALITY AS t(elem, idx) WHERE idx <= 4)
            ELSE COALESCE(OLD.password_history, '[]'::jsonb)
        END;
        
        NEW.password_changed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_password_change_trigger ON users;
CREATE TRIGGER log_password_change_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_password_change();

-- ============================================
-- Migration Complete
-- ============================================
