--
-- PostgreSQL database dump
--

\restrict y4jBogp6CcI7BwKxfM8CylIqyGEDyyXrfXxdQPL8OVVF9VYow6jeLF4JY9Um1YG

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'fulfilled',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- Name: check_account_lockout(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_account_lockout(p_user_id integer) RETURNS TABLE(is_locked boolean, locked_until timestamp without time zone, attempts_remaining integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.check_account_lockout(p_user_id integer) OWNER TO postgres;

--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_order_number VARCHAR(50);
    year_str VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_str || '-%';
    
    new_order_number := 'ORD-' || year_str || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN new_order_number;
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO postgres;

--
-- Name: get_vendor_dashboard_stats(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_vendor_dashboard_stats(p_store_id integer) RETURNS TABLE(total_revenue numeric, total_orders bigint, total_customers bigint, avg_order_value numeric, revenue_7d numeric, revenue_30d numeric, orders_7d bigint, orders_30d bigint, pending_orders bigint, processing_orders bigint, completed_orders bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN o.status NOT IN ('cancelled') THEN 1 END) as total_orders,
        COUNT(DISTINCT CASE WHEN o.status NOT IN ('cancelled') THEN o.user_id END) as total_customers,
        COALESCE(AVG(CASE WHEN o.status NOT IN ('cancelled') THEN o.total_amount END), 0) as avg_order_value,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN o.total_amount ELSE 0 END), 0) as revenue_7d,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN o.total_amount ELSE 0 END), 0) as revenue_30d,
        COUNT(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as orders_7d,
        COUNT(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as orders_30d,
        COUNT(CASE WHEN o.status::text = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.status IN ('paid', 'processing') THEN 1 END) as processing_orders,
        COUNT(CASE WHEN o.status::text = 'completed' THEN 1 END) as completed_orders
    FROM orders o
    WHERE o.store_id = p_store_id;
END;
$$;


ALTER FUNCTION public.get_vendor_dashboard_stats(p_store_id integer) OWNER TO postgres;

--
-- Name: get_vendor_sales_chart(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_vendor_sales_chart(p_store_id integer, p_days integer DEFAULT 30) RETURNS TABLE(date date, revenue numeric, orders bigint, customers bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(o.created_at) as date,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(*) as orders,
        COUNT(DISTINCT o.user_id) as customers
    FROM orders o
    WHERE o.store_id = p_store_id
      AND o.status NOT IN ('cancelled')
      AND o.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at);
END;
$$;


ALTER FUNCTION public.get_vendor_sales_chart(p_store_id integer, p_days integer) OWNER TO postgres;

--
-- Name: get_vendor_top_products(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_vendor_top_products(p_store_id integer, p_limit integer DEFAULT 10, p_days integer DEFAULT 30) RETURNS TABLE(listing_id integer, product_name character varying, units_sold bigint, revenue numeric, avg_rating numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.listing_id,
        l.title as product_name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as revenue,
        COALESCE(AVG(r.rating), 0) as avg_rating
    FROM order_items oi
    JOIN listings l ON oi.listing_id = l.id
    JOIN orders o ON oi.order_id = o.order_id
    LEFT JOIN reviews r ON l.id = r.listing_id
    WHERE l.store_id = p_store_id
      AND o.status NOT IN ('cancelled')
      AND o.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY oi.listing_id, l.title
    ORDER BY SUM(oi.total_price) DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.get_vendor_top_products(p_store_id integer, p_limit integer, p_days integer) OWNER TO postgres;

--
-- Name: listings_search_vector_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.listings_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
              NEW.search_vector :=
                setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
                setweight(to_tsvector('english', (
                  SELECT coalesce(string_agg(value, ' '), '')
                  FROM jsonb_each_text(NEW.metadata)
                )), 'C');
              RETURN NEW;
            END
            $$;


ALTER FUNCTION public.listings_search_vector_update() OWNER TO postgres;

--
-- Name: log_password_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_password_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.log_password_change() OWNER TO postgres;

--
-- Name: log_security_event(integer, character varying, character varying, character varying, inet, text, jsonb, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_security_event(p_user_id integer, p_action character varying, p_resource_type character varying, p_resource_id character varying, p_ip_address inet, p_user_agent text, p_details jsonb, p_severity character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO security_audit_log 
        (user_id, action, resource_type, resource_id, ip_address, user_agent, details, severity)
    VALUES 
        (p_user_id, p_action, p_resource_type, p_resource_id, p_ip_address, p_user_agent, p_details, p_severity);
END;
$$;


ALTER FUNCTION public.log_security_event(p_user_id integer, p_action character varying, p_resource_type character varying, p_resource_id character varying, p_ip_address inet, p_user_agent text, p_details jsonb, p_severity character varying) OWNER TO postgres;

--
-- Name: record_failed_login(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.record_failed_login(p_user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.record_failed_login(p_user_id integer) OWNER TO postgres;

--
-- Name: reset_failed_login(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_failed_login(p_user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE users 
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_login_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
END;
$$;


ALTER FUNCTION public.reset_failed_login(p_user_id integer) OWNER TO postgres;

--
-- Name: update_banner_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_banner_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_banner_timestamp() OWNER TO postgres;

--
-- Name: update_campaign_creator_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_campaign_creator_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_campaign_creator_subscriptions_updated_at() OWNER TO postgres;

--
-- Name: update_customer_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_customer_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_customer_subscriptions_updated_at() OWNER TO postgres;

--
-- Name: update_driver_payouts_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_driver_payouts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$;


ALTER FUNCTION public.update_driver_payouts_updated_at() OWNER TO postgres;

--
-- Name: update_store_template_config_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_store_template_config_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_store_template_config_timestamp() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: update_vendor_subscriptions_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_vendor_subscriptions_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_vendor_subscriptions_updated_at() OWNER TO postgres;

--
-- Name: vendors_search_vector_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.vendors_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
              NEW.search_vector :=
                setweight(to_tsvector('english', coalesce(NEW.business_name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C');
              RETURN NEW;
            END
            $$;


ALTER FUNCTION public.vendors_search_vector_update() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_analytics (
    analytics_id integer NOT NULL,
    ad_id integer,
    event_type character varying(20),
    event_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    session_id character varying(255),
    page_url text,
    page_type character varying(50),
    device_type character varying(20),
    user_agent text,
    ip_address character varying(50),
    location_data jsonb,
    conversion_value numeric(10,2),
    conversion_type character varying(50)
);


ALTER TABLE public.ad_analytics OWNER TO postgres;

--
-- Name: TABLE ad_analytics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ad_analytics IS 'Detailed tracking of ad impressions, clicks, and conversions';


--
-- Name: ad_analytics_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ad_analytics_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ad_analytics_analytics_id_seq OWNER TO postgres;

--
-- Name: ad_analytics_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ad_analytics_analytics_id_seq OWNED BY public.ad_analytics.analytics_id;


--
-- Name: ad_spaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_spaces (
    space_id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(255) NOT NULL,
    description text,
    width integer,
    height integer,
    aspect_ratio character varying(20),
    location character varying(50) NOT NULL,
    "position" character varying(50),
    max_file_size integer,
    allowed_media_types text[],
    max_duration integer,
    base_price numeric(10,2),
    pricing_period character varying(20),
    is_active boolean DEFAULT true,
    max_concurrent_ads integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    style_config jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.ad_spaces OWNER TO postgres;

--
-- Name: TABLE ad_spaces; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ad_spaces IS 'Defines available advertising spaces across the platform';


--
-- Name: ad_spaces_space_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ad_spaces_space_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ad_spaces_space_id_seq OWNER TO postgres;

--
-- Name: ad_spaces_space_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ad_spaces_space_id_seq OWNED BY public.ad_spaces.space_id;


--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    setting_type character varying(50) DEFAULT 'string'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_settings OWNER TO postgres;

--
-- Name: admin_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admin_settings_id_seq OWNER TO postgres;

--
-- Name: admin_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_settings_id_seq OWNED BY public.admin_settings.id;


--
-- Name: advertisements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisements (
    ad_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    advertiser_type character varying(50) NOT NULL,
    advertiser_id integer,
    advertiser_name character varying(255),
    contact_email character varying(255),
    contact_phone character varying(50),
    media_type character varying(20) NOT NULL,
    media_url text NOT NULL,
    media_urls jsonb,
    thumbnail_url text,
    ad_space_id integer,
    placement_priority integer DEFAULT 0,
    target_pages text[],
    target_categories text[],
    target_locations text[],
    click_action character varying(50),
    target_url text,
    target_store_id integer,
    target_listing_id integer,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    schedule_config jsonb,
    pricing_model character varying(20),
    budget_amount numeric(10,2),
    spent_amount numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'draft'::character varying,
    is_active boolean DEFAULT false,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    created_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    style_config jsonb DEFAULT '{}'::jsonb,
    layout_template character varying(50) DEFAULT 'standard'::character varying
);


ALTER TABLE public.advertisements OWNER TO postgres;

--
-- Name: TABLE advertisements; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.advertisements IS 'Stores all advertisements from vendors, external advertisers, and platform';


--
-- Name: advertisements_ad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advertisements_ad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.advertisements_ad_id_seq OWNER TO postgres;

--
-- Name: advertisements_ad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advertisements_ad_id_seq OWNED BY public.advertisements.ad_id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    user_id integer,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    status public.order_status DEFAULT 'pending'::public.order_status,
    shipping_address text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    order_type character varying(20) DEFAULT 'pickup'::character varying,
    delivery_fee numeric(10,2) DEFAULT 0.00,
    delivery_lat numeric(10,8),
    delivery_lng numeric(11,8),
    assigned_driver_id integer,
    estimated_delivery_time timestamp without time zone,
    order_number character varying(50),
    guest_email character varying(255),
    guest_phone character varying(50),
    store_id integer,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    service_fee numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    delivery_type character varying(20) DEFAULT 'pickup'::character varying,
    delivery_address jsonb,
    delivery_instructions text,
    actual_delivery_time timestamp without time zone,
    driver_accepted_at timestamp without time zone,
    driver_picked_up_at timestamp without time zone,
    driver_delivered_at timestamp without time zone,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    payment_provider character varying(50),
    payment_intent_id character varying(255),
    payment_confirmed_at timestamp without time zone,
    refund_amount numeric(12,2) DEFAULT 0,
    refund_reason text,
    refunded_at timestamp without time zone,
    refunded_by integer,
    cancelled_at timestamp without time zone,
    cancelled_by integer,
    cancellation_reason text,
    commission_amount numeric(12,2) DEFAULT 0,
    commission_rate numeric(5,2) DEFAULT 0,
    vendor_payout_amount numeric(12,2) DEFAULT 0,
    vendor_payout_status character varying(50) DEFAULT 'pending'::character varying,
    vendor_payout_id character varying(255),
    vendor_paid_at timestamp without time zone,
    source character varying(50) DEFAULT 'web'::character varying,
    device_info jsonb,
    ip_address inet,
    user_agent text,
    paid_at timestamp without time zone,
    processed_at timestamp without time zone,
    completed_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: analytics_customers; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_customers AS
 SELECT orders.user_id,
    count(*) AS total_orders,
    sum(orders.total_amount) AS total_spent,
    avg(orders.total_amount) AS avg_order_value,
    min(orders.created_at) AS first_order,
    max(orders.created_at) AS last_order,
    (max(orders.created_at) - min(orders.created_at)) AS customer_lifetime_days,
        CASE
            WHEN (max(orders.created_at) >= (CURRENT_DATE - '30 days'::interval)) THEN 'active'::text
            WHEN (max(orders.created_at) >= (CURRENT_DATE - '90 days'::interval)) THEN 'recent'::text
            ELSE 'inactive'::text
        END AS customer_status
   FROM public.orders
  WHERE ((orders.status <> 'cancelled'::public.order_status) AND (orders.user_id IS NOT NULL))
  GROUP BY orders.user_id;


ALTER TABLE public.analytics_customers OWNER TO postgres;

--
-- Name: analytics_order_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_order_status AS
 SELECT orders.store_id,
    orders.status,
    count(*) AS order_count,
    sum(orders.total_amount) AS total_amount,
    avg(orders.total_amount) AS avg_amount,
    min(orders.created_at) AS first_order,
    max(orders.created_at) AS last_order
   FROM public.orders
  GROUP BY orders.store_id, orders.status;


ALTER TABLE public.analytics_order_status OWNER TO postgres;

--
-- Name: analytics_payment_methods; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_payment_methods AS
 SELECT orders.store_id,
    orders.payment_method,
    orders.payment_provider,
    count(*) AS transaction_count,
    sum(orders.total_amount) AS total_amount,
    avg(orders.total_amount) AS avg_amount,
    count(
        CASE
            WHEN ((orders.status)::text = 'completed'::text) THEN 1
            ELSE NULL::integer
        END) AS successful_count,
    count(
        CASE
            WHEN ((orders.status)::text = 'failed'::text) THEN 1
            ELSE NULL::integer
        END) AS failed_count
   FROM public.orders
  WHERE (orders.created_at >= (CURRENT_DATE - '90 days'::interval))
  GROUP BY orders.store_id, orders.payment_method, orders.payment_provider;


ALTER TABLE public.analytics_payment_methods OWNER TO postgres;

--
-- Name: analytics_platform_overview; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_platform_overview AS
 SELECT date(orders.created_at) AS date,
    count(*) AS total_orders,
    count(DISTINCT orders.store_id) AS active_stores,
    count(DISTINCT orders.user_id) AS active_customers,
    sum(orders.total_amount) AS total_revenue,
    sum(orders.commission_amount) AS total_commission,
    sum(orders.vendor_payout_amount) AS total_vendor_payouts,
    avg(orders.total_amount) AS avg_order_value
   FROM public.orders
  WHERE (orders.status <> 'cancelled'::public.order_status)
  GROUP BY (date(orders.created_at));


ALTER TABLE public.analytics_platform_overview OWNER TO postgres;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    type character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    price numeric(12,2),
    creator_id integer NOT NULL,
    category character varying(50),
    goal_amount numeric(12,2),
    current_amount numeric(12,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'XCD'::character varying,
    status character varying(20) DEFAULT 'draft'::character varying,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date timestamp without time zone,
    verified boolean DEFAULT false,
    featured boolean DEFAULT false,
    commission_rate numeric(5,2) DEFAULT 5.00,
    subscription_tier character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metadata jsonb DEFAULT '{}'::jsonb,
    images text[],
    rental_category character varying(50),
    rental_subtype character varying(50),
    is_promoted boolean DEFAULT false,
    search_vector tsvector,
    store_id integer,
    badges text[] DEFAULT '{}'::text[],
    rental_period text,
    deposit_amount numeric(10,2),
    price_per_week numeric(10,2),
    sub_category text,
    duration character varying(100),
    capacity integer,
    location text,
    addons jsonb DEFAULT '[]'::jsonb,
    service_type character varying(50),
    pickup_location jsonb,
    dropoff_location jsonb,
    driver_id integer,
    vehicle_category character varying(50),
    schedule_time timestamp without time zone,
    transport_status character varying(50) DEFAULT 'pending'::character varying,
    waypoints jsonb DEFAULT '[]'::jsonb,
    extra_details jsonb DEFAULT '{}'::jsonb,
    pricing_details jsonb DEFAULT '{}'::jsonb,
    photos jsonb DEFAULT '[]'::jsonb,
    category_id integer,
    subtype_id integer,
    slug character varying(255),
    service_mode character varying(50),
    tour_category character varying(50),
    scheduled_time timestamp without time zone,
    surge_multiplier numeric(3,2) DEFAULT 1.00,
    estimated_arrival_time timestamp without time zone,
    live_lat numeric(9,6),
    live_lng numeric(9,6),
    order_id integer,
    CONSTRAINT listings_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'sold'::character varying])::text[]))),
    CONSTRAINT listings_type_check CHECK (((type)::text = ANY ((ARRAY['product'::character varying, 'service'::character varying, 'rental'::character varying, 'campaign'::character varying, 'food'::character varying])::text[])))
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    item_id integer NOT NULL,
    item_type character varying(20) NOT NULL,
    quantity integer DEFAULT 1,
    price numeric(10,2) NOT NULL,
    listing_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    item_name character varying(255),
    item_description text,
    unit_price numeric(10,2),
    total_price numeric(12,2),
    selected_variant jsonb,
    selected_addons jsonb,
    selected_sides jsonb,
    rental_start_date date,
    rental_end_date date,
    rental_days integer,
    service_date date,
    service_time_start time without time zone,
    service_time_end time without time zone,
    service_provider_id integer,
    prepared_at timestamp without time zone,
    ready_at timestamp without time zone,
    delivered_at timestamp without time zone,
    refund_amount numeric(12,2) DEFAULT 0,
    refund_reason text,
    notes text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: analytics_product_performance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_product_performance AS
 SELECT oi.listing_id,
    l.title AS product_name,
    l.store_id,
    count(DISTINCT oi.order_id) AS order_count,
    sum(oi.quantity) AS units_sold,
    sum(oi.total_price) AS total_revenue,
    avg(oi.unit_price) AS avg_price,
    min(oi.created_at) AS first_sale,
    max(oi.created_at) AS last_sale
   FROM ((public.order_items oi
     JOIN public.listings l ON ((oi.listing_id = l.id)))
     JOIN public.orders o ON ((oi.order_id = o.order_id)))
  WHERE (o.status <> 'cancelled'::public.order_status)
  GROUP BY oi.listing_id, l.title, l.store_id;


ALTER TABLE public.analytics_product_performance OWNER TO postgres;

--
-- Name: analytics_revenue_trends; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_revenue_trends AS
 WITH daily_revenue AS (
         SELECT orders.store_id,
            date(orders.created_at) AS date,
            sum(orders.total_amount) AS daily_revenue,
            count(*) AS daily_orders
           FROM public.orders
          WHERE ((orders.status <> 'cancelled'::public.order_status) AND (orders.created_at >= (CURRENT_DATE - '90 days'::interval)))
          GROUP BY orders.store_id, (date(orders.created_at))
        ), rolling_averages AS (
         SELECT daily_revenue.store_id,
            daily_revenue.date,
            daily_revenue.daily_revenue,
            daily_revenue.daily_orders,
            avg(daily_revenue.daily_revenue) OVER (PARTITION BY daily_revenue.store_id ORDER BY daily_revenue.date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS revenue_7d_avg,
            avg(daily_revenue.daily_revenue) OVER (PARTITION BY daily_revenue.store_id ORDER BY daily_revenue.date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS revenue_30d_avg,
            sum(daily_revenue.daily_revenue) OVER (PARTITION BY daily_revenue.store_id ORDER BY daily_revenue.date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS revenue_7d_total,
            sum(daily_revenue.daily_revenue) OVER (PARTITION BY daily_revenue.store_id ORDER BY daily_revenue.date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS revenue_30d_total
           FROM daily_revenue
        )
 SELECT rolling_averages.store_id,
    rolling_averages.date,
    rolling_averages.daily_revenue,
    rolling_averages.daily_orders,
    rolling_averages.revenue_7d_avg,
    rolling_averages.revenue_30d_avg,
    rolling_averages.revenue_7d_total,
    rolling_averages.revenue_30d_total
   FROM rolling_averages;


ALTER TABLE public.analytics_revenue_trends OWNER TO postgres;

--
-- Name: analytics_sales_overview; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_sales_overview AS
 SELECT date(orders.created_at) AS date,
    orders.store_id,
    count(*) AS total_orders,
    sum(orders.total_amount) AS total_revenue,
    sum(orders.subtotal) AS total_subtotal,
    sum(orders.tax_amount) AS total_tax,
    sum(orders.service_fee) AS total_fees,
    sum(orders.delivery_fee) AS total_delivery_fees,
    sum(orders.discount_amount) AS total_discounts,
    avg(orders.total_amount) AS avg_order_value,
    count(DISTINCT orders.user_id) AS unique_customers
   FROM public.orders
  WHERE (orders.status <> 'cancelled'::public.order_status)
  GROUP BY (date(orders.created_at)), orders.store_id;


ALTER TABLE public.analytics_sales_overview OWNER TO postgres;

--
-- Name: analytics_sales_patterns; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.analytics_sales_patterns AS
 SELECT orders.store_id,
    EXTRACT(hour FROM orders.created_at) AS hour_of_day,
    EXTRACT(dow FROM orders.created_at) AS day_of_week,
    count(*) AS order_count,
    sum(orders.total_amount) AS total_revenue,
    avg(orders.total_amount) AS avg_order_value
   FROM public.orders
  WHERE ((orders.status <> 'cancelled'::public.order_status) AND (orders.created_at >= (CURRENT_DATE - '90 days'::interval)))
  GROUP BY orders.store_id, (EXTRACT(hour FROM orders.created_at)), (EXTRACT(dow FROM orders.created_at));


ALTER TABLE public.analytics_sales_patterns OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    table_name character varying(50),
    record_id integer,
    old_values json,
    new_values json,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: campaign_change_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_change_requests (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    admin_id integer NOT NULL,
    feedback text NOT NULL,
    status character varying(20) DEFAULT 'requested'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaign_change_requests_status_check CHECK (((status)::text = ANY ((ARRAY['requested'::character varying, 'addressed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.campaign_change_requests OWNER TO postgres;

--
-- Name: campaign_change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.campaign_change_requests_id_seq OWNER TO postgres;

--
-- Name: campaign_change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_change_requests_id_seq OWNED BY public.campaign_change_requests.id;


--
-- Name: campaign_creator_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_creator_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tier character varying(20) DEFAULT 'individual'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    dodo_subscription_id character varying(255),
    dodo_customer_id character varying(255),
    dodo_price_id character varying(255),
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    cancel_at_period_end boolean DEFAULT false,
    platform_fee numeric(5,2) DEFAULT 5.00 NOT NULL,
    max_campaigns integer DEFAULT 3 NOT NULL,
    nonprofit_verified boolean DEFAULT false,
    nonprofit_verification_date timestamp without time zone,
    nonprofit_tax_id character varying(100),
    features jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaign_creator_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'past_due'::character varying, 'cancelled'::character varying, 'incomplete'::character varying])::text[]))),
    CONSTRAINT campaign_creator_subscriptions_tier_check CHECK (((tier)::text = ANY ((ARRAY['individual'::character varying, 'organization'::character varying, 'nonprofit'::character varying])::text[])))
);


ALTER TABLE public.campaign_creator_subscriptions OWNER TO postgres;

--
-- Name: TABLE campaign_creator_subscriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.campaign_creator_subscriptions IS 'Campaign creators start with individual tier (free)';


--
-- Name: COLUMN campaign_creator_subscriptions.tier; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.campaign_creator_subscriptions.tier IS 'Creator tier: individual, organization, or nonprofit';


--
-- Name: COLUMN campaign_creator_subscriptions.cancel_at_period_end; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.campaign_creator_subscriptions.cancel_at_period_end IS 'If true, subscription will be cancelled at current_period_end';


--
-- Name: COLUMN campaign_creator_subscriptions.platform_fee; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.campaign_creator_subscriptions.platform_fee IS 'Platform fee percentage (e.g., 5.00 = 5%)';


--
-- Name: COLUMN campaign_creator_subscriptions.max_campaigns; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.campaign_creator_subscriptions.max_campaigns IS 'Maximum number of active campaigns allowed for this tier';


--
-- Name: COLUMN campaign_creator_subscriptions.nonprofit_verified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.campaign_creator_subscriptions.nonprofit_verified IS 'Whether nonprofit status has been verified by admin';


--
-- Name: COLUMN campaign_creator_subscriptions.features; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.campaign_creator_subscriptions.features IS 'JSONB object containing tier-specific features (analytics, priority support, etc.)';


--
-- Name: campaign_creator_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_creator_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.campaign_creator_subscriptions_id_seq OWNER TO postgres;

--
-- Name: campaign_creator_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_creator_subscriptions_id_seq OWNED BY public.campaign_creator_subscriptions.id;


--
-- Name: campaign_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_updates (
    update_id integer NOT NULL,
    creator_id integer,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    listing_id integer NOT NULL,
    is_public boolean DEFAULT true
);


ALTER TABLE public.campaign_updates OWNER TO postgres;

--
-- Name: campaign_updates_update_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_updates_update_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.campaign_updates_update_id_seq OWNER TO postgres;

--
-- Name: campaign_updates_update_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_updates_update_id_seq OWNED BY public.campaign_updates.update_id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    campaign_id integer NOT NULL,
    user_id integer,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    category character varying(50),
    goal_amount numeric(12,2) NOT NULL,
    current_amount numeric(12,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'USD'::character varying,
    status character varying(20) DEFAULT 'draft'::character varying,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date timestamp without time zone,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: campaigns_campaign_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaigns_campaign_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.campaigns_campaign_id_seq OWNER TO postgres;

--
-- Name: campaigns_campaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaigns_campaign_id_seq OWNED BY public.campaigns.campaign_id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    item_id integer NOT NULL,
    cart_id integer,
    listing_id integer,
    quantity integer DEFAULT 1,
    rental_start_date date,
    rental_end_date date,
    rental_duration_days integer,
    service_package character varying(100),
    appointment_slot timestamp without time zone,
    selected_variant jsonb,
    price_snapshot numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    selected_addons jsonb DEFAULT '[]'::jsonb,
    selected_sides jsonb DEFAULT '[]'::jsonb,
    service_package_id integer,
    notes text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: cart_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_items_item_id_seq OWNER TO postgres;

--
-- Name: cart_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_item_id_seq OWNED BY public.cart_items.item_id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    cart_id integer NOT NULL,
    user_id integer,
    session_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delivery_type character varying(20) DEFAULT 'pickup'::character varying,
    delivery_address text,
    delivery_instructions text,
    delivery_lat numeric(10,8),
    delivery_lng numeric(11,8),
    delivery_fee numeric(10,2) DEFAULT 0
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: carts_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carts_cart_id_seq OWNER TO postgres;

--
-- Name: carts_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_cart_id_seq OWNED BY public.carts.cart_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_category_id_seq OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: category_form_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_form_fields (
    field_id integer NOT NULL,
    category_id integer,
    subtype_id integer,
    field_key character varying(50) NOT NULL,
    field_type character varying(30) NOT NULL,
    field_label character varying(100) NOT NULL,
    field_placeholder character varying(255),
    options jsonb,
    is_required boolean DEFAULT false,
    validation_rules jsonb,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);


ALTER TABLE public.category_form_fields OWNER TO postgres;

--
-- Name: category_form_fields_field_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.category_form_fields_field_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_form_fields_field_id_seq OWNER TO postgres;

--
-- Name: category_form_fields_field_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.category_form_fields_field_id_seq OWNED BY public.category_form_fields.field_id;


--
-- Name: customer_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tier character varying(20) DEFAULT 'general'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    dodo_subscription_id character varying(255),
    dodo_customer_id character varying(255),
    dodo_price_id character varying(255),
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    cancel_at_period_end boolean DEFAULT false,
    discount_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    rewards_multiplier numeric(3,2) DEFAULT 1.00 NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'past_due'::character varying, 'cancelled'::character varying, 'incomplete'::character varying])::text[]))),
    CONSTRAINT customer_subscriptions_tier_check CHECK (((tier)::text = ANY ((ARRAY['general'::character varying, 'vip'::character varying])::text[])))
);


ALTER TABLE public.customer_subscriptions OWNER TO postgres;

--
-- Name: TABLE customer_subscriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.customer_subscriptions IS 'All customers start with general tier (free)';


--
-- Name: COLUMN customer_subscriptions.tier; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer_subscriptions.tier IS 'Customer tier: general (free) or vip (paid)';


--
-- Name: COLUMN customer_subscriptions.cancel_at_period_end; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer_subscriptions.cancel_at_period_end IS 'If true, subscription will be cancelled at current_period_end';


--
-- Name: COLUMN customer_subscriptions.discount_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer_subscriptions.discount_rate IS 'Discount percentage applied at checkout (e.g., 10.00 = 10%)';


--
-- Name: COLUMN customer_subscriptions.rewards_multiplier; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer_subscriptions.rewards_multiplier IS 'Rewards points multiplier (e.g., 2.00 = 2x points)';


--
-- Name: COLUMN customer_subscriptions.features; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer_subscriptions.features IS 'JSONB object containing tier-specific features (early access, exclusive deals, etc.)';


--
-- Name: customer_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_subscriptions_id_seq OWNER TO postgres;

--
-- Name: customer_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_subscriptions_id_seq OWNED BY public.customer_subscriptions.id;


--
-- Name: delivery_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_ratings (
    rating_id integer NOT NULL,
    delivery_id integer,
    customer_id integer,
    driver_id integer,
    rating integer NOT NULL,
    review text,
    driver_response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT delivery_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.delivery_ratings OWNER TO postgres;

--
-- Name: delivery_ratings_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_ratings_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_ratings_rating_id_seq OWNER TO postgres;

--
-- Name: delivery_ratings_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_ratings_rating_id_seq OWNED BY public.delivery_ratings.rating_id;


--
-- Name: donations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donations (
    donation_id integer NOT NULL,
    campaign_id integer NOT NULL,
    user_id integer,
    amount numeric(12,2) NOT NULL,
    message text,
    status character varying(20) DEFAULT 'completed'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.donations OWNER TO postgres;

--
-- Name: donations_donation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donations_donation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.donations_donation_id_seq OWNER TO postgres;

--
-- Name: donations_donation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donations_donation_id_seq OWNED BY public.donations.donation_id;


--
-- Name: driver_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_applications (
    application_id integer NOT NULL,
    user_id integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    vehicle_type character varying(50) NOT NULL,
    vehicle_make character varying(100),
    vehicle_model character varying(100),
    vehicle_year integer,
    vehicle_plate character varying(50),
    vehicle_color character varying(50),
    license_number character varying(100),
    license_expiry date,
    license_photo_url character varying(512),
    vehicle_photo_url character varying(512),
    insurance_photo_url character varying(512),
    background_check_status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.driver_applications OWNER TO postgres;

--
-- Name: driver_applications_application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_applications_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driver_applications_application_id_seq OWNER TO postgres;

--
-- Name: driver_applications_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_applications_application_id_seq OWNED BY public.driver_applications.application_id;


--
-- Name: driver_payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_payouts (
    id integer NOT NULL,
    driver_id integer,
    delivery_id integer,
    amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.driver_payouts OWNER TO postgres;

--
-- Name: driver_payouts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_payouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driver_payouts_id_seq OWNER TO postgres;

--
-- Name: driver_payouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_payouts_id_seq OWNED BY public.driver_payouts.id;


--
-- Name: driver_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_profiles (
    id integer NOT NULL,
    user_id integer,
    license_number text,
    license_expiry date,
    verification_status text DEFAULT 'pending'::text,
    rejection_reason text,
    documents jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.driver_profiles OWNER TO postgres;

--
-- Name: driver_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driver_profiles_id_seq OWNER TO postgres;

--
-- Name: driver_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_profiles_id_seq OWNED BY public.driver_profiles.id;


--
-- Name: failed_login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_login_attempts (
    attempt_id integer NOT NULL,
    email character varying(255),
    ip_address inet,
    attempted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_agent text,
    success boolean DEFAULT false
);


ALTER TABLE public.failed_login_attempts OWNER TO postgres;

--
-- Name: failed_login_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_login_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_login_attempts_attempt_id_seq OWNER TO postgres;

--
-- Name: failed_login_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_login_attempts_attempt_id_seq OWNED BY public.failed_login_attempts.attempt_id;


--
-- Name: hero_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hero_assets (
    id integer NOT NULL,
    page_key character varying(50) NOT NULL,
    asset_url text NOT NULL,
    asset_type character varying(10) DEFAULT 'image'::character varying,
    overlay_color character varying(20) DEFAULT '#000000'::character varying,
    overlay_opacity numeric(3,2) DEFAULT 0.4,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title text,
    subtitle text,
    cta_text text,
    cta_link text,
    icon_url text,
    typography jsonb DEFAULT '{}'::jsonb,
    cta2_text text,
    cta2_link text,
    layout_template character varying(50) DEFAULT 'standard'::character varying,
    style_config jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT hero_assets_asset_type_check CHECK (((asset_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[])))
);


ALTER TABLE public.hero_assets OWNER TO postgres;

--
-- Name: hero_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hero_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.hero_assets_id_seq OWNER TO postgres;

--
-- Name: hero_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hero_assets_id_seq OWNED BY public.hero_assets.id;


--
-- Name: listing_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing_views (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    user_id integer,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_promoted boolean DEFAULT false
);


ALTER TABLE public.listing_views OWNER TO postgres;

--
-- Name: listing_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listing_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listing_views_id_seq OWNER TO postgres;

--
-- Name: listing_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listing_views_id_seq OWNED BY public.listing_views.id;


--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listings_id_seq OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: logistics_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logistics_pricing (
    id integer NOT NULL,
    service_type character varying(20) NOT NULL,
    vehicle_category character varying(20) NOT NULL,
    base_fare numeric(10,2) DEFAULT 0.00,
    per_km_rate numeric(10,2) DEFAULT 0.00,
    per_min_rate numeric(10,2) DEFAULT 0.00,
    minimum_fare numeric(10,2) DEFAULT 0.00,
    surge_multiplier numeric(10,2) DEFAULT 1.00,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    extra_passenger_fee numeric(10,2) DEFAULT 0,
    item_size_multipliers jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.logistics_pricing OWNER TO postgres;

--
-- Name: logistics_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logistics_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logistics_pricing_id_seq OWNER TO postgres;

--
-- Name: logistics_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logistics_pricing_id_seq OWNED BY public.logistics_pricing.id;


--
-- Name: marquee_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marquee_templates (
    template_id integer NOT NULL,
    name text NOT NULL,
    content text NOT NULL,
    priority integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.marquee_templates OWNER TO postgres;

--
-- Name: marquee_templates_template_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marquee_templates_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.marquee_templates_template_id_seq OWNER TO postgres;

--
-- Name: marquee_templates_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marquee_templates_template_id_seq OWNED BY public.marquee_templates.template_id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    user_id integer,
    filename character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    file_type character varying(50),
    file_size integer,
    is_public boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: menu_addons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_addons (
    addon_id integer NOT NULL,
    item_id integer NOT NULL,
    addon_name character varying(100) NOT NULL,
    price numeric(12,2) DEFAULT 0.00
);


ALTER TABLE public.menu_addons OWNER TO postgres;

--
-- Name: menu_addons_addon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_addons_addon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menu_addons_addon_id_seq OWNER TO postgres;

--
-- Name: menu_addons_addon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_addons_addon_id_seq OWNED BY public.menu_addons.addon_id;


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    item_id integer NOT NULL,
    section_id integer NOT NULL,
    item_name character varying(100) NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    image_url character varying(255),
    badges jsonb DEFAULT '[]'::jsonb,
    addons jsonb DEFAULT '[]'::jsonb,
    donation_suggested boolean DEFAULT false,
    listing_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    variants jsonb DEFAULT '[]'::jsonb,
    side_ids integer[] DEFAULT '{}'::integer[],
    duration character varying(100),
    availability jsonb DEFAULT '{}'::jsonb,
    faqs jsonb DEFAULT '[]'::jsonb,
    price_per_week numeric(10,2),
    deposit_amount numeric(10,2),
    rental_period text,
    photos jsonb DEFAULT '[]'::jsonb,
    prep_time integer DEFAULT 0
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- Name: menu_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menu_items_item_id_seq OWNER TO postgres;

--
-- Name: menu_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_items_item_id_seq OWNED BY public.menu_items.item_id;


--
-- Name: menu_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_sections (
    section_id integer NOT NULL,
    store_id integer NOT NULL,
    section_name character varying(100) NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    listing_id integer
);


ALTER TABLE public.menu_sections OWNER TO postgres;

--
-- Name: menu_sections_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_sections_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menu_sections_section_id_seq OWNER TO postgres;

--
-- Name: menu_sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_sections_section_id_seq OWNED BY public.menu_sections.section_id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false,
    attachment_url text,
    order_id integer
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_message_id_seq OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    history_id integer NOT NULL,
    order_id integer,
    status character varying(50) NOT NULL,
    previous_status character varying(50),
    changed_by integer,
    changed_by_type character varying(50),
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: order_status_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_status_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_status_history_history_id_seq OWNER TO postgres;

--
-- Name: order_status_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_history_history_id_seq OWNED BY public.order_status_history.history_id;


--
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_order_id_seq OWNER TO postgres;

--
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- Name: partner_wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partner_wallets (
    wallet_id integer NOT NULL,
    user_id integer NOT NULL,
    store_id integer,
    partner_type character varying(20) NOT NULL,
    balance numeric(15,2) DEFAULT 0,
    withdrawable_balance numeric(15,2) DEFAULT 0,
    pending_payouts numeric(15,2) DEFAULT 0,
    lifetime_earnings numeric(15,2) DEFAULT 0,
    currency character varying(10) DEFAULT 'USD'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT partner_wallets_partner_type_check CHECK (((partner_type)::text = ANY ((ARRAY['vendor'::character varying, 'driver'::character varying])::text[])))
);


ALTER TABLE public.partner_wallets OWNER TO postgres;

--
-- Name: partner_wallets_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partner_wallets_wallet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.partner_wallets_wallet_id_seq OWNER TO postgres;

--
-- Name: partner_wallets_wallet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partner_wallets_wallet_id_seq OWNED BY public.partner_wallets.wallet_id;


--
-- Name: payout_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payout_requests (
    request_id integer NOT NULL,
    user_id integer NOT NULL,
    wallet_id integer NOT NULL,
    amount numeric(15,2) NOT NULL,
    payout_method character varying(50) NOT NULL,
    payout_details jsonb NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    transaction_id integer,
    processed_at timestamp without time zone,
    processed_by integer,
    rejection_reason text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payout_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.payout_requests OWNER TO postgres;

--
-- Name: payout_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payout_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payout_requests_request_id_seq OWNER TO postgres;

--
-- Name: payout_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payout_requests_request_id_seq OWNED BY public.payout_requests.request_id;


--
-- Name: payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payouts (
    payout_id integer NOT NULL,
    vendor_id integer,
    amount numeric(10,2),
    currency character varying(3) DEFAULT 'XCD'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    payout_method character varying(50),
    payout_reference character varying(255),
    period_start date,
    period_end date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone
);


ALTER TABLE public.payouts OWNER TO postgres;

--
-- Name: payouts_payout_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payouts_payout_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payouts_payout_id_seq OWNER TO postgres;

--
-- Name: payouts_payout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payouts_payout_id_seq OWNED BY public.payouts.payout_id;


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    variant_id integer NOT NULL,
    listing_id integer NOT NULL,
    variant_key character varying(50) NOT NULL,
    variant_value character varying(50) NOT NULL,
    sku character varying(100),
    inventory_count integer DEFAULT 0,
    price_adjustment numeric(12,2) DEFAULT 0.00
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_variants_variant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_variants_variant_id_seq OWNER TO postgres;

--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_variants_variant_id_seq OWNED BY public.product_variants.variant_id;


--
-- Name: promotional_banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotional_banners (
    banner_id integer NOT NULL,
    title character varying(255) NOT NULL,
    subtitle text,
    image_url text,
    target_url text,
    location character varying(50) DEFAULT 'marketplace_hero'::character varying NOT NULL,
    color_theme character varying(20) DEFAULT 'teal'::character varying NOT NULL,
    mobile_mode character varying(20) DEFAULT 'hero'::character varying NOT NULL,
    dismissible boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    url_pattern text,
    match_type character varying(20) DEFAULT 'exact'::character varying,
    icon character varying(50),
    alignment character varying(20) DEFAULT 'left'::character varying,
    template_type character varying(20) DEFAULT 'standard'::character varying
);


ALTER TABLE public.promotional_banners OWNER TO postgres;

--
-- Name: TABLE promotional_banners; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.promotional_banners IS 'Promotional banners for hero sections with dual-mode rendering (desktop hero embed + mobile floating card)';


--
-- Name: COLUMN promotional_banners.mobile_mode; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.promotional_banners.mobile_mode IS 'Display mode: hero (embedded in hero section) or floating (mobile overlay with dismiss button)';


--
-- Name: COLUMN promotional_banners.dismissible; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.promotional_banners.dismissible IS 'Whether mobile floating banners can be dismissed by users';


--
-- Name: promotional_banners_banner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotional_banners_banner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotional_banners_banner_id_seq OWNER TO postgres;

--
-- Name: promotional_banners_banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotional_banners_banner_id_seq OWNED BY public.promotional_banners.banner_id;


--
-- Name: rental_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_availability (
    availability_id integer NOT NULL,
    listing_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_available boolean DEFAULT true
);


ALTER TABLE public.rental_availability OWNER TO postgres;

--
-- Name: rental_availability_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rental_availability_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rental_availability_availability_id_seq OWNER TO postgres;

--
-- Name: rental_availability_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rental_availability_availability_id_seq OWNED BY public.rental_availability.availability_id;


--
-- Name: rental_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_pricing (
    pricing_id integer NOT NULL,
    listing_id integer NOT NULL,
    vehicle_type character varying(50),
    base_price numeric(12,2) NOT NULL,
    notes text
);


ALTER TABLE public.rental_pricing OWNER TO postgres;

--
-- Name: rental_pricing_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rental_pricing_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rental_pricing_pricing_id_seq OWNER TO postgres;

--
-- Name: rental_pricing_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rental_pricing_pricing_id_seq OWNED BY public.rental_pricing.pricing_id;


--
-- Name: rental_seasonal_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_seasonal_rates (
    seasonal_id integer NOT NULL,
    listing_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    adjusted_price numeric(12,2) NOT NULL,
    description text
);


ALTER TABLE public.rental_seasonal_rates OWNER TO postgres;

--
-- Name: rental_seasonal_rates_seasonal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rental_seasonal_rates_seasonal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rental_seasonal_rates_seasonal_id_seq OWNER TO postgres;

--
-- Name: rental_seasonal_rates_seasonal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rental_seasonal_rates_seasonal_id_seq OWNED BY public.rental_seasonal_rates.seasonal_id;


--
-- Name: rentals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rentals (
    rental_id integer NOT NULL,
    vendor_id integer NOT NULL,
    listing_id integer NOT NULL,
    rental_type character varying(50) NOT NULL,
    location text,
    availability_calendar jsonb DEFAULT '{}'::jsonb,
    deposit_amount numeric(10,2) DEFAULT 0,
    price_per_day numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rentals OWNER TO postgres;

--
-- Name: rentals_rental_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rentals_rental_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rentals_rental_id_seq OWNER TO postgres;

--
-- Name: rentals_rental_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rentals_rental_id_seq OWNED BY public.rentals.rental_id;


--
-- Name: revenue_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.revenue_orders (
    order_id integer NOT NULL,
    user_id integer,
    vendor_id integer,
    listing_id integer,
    amount numeric(10,2) NOT NULL,
    commission numeric(10,2) DEFAULT 0,
    net_revenue numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    transaction_id text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.revenue_orders OWNER TO postgres;

--
-- Name: revenue_orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.revenue_orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.revenue_orders_order_id_seq OWNER TO postgres;

--
-- Name: revenue_orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.revenue_orders_order_id_seq OWNED BY public.revenue_orders.order_id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    vendor_id integer,
    listing_id integer,
    order_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified boolean DEFAULT false,
    reply_text text,
    replied_at timestamp without time zone,
    replied_by integer,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_review_id_seq OWNER TO postgres;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: seasonal_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasonal_rates (
    rate_id integer NOT NULL,
    listing_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    price numeric(12,2) NOT NULL,
    notes text
);


ALTER TABLE public.seasonal_rates OWNER TO postgres;

--
-- Name: seasonal_rates_rate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seasonal_rates_rate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seasonal_rates_rate_id_seq OWNER TO postgres;

--
-- Name: seasonal_rates_rate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seasonal_rates_rate_id_seq OWNED BY public.seasonal_rates.rate_id;


--
-- Name: security_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_audit_log (
    log_id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id character varying(100),
    ip_address inet,
    user_agent text,
    details jsonb,
    severity character varying(20) DEFAULT 'info'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.security_audit_log OWNER TO postgres;

--
-- Name: security_audit_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.security_audit_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.security_audit_log_log_id_seq OWNER TO postgres;

--
-- Name: security_audit_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.security_audit_log_log_id_seq OWNED BY public.security_audit_log.log_id;


--
-- Name: service_calendars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_calendars (
    calendar_id integer NOT NULL,
    listing_id integer NOT NULL,
    day_of_week character varying(10) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    duration_min integer DEFAULT 60
);


ALTER TABLE public.service_calendars OWNER TO postgres;

--
-- Name: service_calendars_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_calendars_calendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_calendars_calendar_id_seq OWNER TO postgres;

--
-- Name: service_calendars_calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_calendars_calendar_id_seq OWNED BY public.service_calendars.calendar_id;


--
-- Name: settings_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings_audit (
    id integer NOT NULL,
    admin_id integer,
    setting_key character varying(100) NOT NULL,
    old_value text,
    new_value text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings_audit OWNER TO postgres;

--
-- Name: settings_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_audit_id_seq OWNER TO postgres;

--
-- Name: settings_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_audit_id_seq OWNED BY public.settings_audit.id;


--
-- Name: site_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_sections (
    id integer NOT NULL,
    store_id integer,
    name character varying(100) NOT NULL,
    section_type character varying(50) DEFAULT 'standard'::character varying,
    title character varying(255),
    body text,
    cta_text character varying(100),
    cta_link character varying(255),
    image_url text,
    list_items jsonb DEFAULT '[]'::jsonb,
    style_config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_sections OWNER TO postgres;

--
-- Name: site_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.site_sections_id_seq OWNER TO postgres;

--
-- Name: site_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_sections_id_seq OWNED BY public.site_sections.id;


--
-- Name: store_template_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_template_configs (
    config_id integer NOT NULL,
    store_id integer,
    template_id integer,
    configuration jsonb DEFAULT '{}'::jsonb,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    enabled_features jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.store_template_configs OWNER TO postgres;

--
-- Name: store_template_configs_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_template_configs_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.store_template_configs_config_id_seq OWNER TO postgres;

--
-- Name: store_template_configs_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_template_configs_config_id_seq OWNED BY public.store_template_configs.config_id;


--
-- Name: store_template_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_template_features (
    feature_id integer NOT NULL,
    template_id integer,
    feature_key character varying(50) NOT NULL,
    feature_name character varying(100) NOT NULL,
    description text,
    is_required boolean DEFAULT false,
    configuration jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.store_template_features OWNER TO postgres;

--
-- Name: store_template_features_feature_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_template_features_feature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.store_template_features_feature_id_seq OWNER TO postgres;

--
-- Name: store_template_features_feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_template_features_feature_id_seq OWNED BY public.store_template_features.feature_id;


--
-- Name: store_template_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_template_types (
    template_id integer NOT NULL,
    template_key character varying(50) NOT NULL,
    template_name character varying(100) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    icon character varying(50),
    color_theme character varying(20) DEFAULT 'teal'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.store_template_types OWNER TO postgres;

--
-- Name: store_template_types_template_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_template_types_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.store_template_types_template_id_seq OWNER TO postgres;

--
-- Name: store_template_types_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_template_types_template_id_seq OWNED BY public.store_template_types.template_id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stores (
    store_id integer NOT NULL,
    vendor_id integer,
    category character varying(50),
    subtype character varying(50),
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    logo_url text,
    banner_url text,
    subscription_type character varying(20) DEFAULT 'basic'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    badges text[] DEFAULT '{}'::text[],
    hero_title character varying(255) DEFAULT NULL::character varying,
    show_hero_title boolean DEFAULT true,
    branding_color text,
    secondary_color text,
    category_type character varying(50),
    hero_subtitle text,
    hero_cta_text text,
    hero_cta_link text,
    hero_icon_url text,
    typography jsonb DEFAULT '{}'::jsonb,
    branding_icon_url text,
    hero_cta2_text text,
    hero_cta2_link text,
    category_id integer,
    subtype_id integer,
    secondary_subtypes integer[],
    aims text,
    objectives text,
    website_url text,
    business_address text,
    business_hours jsonb DEFAULT '{}'::jsonb,
    service_mode character varying(50) DEFAULT 'walk-in'::character varying,
    template_id character varying(50),
    template_config jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.stores OWNER TO postgres;

--
-- Name: stores_store_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stores_store_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stores_store_id_seq OWNER TO postgres;

--
-- Name: stores_store_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stores_store_id_seq OWNED BY public.stores.store_id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tier character varying(50) DEFAULT 'basic'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    expires_at timestamp without time zone,
    provider character varying(50),
    transaction_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: text_marquee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.text_marquee (
    marquee_id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    template_type character varying(20) DEFAULT 'standard'::character varying,
    icon character varying(50)
);


ALTER TABLE public.text_marquee OWNER TO postgres;

--
-- Name: text_marquee_marquee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.text_marquee_marquee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.text_marquee_marquee_id_seq OWNER TO postgres;

--
-- Name: text_marquee_marquee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.text_marquee_marquee_id_seq OWNED BY public.text_marquee.marquee_id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    transaction_id integer NOT NULL,
    campaign_id integer,
    user_id integer,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    payment_method character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_provider character varying(20) DEFAULT 'stripe'::character varying,
    external_id character varying(100),
    crypto_currency character varying(10),
    listing_id integer,
    is_donation boolean DEFAULT false,
    commission_amount numeric(12,2),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_id integer,
    provider character varying(50),
    CONSTRAINT transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_transaction_id_seq OWNER TO postgres;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_transaction_id_seq OWNED BY public.transactions.transaction_id;


--
-- Name: user_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_posts (
    post_id integer NOT NULL,
    user_id integer,
    title text,
    content text,
    media_url text,
    media_type text,
    category text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_posts OWNER TO postgres;

--
-- Name: user_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_posts_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_posts_post_id_seq OWNER TO postgres;

--
-- Name: user_posts_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_posts_post_id_seq OWNED BY public.user_posts.post_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'donor'::character varying,
    country character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    google_id character varying(255),
    avatar_url character varying(255),
    cover_photo_url character varying(500),
    metadata jsonb DEFAULT '{}'::jsonb,
    bio text,
    email_verified boolean DEFAULT false,
    profile_photo_url text,
    banner_image_url text,
    banner_color text,
    license_number character varying(50),
    vehicle_type character varying(50),
    vehicle_plate character varying(20),
    is_verified_driver boolean DEFAULT false,
    current_location point,
    vehicle_color character varying(30),
    vehicle_seating integer,
    two_factor_secret character varying(64),
    two_factor_enabled boolean DEFAULT false,
    two_factor_backup_codes jsonb,
    failed_login_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    last_login_at timestamp without time zone,
    password_changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password_history jsonb DEFAULT '[]'::jsonb,
    driver_rating numeric(3,2) DEFAULT 0,
    driver_rating_count integer DEFAULT 0,
    is_online boolean DEFAULT false,
    total_jobs_completed integer DEFAULT 0,
    live_lat double precision,
    live_lng double precision,
    last_online timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.vehicle_color; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.vehicle_color IS 'The color of the driver vehicle';


--
-- Name: COLUMN users.vehicle_seating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.vehicle_seating IS 'Number of passenger seats available in the vehicle';


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    driver_id integer,
    make text,
    model text,
    year integer,
    plate_number text,
    color text,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: vendor_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_categories (
    category_id integer NOT NULL,
    category_key character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    icon character varying(20),
    description text,
    layout_type character varying(50) DEFAULT 'product'::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vendor_categories OWNER TO postgres;

--
-- Name: vendor_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendor_categories_category_id_seq OWNER TO postgres;

--
-- Name: vendor_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_categories_category_id_seq OWNED BY public.vendor_categories.category_id;


--
-- Name: vendor_kyc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_kyc (
    kyc_id integer NOT NULL,
    vendor_id integer NOT NULL,
    documents jsonb NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    submitted_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone
);


ALTER TABLE public.vendor_kyc OWNER TO postgres;

--
-- Name: vendor_kyc_kyc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_kyc_kyc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendor_kyc_kyc_id_seq OWNER TO postgres;

--
-- Name: vendor_kyc_kyc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_kyc_kyc_id_seq OWNED BY public.vendor_kyc.kyc_id;


--
-- Name: vendor_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_promotions (
    promo_id integer NOT NULL,
    vendor_id integer NOT NULL,
    store_id integer,
    title character varying(255) NOT NULL,
    subtitle text,
    promo_type character varying(50),
    media_type character varying(20),
    media_url text,
    background_color character varying(20),
    text_color character varying(20),
    placement character varying(50),
    display_order integer DEFAULT 0,
    discount_type character varying(20),
    discount_value numeric(10,2),
    promo_code character varying(50),
    target_products integer[],
    target_categories text[],
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    is_recurring boolean DEFAULT false,
    recurrence_pattern jsonb,
    is_active boolean DEFAULT true,
    requires_approval boolean DEFAULT false,
    approved_by integer,
    views integer DEFAULT 0,
    clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approval_status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text
);


ALTER TABLE public.vendor_promotions OWNER TO postgres;

--
-- Name: TABLE vendor_promotions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vendor_promotions IS 'Vendor-specific in-store promotions and banners';


--
-- Name: vendor_promotions_promo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_promotions_promo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendor_promotions_promo_id_seq OWNER TO postgres;

--
-- Name: vendor_promotions_promo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_promotions_promo_id_seq OWNED BY public.vendor_promotions.promo_id;


--
-- Name: vendor_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_subscriptions (
    id integer NOT NULL,
    vendor_id integer NOT NULL,
    tier character varying(50) NOT NULL,
    vendor_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    dodo_subscription_id character varying(255),
    dodo_customer_id character varying(255),
    dodo_price_id character varying(255),
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    cancel_at_period_end boolean DEFAULT false,
    commission_rate numeric(5,2) DEFAULT 5.00 NOT NULL,
    max_stores integer DEFAULT 1 NOT NULL,
    max_listings_per_store integer DEFAULT 10 NOT NULL,
    features jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendor_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'past_due'::character varying, 'cancelled'::character varying, 'incomplete'::character varying])::text[]))),
    CONSTRAINT vendor_subscriptions_tier_check CHECK (((tier)::text = ANY ((ARRAY['basic_product'::character varying, 'premium_product'::character varying, 'enterprise_product'::character varying, 'basic_service'::character varying, 'premium_service'::character varying, 'enterprise_service'::character varying])::text[]))),
    CONSTRAINT vendor_subscriptions_vendor_type_check CHECK (((vendor_type)::text = ANY ((ARRAY['product'::character varying, 'service'::character varying])::text[])))
);


ALTER TABLE public.vendor_subscriptions OWNER TO postgres;

--
-- Name: TABLE vendor_subscriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vendor_subscriptions IS 'All vendors start with basic_product or basic_service tier (free)';


--
-- Name: COLUMN vendor_subscriptions.tier; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.tier IS 'Subscription tier: basic/premium/enterprise for product or service vendors';


--
-- Name: COLUMN vendor_subscriptions.vendor_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.vendor_type IS 'Type of vendor: product or service';


--
-- Name: COLUMN vendor_subscriptions.cancel_at_period_end; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.cancel_at_period_end IS 'If true, subscription will be cancelled at current_period_end';


--
-- Name: COLUMN vendor_subscriptions.commission_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.commission_rate IS 'Platform commission percentage (e.g., 5.00 = 5%)';


--
-- Name: COLUMN vendor_subscriptions.max_stores; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.max_stores IS 'Maximum number of stores allowed for this tier';


--
-- Name: COLUMN vendor_subscriptions.max_listings_per_store; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.max_listings_per_store IS 'Maximum listings per store for this tier';


--
-- Name: COLUMN vendor_subscriptions.features; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_subscriptions.features IS 'JSONB object containing tier-specific features (analytics, API access, etc.)';


--
-- Name: vendor_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendor_subscriptions_id_seq OWNER TO postgres;

--
-- Name: vendor_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_subscriptions_id_seq OWNED BY public.vendor_subscriptions.id;


--
-- Name: vendor_subtypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_subtypes (
    subtype_id integer NOT NULL,
    category_id integer,
    subtype_key character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    icon character varying(20),
    description text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vendor_subtypes OWNER TO postgres;

--
-- Name: vendor_subtypes_subtype_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_subtypes_subtype_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendor_subtypes_subtype_id_seq OWNER TO postgres;

--
-- Name: vendor_subtypes_subtype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_subtypes_subtype_id_seq OWNED BY public.vendor_subtypes.subtype_id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    user_id integer,
    business_name character varying(255) NOT NULL,
    description text,
    logo_url character varying(500),
    banner_url character varying(500),
    contact_email character varying(255),
    contact_phone character varying(50),
    location character varying(255),
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    theme_color character varying(50) DEFAULT 'teal-600'::character varying,
    bio text,
    slug character varying(100),
    sub_type character varying(50),
    kyc_status character varying(20) DEFAULT 'pending'::character varying,
    storefront_info jsonb DEFAULT '{}'::jsonb,
    is_featured boolean DEFAULT false,
    promotion_credits integer DEFAULT 0,
    search_vector tsvector,
    admin_rating numeric(2,1),
    badges jsonb DEFAULT '[]'::jsonb,
    balance numeric(10,2) DEFAULT 0.00,
    branding_color text,
    secondary_color text,
    promo_video_url text,
    audio_intro_url text,
    cover_photo_url text,
    status character varying(20) DEFAULT 'pending'::character varying,
    kyb_verified boolean DEFAULT false,
    admin_notes text,
    verified_at timestamp without time zone,
    verified_by integer,
    rejected_at timestamp without time zone,
    rejected_by integer,
    CONSTRAINT check_admin_rating CHECK (((admin_rating >= (0)::numeric) AND (admin_rating <= (5)::numeric)))
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: COLUMN vendors.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.status IS 'Vendor status: pending, active, suspended, rejected';


--
-- Name: COLUMN vendors.kyb_verified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.kyb_verified IS 'Whether KYB documents have been verified by admin';


--
-- Name: COLUMN vendors.admin_notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.admin_notes IS 'Admin notes from verification process';


--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendors_id_seq OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_transactions (
    transaction_id integer NOT NULL,
    wallet_id integer NOT NULL,
    amount numeric(15,2) NOT NULL,
    transaction_type character varying(20) NOT NULL,
    reference_type character varying(50),
    reference_id integer,
    balance_before numeric(15,2),
    balance_after numeric(15,2),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metadata jsonb,
    CONSTRAINT wallet_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['sale'::character varying, 'delivery_fee'::character varying, 'commission'::character varying, 'payout'::character varying, 'refund'::character varying, 'adjustment'::character varying, 'subscription_reward'::character varying, 'tip'::character varying])::text[])))
);


ALTER TABLE public.wallet_transactions OWNER TO postgres;

--
-- Name: wallet_transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallet_transactions_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.wallet_transactions_transaction_id_seq OWNER TO postgres;

--
-- Name: wallet_transactions_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallet_transactions_transaction_id_seq OWNED BY public.wallet_transactions.transaction_id;


--
-- Name: ad_analytics analytics_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_analytics ALTER COLUMN analytics_id SET DEFAULT nextval('public.ad_analytics_analytics_id_seq'::regclass);


--
-- Name: ad_spaces space_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_spaces ALTER COLUMN space_id SET DEFAULT nextval('public.ad_spaces_space_id_seq'::regclass);


--
-- Name: admin_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_settings ALTER COLUMN id SET DEFAULT nextval('public.admin_settings_id_seq'::regclass);


--
-- Name: advertisements ad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements ALTER COLUMN ad_id SET DEFAULT nextval('public.advertisements_ad_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: campaign_change_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_change_requests ALTER COLUMN id SET DEFAULT nextval('public.campaign_change_requests_id_seq'::regclass);


--
-- Name: campaign_creator_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_creator_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.campaign_creator_subscriptions_id_seq'::regclass);


--
-- Name: campaign_updates update_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_updates ALTER COLUMN update_id SET DEFAULT nextval('public.campaign_updates_update_id_seq'::regclass);


--
-- Name: campaigns campaign_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN campaign_id SET DEFAULT nextval('public.campaigns_campaign_id_seq'::regclass);


--
-- Name: cart_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN item_id SET DEFAULT nextval('public.cart_items_item_id_seq'::regclass);


--
-- Name: carts cart_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN cart_id SET DEFAULT nextval('public.carts_cart_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: category_form_fields field_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_form_fields ALTER COLUMN field_id SET DEFAULT nextval('public.category_form_fields_field_id_seq'::regclass);


--
-- Name: customer_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.customer_subscriptions_id_seq'::regclass);


--
-- Name: delivery_ratings rating_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_ratings ALTER COLUMN rating_id SET DEFAULT nextval('public.delivery_ratings_rating_id_seq'::regclass);


--
-- Name: donations donation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations ALTER COLUMN donation_id SET DEFAULT nextval('public.donations_donation_id_seq'::regclass);


--
-- Name: driver_applications application_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_applications ALTER COLUMN application_id SET DEFAULT nextval('public.driver_applications_application_id_seq'::regclass);


--
-- Name: driver_payouts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payouts ALTER COLUMN id SET DEFAULT nextval('public.driver_payouts_id_seq'::regclass);


--
-- Name: driver_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_profiles ALTER COLUMN id SET DEFAULT nextval('public.driver_profiles_id_seq'::regclass);


--
-- Name: failed_login_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_login_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.failed_login_attempts_attempt_id_seq'::regclass);


--
-- Name: hero_assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_assets ALTER COLUMN id SET DEFAULT nextval('public.hero_assets_id_seq'::regclass);


--
-- Name: listing_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_views ALTER COLUMN id SET DEFAULT nextval('public.listing_views_id_seq'::regclass);


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: logistics_pricing id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logistics_pricing ALTER COLUMN id SET DEFAULT nextval('public.logistics_pricing_id_seq'::regclass);


--
-- Name: marquee_templates template_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marquee_templates ALTER COLUMN template_id SET DEFAULT nextval('public.marquee_templates_template_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: menu_addons addon_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_addons ALTER COLUMN addon_id SET DEFAULT nextval('public.menu_addons_addon_id_seq'::regclass);


--
-- Name: menu_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN item_id SET DEFAULT nextval('public.menu_items_item_id_seq'::regclass);


--
-- Name: menu_sections section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections ALTER COLUMN section_id SET DEFAULT nextval('public.menu_sections_section_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_status_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN history_id SET DEFAULT nextval('public.order_status_history_history_id_seq'::regclass);


--
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- Name: partner_wallets wallet_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_wallets ALTER COLUMN wallet_id SET DEFAULT nextval('public.partner_wallets_wallet_id_seq'::regclass);


--
-- Name: payout_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payout_requests ALTER COLUMN request_id SET DEFAULT nextval('public.payout_requests_request_id_seq'::regclass);


--
-- Name: payouts payout_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts ALTER COLUMN payout_id SET DEFAULT nextval('public.payouts_payout_id_seq'::regclass);


--
-- Name: product_variants variant_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN variant_id SET DEFAULT nextval('public.product_variants_variant_id_seq'::regclass);


--
-- Name: promotional_banners banner_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_banners ALTER COLUMN banner_id SET DEFAULT nextval('public.promotional_banners_banner_id_seq'::regclass);


--
-- Name: rental_availability availability_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_availability ALTER COLUMN availability_id SET DEFAULT nextval('public.rental_availability_availability_id_seq'::regclass);


--
-- Name: rental_pricing pricing_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_pricing ALTER COLUMN pricing_id SET DEFAULT nextval('public.rental_pricing_pricing_id_seq'::regclass);


--
-- Name: rental_seasonal_rates seasonal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_seasonal_rates ALTER COLUMN seasonal_id SET DEFAULT nextval('public.rental_seasonal_rates_seasonal_id_seq'::regclass);


--
-- Name: rentals rental_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals ALTER COLUMN rental_id SET DEFAULT nextval('public.rentals_rental_id_seq'::regclass);


--
-- Name: revenue_orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_orders ALTER COLUMN order_id SET DEFAULT nextval('public.revenue_orders_order_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: seasonal_rates rate_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_rates ALTER COLUMN rate_id SET DEFAULT nextval('public.seasonal_rates_rate_id_seq'::regclass);


--
-- Name: security_audit_log log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_audit_log ALTER COLUMN log_id SET DEFAULT nextval('public.security_audit_log_log_id_seq'::regclass);


--
-- Name: service_calendars calendar_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_calendars ALTER COLUMN calendar_id SET DEFAULT nextval('public.service_calendars_calendar_id_seq'::regclass);


--
-- Name: settings_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings_audit ALTER COLUMN id SET DEFAULT nextval('public.settings_audit_id_seq'::regclass);


--
-- Name: site_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_sections ALTER COLUMN id SET DEFAULT nextval('public.site_sections_id_seq'::regclass);


--
-- Name: store_template_configs config_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_configs ALTER COLUMN config_id SET DEFAULT nextval('public.store_template_configs_config_id_seq'::regclass);


--
-- Name: store_template_features feature_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_features ALTER COLUMN feature_id SET DEFAULT nextval('public.store_template_features_feature_id_seq'::regclass);


--
-- Name: store_template_types template_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_types ALTER COLUMN template_id SET DEFAULT nextval('public.store_template_types_template_id_seq'::regclass);


--
-- Name: stores store_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores ALTER COLUMN store_id SET DEFAULT nextval('public.stores_store_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: text_marquee marquee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.text_marquee ALTER COLUMN marquee_id SET DEFAULT nextval('public.text_marquee_marquee_id_seq'::regclass);


--
-- Name: transactions transaction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN transaction_id SET DEFAULT nextval('public.transactions_transaction_id_seq'::regclass);


--
-- Name: user_posts post_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_posts ALTER COLUMN post_id SET DEFAULT nextval('public.user_posts_post_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: vendor_categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_categories ALTER COLUMN category_id SET DEFAULT nextval('public.vendor_categories_category_id_seq'::regclass);


--
-- Name: vendor_kyc kyc_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_kyc ALTER COLUMN kyc_id SET DEFAULT nextval('public.vendor_kyc_kyc_id_seq'::regclass);


--
-- Name: vendor_promotions promo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_promotions ALTER COLUMN promo_id SET DEFAULT nextval('public.vendor_promotions_promo_id_seq'::regclass);


--
-- Name: vendor_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.vendor_subscriptions_id_seq'::regclass);


--
-- Name: vendor_subtypes subtype_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subtypes ALTER COLUMN subtype_id SET DEFAULT nextval('public.vendor_subtypes_subtype_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: wallet_transactions transaction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions ALTER COLUMN transaction_id SET DEFAULT nextval('public.wallet_transactions_transaction_id_seq'::regclass);


--
-- Name: ad_analytics ad_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_pkey PRIMARY KEY (analytics_id);


--
-- Name: ad_spaces ad_spaces_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_spaces
    ADD CONSTRAINT ad_spaces_name_key UNIQUE (name);


--
-- Name: ad_spaces ad_spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_spaces
    ADD CONSTRAINT ad_spaces_pkey PRIMARY KEY (space_id);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_settings admin_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: advertisements advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_pkey PRIMARY KEY (ad_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: campaign_change_requests campaign_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_change_requests
    ADD CONSTRAINT campaign_change_requests_pkey PRIMARY KEY (id);


--
-- Name: campaign_creator_subscriptions campaign_creator_subscriptions_dodo_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_creator_subscriptions
    ADD CONSTRAINT campaign_creator_subscriptions_dodo_subscription_id_key UNIQUE (dodo_subscription_id);


--
-- Name: campaign_creator_subscriptions campaign_creator_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_creator_subscriptions
    ADD CONSTRAINT campaign_creator_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: campaign_updates campaign_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_updates
    ADD CONSTRAINT campaign_updates_pkey PRIMARY KEY (update_id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (campaign_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (item_id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: category_form_fields category_form_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_form_fields
    ADD CONSTRAINT category_form_fields_pkey PRIMARY KEY (field_id);


--
-- Name: customer_subscriptions customer_subscriptions_dodo_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_subscriptions
    ADD CONSTRAINT customer_subscriptions_dodo_subscription_id_key UNIQUE (dodo_subscription_id);


--
-- Name: customer_subscriptions customer_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_subscriptions
    ADD CONSTRAINT customer_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: delivery_ratings delivery_ratings_delivery_id_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_ratings
    ADD CONSTRAINT delivery_ratings_delivery_id_customer_id_key UNIQUE (delivery_id, customer_id);


--
-- Name: delivery_ratings delivery_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_ratings
    ADD CONSTRAINT delivery_ratings_pkey PRIMARY KEY (rating_id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (donation_id);


--
-- Name: driver_applications driver_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_applications
    ADD CONSTRAINT driver_applications_pkey PRIMARY KEY (application_id);


--
-- Name: driver_applications driver_applications_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_applications
    ADD CONSTRAINT driver_applications_user_id_key UNIQUE (user_id);


--
-- Name: driver_payouts driver_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payouts
    ADD CONSTRAINT driver_payouts_pkey PRIMARY KEY (id);


--
-- Name: driver_profiles driver_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT driver_profiles_pkey PRIMARY KEY (id);


--
-- Name: driver_profiles driver_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT driver_profiles_user_id_key UNIQUE (user_id);


--
-- Name: failed_login_attempts failed_login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_login_attempts
    ADD CONSTRAINT failed_login_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: hero_assets hero_assets_page_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_assets
    ADD CONSTRAINT hero_assets_page_key_key UNIQUE (page_key);


--
-- Name: hero_assets hero_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hero_assets
    ADD CONSTRAINT hero_assets_pkey PRIMARY KEY (id);


--
-- Name: listing_views listing_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT listing_views_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: listings listings_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_slug_key UNIQUE (slug);


--
-- Name: logistics_pricing logistics_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logistics_pricing
    ADD CONSTRAINT logistics_pricing_pkey PRIMARY KEY (id);


--
-- Name: logistics_pricing logistics_pricing_service_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logistics_pricing
    ADD CONSTRAINT logistics_pricing_service_type_key UNIQUE (service_type);


--
-- Name: marquee_templates marquee_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marquee_templates
    ADD CONSTRAINT marquee_templates_pkey PRIMARY KEY (template_id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: menu_addons menu_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_addons
    ADD CONSTRAINT menu_addons_pkey PRIMARY KEY (addon_id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (item_id);


--
-- Name: menu_sections menu_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_pkey PRIMARY KEY (section_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: migrations migrations_filename_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_filename_key UNIQUE (filename);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (history_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: partner_wallets partner_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_wallets
    ADD CONSTRAINT partner_wallets_pkey PRIMARY KEY (wallet_id);


--
-- Name: partner_wallets partner_wallets_user_id_partner_type_store_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_wallets
    ADD CONSTRAINT partner_wallets_user_id_partner_type_store_id_key UNIQUE (user_id, partner_type, store_id);


--
-- Name: payout_requests payout_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_pkey PRIMARY KEY (request_id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (payout_id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (variant_id);


--
-- Name: promotional_banners promotional_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_banners
    ADD CONSTRAINT promotional_banners_pkey PRIMARY KEY (banner_id);


--
-- Name: rental_availability rental_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_availability
    ADD CONSTRAINT rental_availability_pkey PRIMARY KEY (availability_id);


--
-- Name: rental_pricing rental_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_pricing
    ADD CONSTRAINT rental_pricing_pkey PRIMARY KEY (pricing_id);


--
-- Name: rental_seasonal_rates rental_seasonal_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_seasonal_rates
    ADD CONSTRAINT rental_seasonal_rates_pkey PRIMARY KEY (seasonal_id);


--
-- Name: rentals rentals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_pkey PRIMARY KEY (rental_id);


--
-- Name: revenue_orders revenue_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_orders
    ADD CONSTRAINT revenue_orders_pkey PRIMARY KEY (order_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: seasonal_rates seasonal_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_rates
    ADD CONSTRAINT seasonal_rates_pkey PRIMARY KEY (rate_id);


--
-- Name: security_audit_log security_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_pkey PRIMARY KEY (log_id);


--
-- Name: service_calendars service_calendars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT service_calendars_pkey PRIMARY KEY (calendar_id);


--
-- Name: settings_audit settings_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings_audit
    ADD CONSTRAINT settings_audit_pkey PRIMARY KEY (id);


--
-- Name: site_sections site_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_pkey PRIMARY KEY (id);


--
-- Name: store_template_configs store_template_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_configs
    ADD CONSTRAINT store_template_configs_pkey PRIMARY KEY (config_id);


--
-- Name: store_template_configs store_template_configs_store_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_configs
    ADD CONSTRAINT store_template_configs_store_id_key UNIQUE (store_id);


--
-- Name: store_template_features store_template_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_features
    ADD CONSTRAINT store_template_features_pkey PRIMARY KEY (feature_id);


--
-- Name: store_template_features store_template_features_template_id_feature_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_features
    ADD CONSTRAINT store_template_features_template_id_feature_key_key UNIQUE (template_id, feature_key);


--
-- Name: store_template_types store_template_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_types
    ADD CONSTRAINT store_template_types_pkey PRIMARY KEY (template_id);


--
-- Name: store_template_types store_template_types_template_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_types
    ADD CONSTRAINT store_template_types_template_key_key UNIQUE (template_key);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (store_id);


--
-- Name: stores stores_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_slug_key UNIQUE (slug);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: text_marquee text_marquee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.text_marquee
    ADD CONSTRAINT text_marquee_pkey PRIMARY KEY (marquee_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: vendors unique_business; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT unique_business UNIQUE (business_name, user_id);


--
-- Name: site_sections unique_store_section; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT unique_store_section UNIQUE (store_id, name);


--
-- Name: user_posts user_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_posts
    ADD CONSTRAINT user_posts_pkey PRIMARY KEY (post_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vendor_categories vendor_categories_category_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_categories
    ADD CONSTRAINT vendor_categories_category_key_key UNIQUE (category_key);


--
-- Name: vendor_categories vendor_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_categories
    ADD CONSTRAINT vendor_categories_pkey PRIMARY KEY (category_id);


--
-- Name: vendor_kyc vendor_kyc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_kyc
    ADD CONSTRAINT vendor_kyc_pkey PRIMARY KEY (kyc_id);


--
-- Name: vendor_promotions vendor_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_promotions
    ADD CONSTRAINT vendor_promotions_pkey PRIMARY KEY (promo_id);


--
-- Name: vendor_subscriptions vendor_subscriptions_dodo_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subscriptions
    ADD CONSTRAINT vendor_subscriptions_dodo_subscription_id_key UNIQUE (dodo_subscription_id);


--
-- Name: vendor_subscriptions vendor_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subscriptions
    ADD CONSTRAINT vendor_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: vendor_subtypes vendor_subtypes_category_id_subtype_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subtypes
    ADD CONSTRAINT vendor_subtypes_category_id_subtype_key_key UNIQUE (category_id, subtype_key);


--
-- Name: vendor_subtypes vendor_subtypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subtypes
    ADD CONSTRAINT vendor_subtypes_pkey PRIMARY KEY (subtype_id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_slug_key UNIQUE (slug);


--
-- Name: vendors vendors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_key UNIQUE (user_id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: idx_ads_advertiser; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_advertiser ON public.advertisements USING btree (advertiser_type, advertiser_id);


--
-- Name: idx_ads_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_dates ON public.advertisements USING btree (start_date, end_date);


--
-- Name: idx_ads_space; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_space ON public.advertisements USING btree (ad_space_id);


--
-- Name: idx_ads_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_status ON public.advertisements USING btree (status, is_active);


--
-- Name: idx_analytics_ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_ad ON public.ad_analytics USING btree (ad_id, event_type);


--
-- Name: idx_analytics_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_timestamp ON public.ad_analytics USING btree (event_timestamp);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_action ON public.security_audit_log USING btree (action);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_audit_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_time ON public.security_audit_log USING btree (created_at);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_user ON public.security_audit_log USING btree (user_id);


--
-- Name: idx_campaign_creator_subscriptions_cancel_at_period_end; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_creator_subscriptions_cancel_at_period_end ON public.campaign_creator_subscriptions USING btree (cancel_at_period_end, current_period_end);


--
-- Name: idx_campaign_creator_subscriptions_dodo_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_creator_subscriptions_dodo_subscription_id ON public.campaign_creator_subscriptions USING btree (dodo_subscription_id);


--
-- Name: idx_campaign_creator_subscriptions_nonprofit_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_creator_subscriptions_nonprofit_verified ON public.campaign_creator_subscriptions USING btree (nonprofit_verified);


--
-- Name: idx_campaign_creator_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_creator_subscriptions_status ON public.campaign_creator_subscriptions USING btree (status);


--
-- Name: idx_campaign_creator_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_creator_subscriptions_user_id ON public.campaign_creator_subscriptions USING btree (user_id);


--
-- Name: idx_campaign_creator_subscriptions_user_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_campaign_creator_subscriptions_user_id_unique ON public.campaign_creator_subscriptions USING btree (user_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- Name: idx_cart_items_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_listing_id ON public.cart_items USING btree (listing_id);


--
-- Name: idx_carts_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_session_id ON public.carts USING btree (session_id);


--
-- Name: idx_carts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carts_user_id ON public.carts USING btree (user_id);


--
-- Name: idx_category_form_fields_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_form_fields_category ON public.category_form_fields USING btree (category_id);


--
-- Name: idx_category_form_fields_subtype; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_category_form_fields_subtype ON public.category_form_fields USING btree (subtype_id);


--
-- Name: idx_customer_subscriptions_cancel_at_period_end; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_subscriptions_cancel_at_period_end ON public.customer_subscriptions USING btree (cancel_at_period_end, current_period_end);


--
-- Name: idx_customer_subscriptions_dodo_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_subscriptions_dodo_subscription_id ON public.customer_subscriptions USING btree (dodo_subscription_id);


--
-- Name: idx_customer_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_subscriptions_status ON public.customer_subscriptions USING btree (status);


--
-- Name: idx_customer_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_subscriptions_user_id ON public.customer_subscriptions USING btree (user_id);


--
-- Name: idx_customer_subscriptions_user_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_customer_subscriptions_user_id_unique ON public.customer_subscriptions USING btree (user_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_delivery_ratings_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_ratings_customer ON public.delivery_ratings USING btree (customer_id);


--
-- Name: idx_delivery_ratings_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_ratings_driver ON public.delivery_ratings USING btree (driver_id);


--
-- Name: idx_driver_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_driver_applications_status ON public.driver_applications USING btree (status);


--
-- Name: idx_driver_payouts_delivery; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_driver_payouts_delivery ON public.driver_payouts USING btree (delivery_id);


--
-- Name: idx_driver_payouts_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_driver_payouts_driver ON public.driver_payouts USING btree (driver_id);


--
-- Name: idx_driver_payouts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_driver_payouts_status ON public.driver_payouts USING btree (status);


--
-- Name: idx_failed_logins_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_failed_logins_email ON public.failed_login_attempts USING btree (email);


--
-- Name: idx_failed_logins_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_failed_logins_ip ON public.failed_login_attempts USING btree (ip_address);


--
-- Name: idx_failed_logins_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_failed_logins_time ON public.failed_login_attempts USING btree (attempted_at);


--
-- Name: idx_hero_assets_page_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hero_assets_page_key ON public.hero_assets USING btree (page_key);


--
-- Name: idx_listing_views_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listing_views_listing_id ON public.listing_views USING btree (listing_id);


--
-- Name: idx_listings_amenities_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_amenities_gin ON public.listings USING gin (((metadata -> 'amenities'::text)));


--
-- Name: idx_listings_availability_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_availability_gin ON public.listings USING gin (((metadata -> 'availability_calendar'::text)));


--
-- Name: idx_listings_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_category ON public.listings USING btree (category);


--
-- Name: idx_listings_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_category_id ON public.listings USING btree (category_id);


--
-- Name: idx_listings_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_driver_id ON public.listings USING btree (driver_id);


--
-- Name: idx_listings_insurance_included; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_insurance_included ON public.listings USING btree (((metadata ->> 'insurance_included'::text)));


--
-- Name: idx_listings_metadata_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_metadata_gin ON public.listings USING gin (metadata);


--
-- Name: idx_listings_photos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_photos ON public.listings USING gin (photos);


--
-- Name: idx_listings_price_per_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_price_per_day ON public.listings USING btree ((((metadata ->> 'price_per_day'::text))::numeric));


--
-- Name: idx_listings_promoted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_promoted ON public.listings USING btree (is_promoted);


--
-- Name: idx_listings_search_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_search_fts ON public.listings USING gin (search_vector);


--
-- Name: idx_listings_service_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_service_type ON public.listings USING btree (service_type);


--
-- Name: idx_listings_specialization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_specialization ON public.listings USING btree (((metadata ->> 'specialization'::text)));


--
-- Name: idx_listings_sub_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_sub_category ON public.listings USING btree (sub_category);


--
-- Name: idx_listings_subtype_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_subtype_id ON public.listings USING btree (subtype_id);


--
-- Name: idx_listings_tour_category_column; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_tour_category_column ON public.listings USING btree (tour_category);


--
-- Name: idx_listings_tour_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_tour_status ON public.listings USING btree (category) WHERE (((category)::text = 'service'::text) AND (sub_category = 'tour'::text));


--
-- Name: idx_listings_transport_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_transport_status ON public.listings USING btree (transport_status);


--
-- Name: idx_menu_addons_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_addons_item ON public.menu_addons USING btree (item_id);


--
-- Name: idx_menu_items_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_listing ON public.menu_items USING btree (listing_id);


--
-- Name: idx_menu_items_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_section ON public.menu_items USING btree (section_id);


--
-- Name: idx_menu_sections_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_sections_listing ON public.menu_sections USING btree (store_id);


--
-- Name: idx_menu_sections_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_sections_listing_id ON public.menu_sections USING btree (store_id);


--
-- Name: idx_messages_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_order_id ON public.messages USING btree (order_id);


--
-- Name: idx_messages_sender_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_sender_receiver ON public.messages USING btree (sender_id, receiver_id);


--
-- Name: idx_order_items_analytics; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_analytics ON public.order_items USING btree (listing_id, order_id);


--
-- Name: idx_order_items_listing_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_listing_id ON public.order_items USING btree (listing_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_status ON public.order_items USING btree (status);


--
-- Name: idx_order_status_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_history_created_at ON public.order_status_history USING btree (created_at DESC);


--
-- Name: idx_order_status_history_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);


--
-- Name: idx_orders_analytics; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_analytics ON public.orders USING btree (created_at, store_id, status) WHERE (status <> 'cancelled'::public.order_status);


--
-- Name: idx_orders_assigned_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_assigned_driver_id ON public.orders USING btree (assigned_driver_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_driver ON public.orders USING btree (assigned_driver_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_store_id ON public.orders USING btree (store_id);


--
-- Name: idx_orders_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_type ON public.orders USING btree (order_type);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_partner_wallets_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_partner_wallets_user_id ON public.partner_wallets USING btree (user_id);


--
-- Name: idx_payout_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payout_requests_status ON public.payout_requests USING btree (status);


--
-- Name: idx_payouts_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payouts_vendor_id ON public.payouts USING btree (vendor_id);


--
-- Name: idx_product_variants_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_variants_listing ON public.product_variants USING btree (listing_id);


--
-- Name: idx_promotional_banners_active_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_promotional_banners_active_location ON public.promotional_banners USING btree (location) WHERE (is_active = true);


--
-- Name: INDEX idx_promotional_banners_active_location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_promotional_banners_active_location IS 'Ensures only one active banner per location at a time';


--
-- Name: idx_rental_availability_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_availability_listing ON public.rental_availability USING btree (listing_id);


--
-- Name: idx_rental_pricing_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_pricing_listing ON public.rental_pricing USING btree (listing_id);


--
-- Name: idx_rental_seasonal_rates_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_seasonal_rates_listing ON public.rental_seasonal_rates USING btree (listing_id);


--
-- Name: idx_rentals_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rentals_type ON public.rentals USING btree (rental_type);


--
-- Name: idx_revenue_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_revenue_orders_status ON public.revenue_orders USING btree (status);


--
-- Name: idx_revenue_orders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_revenue_orders_user ON public.revenue_orders USING btree (user_id);


--
-- Name: idx_revenue_orders_vendor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_revenue_orders_vendor ON public.revenue_orders USING btree (vendor_id);


--
-- Name: idx_reviews_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_vendor_id ON public.reviews USING btree (vendor_id);


--
-- Name: idx_seasonal_rates_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_seasonal_rates_listing ON public.seasonal_rates USING btree (listing_id);


--
-- Name: idx_service_calendars_listing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_calendars_listing ON public.service_calendars USING btree (listing_id);


--
-- Name: idx_settings_audit_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_audit_key ON public.settings_audit USING btree (setting_key);


--
-- Name: idx_site_sections_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_sections_active ON public.site_sections USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_site_sections_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_sections_store_id ON public.site_sections USING btree (store_id);


--
-- Name: idx_site_sections_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_sections_type ON public.site_sections USING btree (section_type);


--
-- Name: idx_stores_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stores_category ON public.stores USING btree (category_id);


--
-- Name: idx_stores_subtype; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stores_subtype ON public.stores USING btree (subtype_id);


--
-- Name: idx_stores_template_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stores_template_id ON public.stores USING btree (template_id);


--
-- Name: idx_subscriptions_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);


--
-- Name: idx_transactions_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_order_id ON public.transactions USING btree (order_id);


--
-- Name: idx_users_email_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_verified ON public.users USING btree (email_verified);


--
-- Name: idx_users_is_verified_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_verified_driver ON public.users USING btree (is_verified_driver);


--
-- Name: idx_vendor_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_categories_active ON public.vendor_categories USING btree (is_active);


--
-- Name: idx_vendor_categories_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_categories_key ON public.vendor_categories USING btree (category_key);


--
-- Name: idx_vendor_kyc_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_kyc_status ON public.vendor_kyc USING btree (status);


--
-- Name: idx_vendor_promos_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_promos_active ON public.vendor_promotions USING btree (is_active, start_date, end_date);


--
-- Name: idx_vendor_promos_vendor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_promos_vendor ON public.vendor_promotions USING btree (vendor_id);


--
-- Name: idx_vendor_subscriptions_cancel_at_period_end; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_subscriptions_cancel_at_period_end ON public.vendor_subscriptions USING btree (cancel_at_period_end, current_period_end);


--
-- Name: idx_vendor_subscriptions_dodo_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_subscriptions_dodo_subscription_id ON public.vendor_subscriptions USING btree (dodo_subscription_id);


--
-- Name: idx_vendor_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_subscriptions_status ON public.vendor_subscriptions USING btree (status);


--
-- Name: idx_vendor_subscriptions_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_subscriptions_vendor_id ON public.vendor_subscriptions USING btree (vendor_id);


--
-- Name: idx_vendor_subscriptions_vendor_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_vendor_subscriptions_vendor_id_unique ON public.vendor_subscriptions USING btree (vendor_id) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_vendor_subtypes_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_subtypes_category ON public.vendor_subtypes USING btree (category_id);


--
-- Name: idx_vendor_subtypes_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_subtypes_key ON public.vendor_subtypes USING btree (subtype_key);


--
-- Name: idx_vendors_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_featured ON public.vendors USING btree (is_featured);


--
-- Name: idx_vendors_kyb_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_kyb_verified ON public.vendors USING btree (kyb_verified);


--
-- Name: idx_vendors_kyc_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_kyc_status ON public.vendors USING btree (kyc_status);


--
-- Name: idx_vendors_search_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_search_fts ON public.vendors USING gin (search_vector);


--
-- Name: idx_vendors_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_status ON public.vendors USING btree (status);


--
-- Name: idx_wallet_transactions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions USING btree (created_at DESC);


--
-- Name: idx_wallet_transactions_wallet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions USING btree (wallet_id);


--
-- Name: campaign_creator_subscriptions campaign_creator_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER campaign_creator_subscriptions_updated_at BEFORE UPDATE ON public.campaign_creator_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_campaign_creator_subscriptions_updated_at();


--
-- Name: customer_subscriptions customer_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER customer_subscriptions_updated_at BEFORE UPDATE ON public.customer_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_customer_subscriptions_updated_at();


--
-- Name: users log_password_change_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_password_change_trigger BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_password_change();


--
-- Name: listings trg_listings_search_vector_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_listings_search_vector_update BEFORE INSERT OR UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.listings_search_vector_update();


--
-- Name: promotional_banners trg_update_banner_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_banner_timestamp BEFORE UPDATE ON public.promotional_banners FOR EACH ROW EXECUTE FUNCTION public.update_banner_timestamp();


--
-- Name: vendors trg_vendors_search_vector_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_vendors_search_vector_update BEFORE INSERT OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.vendors_search_vector_update();


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: carts update_carts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: driver_payouts update_driver_payouts_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_driver_payouts_updated_at_trigger BEFORE UPDATE ON public.driver_payouts FOR EACH ROW EXECUTE FUNCTION public.update_driver_payouts_updated_at();


--
-- Name: order_items update_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: store_template_configs update_store_template_config_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_store_template_config_timestamp BEFORE UPDATE ON public.store_template_configs FOR EACH ROW EXECUTE FUNCTION public.update_store_template_config_timestamp();


--
-- Name: vendor_subscriptions vendor_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vendor_subscriptions_updated_at BEFORE UPDATE ON public.vendor_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_vendor_subscriptions_updated_at();


--
-- Name: ad_analytics ad_analytics_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.advertisements(ad_id) ON DELETE CASCADE;


--
-- Name: ad_analytics ad_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_analytics
    ADD CONSTRAINT ad_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: advertisements advertisements_ad_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_ad_space_id_fkey FOREIGN KEY (ad_space_id) REFERENCES public.ad_spaces(space_id) ON DELETE SET NULL;


--
-- Name: advertisements advertisements_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: advertisements advertisements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: campaign_change_requests campaign_change_requests_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_change_requests
    ADD CONSTRAINT campaign_change_requests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: campaign_change_requests campaign_change_requests_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_change_requests
    ADD CONSTRAINT campaign_change_requests_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: campaign_creator_subscriptions campaign_creator_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_creator_subscriptions
    ADD CONSTRAINT campaign_creator_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: campaign_updates campaign_updates_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_updates
    ADD CONSTRAINT campaign_updates_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: campaign_updates campaign_updates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_updates
    ADD CONSTRAINT campaign_updates_user_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: campaigns campaigns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(cart_id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: category_form_fields category_form_fields_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_form_fields
    ADD CONSTRAINT category_form_fields_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.vendor_categories(category_id) ON DELETE CASCADE;


--
-- Name: category_form_fields category_form_fields_subtype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_form_fields
    ADD CONSTRAINT category_form_fields_subtype_id_fkey FOREIGN KEY (subtype_id) REFERENCES public.vendor_subtypes(subtype_id) ON DELETE CASCADE;


--
-- Name: customer_subscriptions customer_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_subscriptions
    ADD CONSTRAINT customer_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: delivery_ratings delivery_ratings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_ratings
    ADD CONSTRAINT delivery_ratings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: delivery_ratings delivery_ratings_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_ratings
    ADD CONSTRAINT delivery_ratings_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: delivery_ratings delivery_ratings_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_ratings
    ADD CONSTRAINT delivery_ratings_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: donations donations_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE;


--
-- Name: donations donations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: driver_applications driver_applications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_applications
    ADD CONSTRAINT driver_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id);


--
-- Name: driver_applications driver_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_applications
    ADD CONSTRAINT driver_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: driver_payouts driver_payouts_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payouts
    ADD CONSTRAINT driver_payouts_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: driver_payouts driver_payouts_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payouts
    ADD CONSTRAINT driver_payouts_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: driver_profiles driver_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT driver_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: listing_views listing_views_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT listing_views_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listing_views listing_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT listing_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: listings listings_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.vendor_categories(category_id);


--
-- Name: listings listings_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: listings listings_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(user_id);


--
-- Name: listings listings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: listings listings_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id);


--
-- Name: listings listings_subtype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_subtype_id_fkey FOREIGN KEY (subtype_id) REFERENCES public.vendor_subtypes(subtype_id);


--
-- Name: media media_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: menu_addons menu_addons_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_addons
    ADD CONSTRAINT menu_addons_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.menu_items(item_id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.menu_sections(section_id) ON DELETE CASCADE;


--
-- Name: menu_sections menu_sections_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_listing_id_fkey FOREIGN KEY (store_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: menu_sections menu_sections_listing_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_listing_id_fkey1 FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: messages messages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_service_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_service_provider_id_fkey FOREIGN KEY (service_provider_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: orders orders_assigned_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_assigned_driver_id_fkey FOREIGN KEY (assigned_driver_id) REFERENCES public.users(user_id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: partner_wallets partner_wallets_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_wallets
    ADD CONSTRAINT partner_wallets_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id) ON DELETE SET NULL;


--
-- Name: partner_wallets partner_wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_wallets
    ADD CONSTRAINT partner_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payout_requests payout_requests_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(user_id);


--
-- Name: payout_requests payout_requests_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.wallet_transactions(transaction_id);


--
-- Name: payout_requests payout_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payout_requests payout_requests_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.partner_wallets(wallet_id) ON DELETE CASCADE;


--
-- Name: payouts payouts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: product_variants product_variants_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: rental_availability rental_availability_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_availability
    ADD CONSTRAINT rental_availability_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: rental_pricing rental_pricing_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_pricing
    ADD CONSTRAINT rental_pricing_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: rental_seasonal_rates rental_seasonal_rates_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_seasonal_rates
    ADD CONSTRAINT rental_seasonal_rates_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: rentals rentals_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: rentals rentals_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rentals
    ADD CONSTRAINT rentals_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: revenue_orders revenue_orders_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_orders
    ADD CONSTRAINT revenue_orders_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: revenue_orders revenue_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_orders
    ADD CONSTRAINT revenue_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: revenue_orders revenue_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.revenue_orders
    ADD CONSTRAINT revenue_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: reviews reviews_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_replied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES public.users(user_id);


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: seasonal_rates seasonal_rates_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasonal_rates
    ADD CONSTRAINT seasonal_rates_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: security_audit_log security_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_audit_log
    ADD CONSTRAINT security_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: service_calendars service_calendars_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_calendars
    ADD CONSTRAINT service_calendars_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: settings_audit settings_audit_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings_audit
    ADD CONSTRAINT settings_audit_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: site_sections site_sections_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id) ON DELETE CASCADE;


--
-- Name: store_template_configs store_template_configs_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_configs
    ADD CONSTRAINT store_template_configs_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id) ON DELETE CASCADE;


--
-- Name: store_template_configs store_template_configs_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_configs
    ADD CONSTRAINT store_template_configs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.store_template_types(template_id);


--
-- Name: store_template_features store_template_features_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_template_features
    ADD CONSTRAINT store_template_features_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.store_template_types(template_id) ON DELETE CASCADE;


--
-- Name: stores stores_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.vendor_categories(category_id);


--
-- Name: stores stores_subtype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_subtype_id_fkey FOREIGN KEY (subtype_id) REFERENCES public.vendor_subtypes(subtype_id);


--
-- Name: stores stores_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(user_id);


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: text_marquee text_marquee_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.text_marquee
    ADD CONSTRAINT text_marquee_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: transactions transactions_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE;


--
-- Name: transactions transactions_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: user_posts user_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_posts
    ADD CONSTRAINT user_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: vehicles vehicles_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(user_id);


--
-- Name: vendor_kyc vendor_kyc_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_kyc
    ADD CONSTRAINT vendor_kyc_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_promotions vendor_promotions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_promotions
    ADD CONSTRAINT vendor_promotions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: vendor_promotions vendor_promotions_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_promotions
    ADD CONSTRAINT vendor_promotions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(store_id) ON DELETE CASCADE;


--
-- Name: vendor_promotions vendor_promotions_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_promotions
    ADD CONSTRAINT vendor_promotions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: vendor_subscriptions vendor_subscriptions_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subscriptions
    ADD CONSTRAINT vendor_subscriptions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_subtypes vendor_subtypes_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_subtypes
    ADD CONSTRAINT vendor_subtypes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.vendor_categories(category_id) ON DELETE CASCADE;


--
-- Name: vendors vendors_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(user_id);


--
-- Name: vendors vendors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: vendors vendors_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(user_id);


--
-- Name: wallet_transactions wallet_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.partner_wallets(wallet_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict y4jBogp6CcI7BwKxfM8CylIqyGEDyyXrfXxdQPL8OVVF9VYow6jeLF4JY9Um1YG

