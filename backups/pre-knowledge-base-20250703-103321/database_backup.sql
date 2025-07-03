--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Homebrew)
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: yanrypangouw
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO yanrypangouw;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: yanrypangouw
--

COMMENT ON SCHEMA public IS '';


--
-- Name: approval_status; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.approval_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'review_required'
);


ALTER TYPE public.approval_status OWNER TO yanrypangouw;

--
-- Name: business_impact; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.business_impact AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.business_impact OWNER TO yanrypangouw;

--
-- Name: comment_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.comment_type AS ENUM (
    'comment',
    'status_change',
    'assignment_change',
    'resolution',
    'closure',
    'escalation',
    'approval'
);


ALTER TYPE public.comment_type OWNER TO yanrypangouw;

--
-- Name: escalation_status; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.escalation_status AS ENUM (
    'active',
    'resolved',
    'cancelled',
    'failed'
);


ALTER TYPE public.escalation_status OWNER TO yanrypangouw;

--
-- Name: field_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.field_type AS ENUM (
    'text',
    'textarea',
    'number',
    'email',
    'phone',
    'date',
    'datetime',
    'dropdown',
    'radio',
    'checkbox',
    'file_upload',
    'government_id',
    'budget_code',
    'treasury_account'
);


ALTER TYPE public.field_type OWNER TO yanrypangouw;

--
-- Name: issue_category_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.issue_category_type AS ENUM (
    'request',
    'complaint',
    'problem'
);


ALTER TYPE public.issue_category_type OWNER TO yanrypangouw;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.notification_type AS ENUM (
    'mention',
    'reply',
    'new_comment',
    'status_update',
    'assignment'
);


ALTER TYPE public.notification_type OWNER TO yanrypangouw;

--
-- Name: request_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.request_type AS ENUM (
    'service_request',
    'incident',
    'problem',
    'change_request'
);


ALTER TYPE public.request_type OWNER TO yanrypangouw;

--
-- Name: root_cause_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.root_cause_type AS ENUM (
    'human_error',
    'system_error',
    'external_factor',
    'undetermined'
);


ALTER TYPE public.root_cause_type OWNER TO yanrypangouw;

--
-- Name: service_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.service_type AS ENUM (
    'business_service',
    'technical_service',
    'government_service'
);


ALTER TYPE public.service_type OWNER TO yanrypangouw;

--
-- Name: template_type; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.template_type AS ENUM (
    'standard',
    'government',
    'kasda_specific',
    'internal_only'
);


ALTER TYPE public.template_type OWNER TO yanrypangouw;

--
-- Name: ticket_priority; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.ticket_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.ticket_priority OWNER TO yanrypangouw;

--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: yanrypangouw
--

CREATE TYPE public.ticket_status AS ENUM (
    'open',
    'in_progress',
    'pending_requester_response',
    'resolved',
    'closed',
    'awaiting_approval',
    'approved',
    'rejected',
    'pending-approval',
    'awaiting-changes',
    'assigned',
    'cancelled',
    'duplicate',
    'pending'
);


ALTER TYPE public.ticket_status OWNER TO yanrypangouw;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO yanrypangouw;

--
-- Name: api_token_usage_logs; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.api_token_usage_logs (
    id integer NOT NULL,
    token_id integer NOT NULL,
    endpoint character varying(255) NOT NULL,
    method character varying(10) NOT NULL,
    ip_address inet,
    user_agent text,
    status_code integer NOT NULL,
    response_time integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.api_token_usage_logs OWNER TO yanrypangouw;

--
-- Name: api_token_usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.api_token_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_token_usage_logs_id_seq OWNER TO yanrypangouw;

--
-- Name: api_token_usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.api_token_usage_logs_id_seq OWNED BY public.api_token_usage_logs.id;


--
-- Name: api_tokens; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.api_tokens (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    token_hash character varying(255) NOT NULL,
    scopes text[],
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp(6) with time zone,
    last_used_at timestamp(6) with time zone,
    usage_count integer DEFAULT 0 NOT NULL,
    created_by_user_id integer NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.api_tokens OWNER TO yanrypangouw;

--
-- Name: api_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.api_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_tokens_id_seq OWNER TO yanrypangouw;

--
-- Name: api_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.api_tokens_id_seq OWNED BY public.api_tokens.id;


--
-- Name: auto_assignment_rules; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.auto_assignment_rules (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    template_id integer,
    department_id integer,
    priority_level character varying(20),
    required_skill character varying(100),
    assignment_strategy character varying(50) DEFAULT 'skill_match'::character varying NOT NULL,
    respect_capacity boolean DEFAULT true NOT NULL,
    max_workload_percent integer DEFAULT 80 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.auto_assignment_rules OWNER TO yanrypangouw;

--
-- Name: auto_assignment_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.auto_assignment_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auto_assignment_rules_id_seq OWNER TO yanrypangouw;

--
-- Name: auto_assignment_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.auto_assignment_rules_id_seq OWNED BY public.auto_assignment_rules.id;


--
-- Name: bsg_field_options; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_field_options (
    id integer NOT NULL,
    field_id integer NOT NULL,
    master_data_type character varying(50),
    option_value character varying(200),
    option_label character varying(250),
    is_default boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_field_options OWNER TO yanrypangouw;

--
-- Name: bsg_field_options_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_field_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_field_options_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_field_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_field_options_id_seq OWNED BY public.bsg_field_options.id;


--
-- Name: bsg_field_types; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_field_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    html_input_type character varying(30),
    validation_pattern character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_field_types OWNER TO yanrypangouw;

--
-- Name: bsg_field_types_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_field_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_field_types_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_field_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_field_types_id_seq OWNED BY public.bsg_field_types.id;


--
-- Name: bsg_global_field_definitions; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_global_field_definitions (
    id integer NOT NULL,
    field_name character varying(100) NOT NULL,
    field_type character varying(50) NOT NULL,
    field_label character varying(150) NOT NULL,
    description text,
    placeholder_text character varying(200),
    help_text character varying(500),
    is_required boolean DEFAULT false,
    max_length integer,
    validation_rules jsonb,
    field_category character varying(50),
    usage_count integer DEFAULT 0,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bsg_global_field_definitions OWNER TO yanrypangouw;

--
-- Name: bsg_global_field_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_global_field_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_global_field_definitions_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_global_field_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_global_field_definitions_id_seq OWNED BY public.bsg_global_field_definitions.id;


--
-- Name: bsg_master_data; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_master_data (
    id integer NOT NULL,
    data_type character varying(50) NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    display_name character varying(250),
    parent_id integer,
    metadata jsonb,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_master_data OWNER TO yanrypangouw;

--
-- Name: bsg_master_data_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_master_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_master_data_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_master_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_master_data_id_seq OWNED BY public.bsg_master_data.id;


--
-- Name: bsg_template_categories; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_template_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(150) NOT NULL,
    description text,
    icon character varying(50),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_template_categories OWNER TO yanrypangouw;

--
-- Name: bsg_template_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_template_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_template_categories_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_template_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_template_categories_id_seq OWNED BY public.bsg_template_categories.id;


--
-- Name: bsg_template_fields; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_template_fields (
    id integer NOT NULL,
    template_id integer NOT NULL,
    field_type_id integer NOT NULL,
    field_name character varying(100) NOT NULL,
    field_label character varying(150) NOT NULL,
    field_description text,
    is_required boolean DEFAULT false NOT NULL,
    max_length integer,
    sort_order integer DEFAULT 0 NOT NULL,
    placeholder_text character varying(200),
    help_text character varying(500),
    validation_rules jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_template_fields OWNER TO yanrypangouw;

--
-- Name: bsg_template_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_template_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_template_fields_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_template_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_template_fields_id_seq OWNED BY public.bsg_template_fields.id;


--
-- Name: bsg_template_usage_logs; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_template_usage_logs (
    id integer NOT NULL,
    template_id integer NOT NULL,
    user_id integer NOT NULL,
    department_id integer,
    ticket_id integer,
    action_type character varying(20) NOT NULL,
    session_id character varying(100),
    ip_address inet,
    user_agent text,
    completion_time_ms integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_template_usage_logs OWNER TO yanrypangouw;

--
-- Name: bsg_template_usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_template_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_template_usage_logs_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_template_usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_template_usage_logs_id_seq OWNED BY public.bsg_template_usage_logs.id;


--
-- Name: bsg_templates; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_templates (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(200) NOT NULL,
    display_name character varying(250) NOT NULL,
    description text,
    template_number integer,
    is_active boolean DEFAULT true NOT NULL,
    popularity_score integer DEFAULT 0 NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_templates OWNER TO yanrypangouw;

--
-- Name: bsg_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_templates_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_templates_id_seq OWNED BY public.bsg_templates.id;


--
-- Name: bsg_ticket_field_values; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.bsg_ticket_field_values (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    field_id integer NOT NULL,
    field_value text,
    master_data_id integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bsg_ticket_field_values OWNER TO yanrypangouw;

--
-- Name: bsg_ticket_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.bsg_ticket_field_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bsg_ticket_field_values_id_seq OWNER TO yanrypangouw;

--
-- Name: bsg_ticket_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.bsg_ticket_field_values_id_seq OWNED BY public.bsg_ticket_field_values.id;


--
-- Name: business_approvals; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.business_approvals (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    business_reviewer_id integer NOT NULL,
    approval_status public.approval_status DEFAULT 'pending'::public.approval_status NOT NULL,
    business_comments text,
    gov_docs_verified boolean DEFAULT false NOT NULL,
    authorization_letter_path text,
    approved_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.business_approvals OWNER TO yanrypangouw;

--
-- Name: business_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.business_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_approvals_id_seq OWNER TO yanrypangouw;

--
-- Name: business_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.business_approvals_id_seq OWNED BY public.business_approvals.id;


--
-- Name: business_hours_config; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.business_hours_config (
    id integer NOT NULL,
    department_id integer,
    unit_id integer,
    day_of_week integer NOT NULL,
    start_time character varying(5) NOT NULL,
    end_time character varying(5) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    timezone character varying(50) DEFAULT 'Asia/Jakarta'::character varying NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.business_hours_config OWNER TO yanrypangouw;

--
-- Name: business_hours_config_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.business_hours_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_hours_config_id_seq OWNER TO yanrypangouw;

--
-- Name: business_hours_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.business_hours_config_id_seq OWNED BY public.business_hours_config.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    department_id integer
);


ALTER TABLE public.categories OWNER TO yanrypangouw;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO yanrypangouw;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: comment_notifications; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.comment_notifications (
    id integer NOT NULL,
    comment_id integer NOT NULL,
    recipient_id integer NOT NULL,
    notification_type public.notification_type NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(6) with time zone,
    email_sent boolean DEFAULT false NOT NULL,
    email_sent_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comment_notifications OWNER TO yanrypangouw;

--
-- Name: comment_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.comment_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_notifications_id_seq OWNER TO yanrypangouw;

--
-- Name: comment_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.comment_notifications_id_seq OWNED BY public.comment_notifications.id;


--
-- Name: custom_field_definitions; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.custom_field_definitions (
    id integer NOT NULL,
    template_id integer,
    field_name character varying(255) NOT NULL,
    field_label character varying(255),
    field_type character varying(50) NOT NULL,
    options jsonb,
    is_required boolean DEFAULT false,
    placeholder text,
    default_value text
);


ALTER TABLE public.custom_field_definitions OWNER TO yanrypangouw;

--
-- Name: custom_field_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.custom_field_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_field_definitions_id_seq OWNER TO yanrypangouw;

--
-- Name: custom_field_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.custom_field_definitions_id_seq OWNED BY public.custom_field_definitions.id;


--
-- Name: department_sla_policies; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.department_sla_policies (
    id integer NOT NULL,
    department_id integer NOT NULL,
    service_type character varying(100) NOT NULL,
    business_hours_only boolean DEFAULT true NOT NULL,
    response_time_hours integer NOT NULL,
    resolution_time_hours integer NOT NULL,
    escalation_rules jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.department_sla_policies OWNER TO yanrypangouw;

--
-- Name: department_sla_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.department_sla_policies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.department_sla_policies_id_seq OWNER TO yanrypangouw;

--
-- Name: department_sla_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.department_sla_policies_id_seq OWNED BY public.department_sla_policies.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    department_type character varying(50) DEFAULT 'internal'::character varying NOT NULL,
    is_service_owner boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.departments OWNER TO yanrypangouw;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO yanrypangouw;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: escalation_instances; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.escalation_instances (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    sla_policy_id integer NOT NULL,
    escalation_level integer NOT NULL,
    triggered_at timestamp(6) with time zone NOT NULL,
    resolved_at timestamp(6) with time zone,
    notified_users jsonb,
    escalation_data jsonb,
    status public.escalation_status DEFAULT 'active'::public.escalation_status NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.escalation_instances OWNER TO yanrypangouw;

--
-- Name: escalation_instances_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.escalation_instances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escalation_instances_id_seq OWNER TO yanrypangouw;

--
-- Name: escalation_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.escalation_instances_id_seq OWNED BY public.escalation_instances.id;


--
-- Name: field_type_definitions; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.field_type_definitions (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    display_name_id character varying(100),
    category character varying(50) NOT NULL,
    description text,
    validation_rules jsonb,
    formatting_rules jsonb,
    ui_config jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.field_type_definitions OWNER TO yanrypangouw;

--
-- Name: field_type_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.field_type_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.field_type_definitions_id_seq OWNER TO yanrypangouw;

--
-- Name: field_type_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.field_type_definitions_id_seq OWNED BY public.field_type_definitions.id;


--
-- Name: government_entities; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.government_entities (
    id integer NOT NULL,
    entity_name character varying(255) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_level character varying(50) NOT NULL,
    contact_person character varying(255),
    contact_email character varying(255),
    contact_phone character varying(50),
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.government_entities OWNER TO yanrypangouw;

--
-- Name: government_entities_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.government_entities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.government_entities_id_seq OWNER TO yanrypangouw;

--
-- Name: government_entities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.government_entities_id_seq OWNED BY public.government_entities.id;


--
-- Name: holiday_calendar; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.holiday_calendar (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    date date NOT NULL,
    description text,
    is_recurring boolean DEFAULT false NOT NULL,
    recurrence_rule character varying(255),
    department_id integer,
    unit_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.holiday_calendar OWNER TO yanrypangouw;

--
-- Name: holiday_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.holiday_calendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.holiday_calendar_id_seq OWNER TO yanrypangouw;

--
-- Name: holiday_calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.holiday_calendar_id_seq OWNED BY public.holiday_calendar.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    sub_category_id integer
);


ALTER TABLE public.items OWNER TO yanrypangouw;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO yanrypangouw;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: kasda_user_profiles; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.kasda_user_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    government_entity_id integer NOT NULL,
    position_title character varying(255) NOT NULL,
    authority_level character varying(100) NOT NULL,
    treasury_account_access text[],
    budget_codes text[],
    fiscal_year integer NOT NULL,
    government_id_number character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.kasda_user_profiles OWNER TO yanrypangouw;

--
-- Name: kasda_user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.kasda_user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kasda_user_profiles_id_seq OWNER TO yanrypangouw;

--
-- Name: kasda_user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.kasda_user_profiles_id_seq OWNED BY public.kasda_user_profiles.id;


--
-- Name: master_data_entities; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.master_data_entities (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    name_indonesian character varying(255),
    description text,
    metadata jsonb,
    parent_id integer,
    department_id integer,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.master_data_entities OWNER TO yanrypangouw;

--
-- Name: master_data_entities_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.master_data_entities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_data_entities_id_seq OWNER TO yanrypangouw;

--
-- Name: master_data_entities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.master_data_entities_id_seq OWNED BY public.master_data_entities.id;


--
-- Name: service_catalog; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.service_catalog (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    service_type public.service_type DEFAULT 'business_service'::public.service_type NOT NULL,
    category_level integer DEFAULT 1 NOT NULL,
    parent_id integer,
    department_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    requires_approval boolean DEFAULT false NOT NULL,
    estimated_time integer,
    business_impact public.business_impact DEFAULT 'medium'::public.business_impact NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_catalog OWNER TO yanrypangouw;

--
-- Name: service_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.service_catalog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_catalog_id_seq OWNER TO yanrypangouw;

--
-- Name: service_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.service_catalog_id_seq OWNED BY public.service_catalog.id;


--
-- Name: service_field_definitions; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.service_field_definitions (
    id integer NOT NULL,
    service_template_id integer,
    service_item_id integer,
    field_name character varying(255) NOT NULL,
    field_label character varying(255) NOT NULL,
    field_type public.field_type NOT NULL,
    options jsonb,
    is_required boolean DEFAULT false NOT NULL,
    is_kasda_specific boolean DEFAULT false NOT NULL,
    placeholder text,
    default_value text,
    validation_rules jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_field_definitions OWNER TO yanrypangouw;

--
-- Name: service_field_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.service_field_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_field_definitions_id_seq OWNER TO yanrypangouw;

--
-- Name: service_field_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.service_field_definitions_id_seq OWNED BY public.service_field_definitions.id;


--
-- Name: service_items; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.service_items (
    id integer NOT NULL,
    service_catalog_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    request_type public.request_type DEFAULT 'service_request'::public.request_type NOT NULL,
    is_kasda_related boolean DEFAULT false NOT NULL,
    requires_gov_approval boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_items OWNER TO yanrypangouw;

--
-- Name: service_items_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.service_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_items_id_seq OWNER TO yanrypangouw;

--
-- Name: service_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.service_items_id_seq OWNED BY public.service_items.id;


--
-- Name: service_templates; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.service_templates (
    id integer NOT NULL,
    service_item_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    template_type public.template_type DEFAULT 'standard'::public.template_type NOT NULL,
    is_kasda_template boolean DEFAULT false NOT NULL,
    requires_business_approval boolean DEFAULT false NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    estimated_resolution_time integer,
    default_root_cause public.root_cause_type,
    default_issue_type public.issue_category_type,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_templates OWNER TO yanrypangouw;

--
-- Name: service_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.service_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_templates_id_seq OWNER TO yanrypangouw;

--
-- Name: service_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.service_templates_id_seq OWNED BY public.service_templates.id;


--
-- Name: sla_policies; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.sla_policies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    service_catalog_id integer,
    service_item_id integer,
    department_id integer,
    priority public.ticket_priority,
    is_kasda_specific boolean DEFAULT false NOT NULL,
    response_time_minutes integer NOT NULL,
    resolution_time_minutes integer NOT NULL,
    business_hours_only boolean DEFAULT true NOT NULL,
    escalation_matrix jsonb,
    notification_rules jsonb,
    is_active boolean DEFAULT true NOT NULL,
    effective_from timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    effective_to timestamp(6) with time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sla_policies OWNER TO yanrypangouw;

--
-- Name: sla_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.sla_policies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sla_policies_id_seq OWNER TO yanrypangouw;

--
-- Name: sla_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.sla_policies_id_seq OWNED BY public.sla_policies.id;


--
-- Name: sub_categories; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.sub_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category_id integer
);


ALTER TABLE public.sub_categories OWNER TO yanrypangouw;

--
-- Name: sub_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.sub_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sub_categories_id_seq OWNER TO yanrypangouw;

--
-- Name: sub_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.sub_categories_id_seq OWNED BY public.sub_categories.id;


--
-- Name: template_categories; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.template_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    name_indonesian character varying(100) NOT NULL,
    description text,
    parent_id integer,
    department_id integer,
    icon character varying(50),
    color character varying(20),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.template_categories OWNER TO yanrypangouw;

--
-- Name: template_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.template_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.template_categories_id_seq OWNER TO yanrypangouw;

--
-- Name: template_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.template_categories_id_seq OWNED BY public.template_categories.id;


--
-- Name: template_metadata; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.template_metadata (
    id integer NOT NULL,
    template_id integer,
    service_template_id integer,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_indonesian character varying(255) NOT NULL,
    description text,
    business_process character varying(100),
    complexity character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    estimated_time integer DEFAULT 30 NOT NULL,
    popularity_score double precision DEFAULT 0 NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    tags text[],
    search_keywords character varying(500),
    search_keywords_id character varying(500),
    is_public boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    department_id integer,
    created_by integer NOT NULL,
    approved_by integer,
    approved_at timestamp(6) with time zone,
    version character varying(20) DEFAULT '1.0.0'::character varying NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.template_metadata OWNER TO yanrypangouw;

--
-- Name: template_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.template_metadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.template_metadata_id_seq OWNER TO yanrypangouw;

--
-- Name: template_metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.template_metadata_id_seq OWNED BY public.template_metadata.id;


--
-- Name: template_usage_logs; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.template_usage_logs (
    id integer NOT NULL,
    template_id integer,
    service_template_id integer,
    user_id integer NOT NULL,
    department_id integer,
    ticket_id integer,
    usage_type character varying(20) NOT NULL,
    session_id character varying(255),
    ip_address character varying(45),
    user_agent character varying(500),
    completion_time integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.template_usage_logs OWNER TO yanrypangouw;

--
-- Name: template_usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.template_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.template_usage_logs_id_seq OWNER TO yanrypangouw;

--
-- Name: template_usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.template_usage_logs_id_seq OWNED BY public.template_usage_logs.id;


--
-- Name: ticket_assignment_logs; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_assignment_logs (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    assigned_to_user_id integer,
    assignment_rule_id integer,
    assignment_method character varying(50) NOT NULL,
    assignment_reason text,
    assigned_by_user_id integer,
    previous_assignee_id integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_assignment_logs OWNER TO yanrypangouw;

--
-- Name: ticket_assignment_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_assignment_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_assignment_logs_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_assignment_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_assignment_logs_id_seq OWNED BY public.ticket_assignment_logs.id;


--
-- Name: ticket_attachments; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_attachments (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(100),
    uploaded_by_user_id integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ticket_attachments OWNER TO yanrypangouw;

--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_attachments_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_attachments_id_seq OWNED BY public.ticket_attachments.id;


--
-- Name: ticket_classification_audit; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_classification_audit (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    changed_by integer NOT NULL,
    field_changed character varying(100) NOT NULL,
    old_value character varying(100),
    new_value character varying(100),
    reason character varying(500),
    ip_address character varying(45),
    user_agent character varying(500),
    session_id character varying(255),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_classification_audit OWNER TO yanrypangouw;

--
-- Name: ticket_classification_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_classification_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_classification_audit_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_classification_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_classification_audit_id_seq OWNED BY public.ticket_classification_audit.id;


--
-- Name: ticket_comments; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_comments (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    author_id integer NOT NULL,
    content text NOT NULL,
    comment_type public.comment_type DEFAULT 'comment'::public.comment_type NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    is_system_generated boolean DEFAULT false NOT NULL,
    parent_comment_id integer,
    mentions integer[],
    attachments jsonb,
    edited_at timestamp(6) with time zone,
    edited_by integer,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp(6) with time zone,
    deleted_by integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_comments OWNER TO yanrypangouw;

--
-- Name: ticket_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_comments_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_comments_id_seq OWNED BY public.ticket_comments.id;


--
-- Name: ticket_custom_field_values; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_custom_field_values (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    field_definition_id integer NOT NULL,
    value text
);


ALTER TABLE public.ticket_custom_field_values OWNER TO yanrypangouw;

--
-- Name: ticket_custom_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_custom_field_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_custom_field_values_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_custom_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_custom_field_values_id_seq OWNED BY public.ticket_custom_field_values.id;


--
-- Name: ticket_service_field_values; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_service_field_values (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    field_definition_id integer NOT NULL,
    value text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_service_field_values OWNER TO yanrypangouw;

--
-- Name: ticket_service_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_service_field_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_service_field_values_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_service_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_service_field_values_id_seq OWNED BY public.ticket_service_field_values.id;


--
-- Name: ticket_templates; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.ticket_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    item_id integer,
    description text
);


ALTER TABLE public.ticket_templates OWNER TO yanrypangouw;

--
-- Name: ticket_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.ticket_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_templates_id_seq OWNER TO yanrypangouw;

--
-- Name: ticket_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.ticket_templates_id_seq OWNED BY public.ticket_templates.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status public.ticket_status DEFAULT 'open'::public.ticket_status NOT NULL,
    priority public.ticket_priority DEFAULT 'medium'::public.ticket_priority NOT NULL,
    created_by_user_id integer NOT NULL,
    assigned_to_user_id integer,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at timestamp(6) with time zone,
    sla_due_date timestamp(6) with time zone,
    item_id integer,
    template_id integer,
    manager_comments text,
    business_comments text,
    business_impact public.business_impact DEFAULT 'medium'::public.business_impact NOT NULL,
    confirmed_issue_category public.issue_category_type,
    confirmed_root_cause public.root_cause_type,
    government_entity_id integer,
    is_classification_locked boolean DEFAULT false NOT NULL,
    is_kasda_ticket boolean DEFAULT false NOT NULL,
    request_type public.request_type DEFAULT 'service_request'::public.request_type NOT NULL,
    requires_business_approval boolean DEFAULT false NOT NULL,
    service_catalog_id integer,
    service_item_id integer,
    service_template_id integer,
    tech_categorized_at timestamp(6) with time zone,
    tech_categorized_by integer,
    tech_issue_category public.issue_category_type,
    tech_override_reason character varying(500),
    tech_root_cause public.root_cause_type,
    user_categorized_at timestamp(6) with time zone,
    user_categorized_ip character varying(45),
    user_issue_category public.issue_category_type,
    user_root_cause public.root_cause_type
);


ALTER TABLE public.tickets OWNER TO yanrypangouw;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO yanrypangouw;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.units (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    display_name character varying(255),
    unit_type character varying(50) DEFAULT 'branch'::character varying NOT NULL,
    parent_id integer,
    department_id integer,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    address text,
    phone character varying(100),
    fax character varying(100),
    region character varying(100),
    province character varying(100),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.units OWNER TO yanrypangouw;

--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_id_seq OWNER TO yanrypangouw;

--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: yanrypangouw
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    manager_id integer,
    current_workload integer DEFAULT 0 NOT NULL,
    department_id integer,
    experience_level character varying(50),
    is_available boolean DEFAULT true NOT NULL,
    is_business_reviewer boolean DEFAULT false NOT NULL,
    is_kasda_user boolean DEFAULT false NOT NULL,
    name character varying(255),
    primary_skill character varying(100),
    secondary_skills text,
    unit_id integer,
    workload_capacity integer DEFAULT 10 NOT NULL
);


ALTER TABLE public.users OWNER TO yanrypangouw;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: yanrypangouw
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO yanrypangouw;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yanrypangouw
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: api_token_usage_logs id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.api_token_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.api_token_usage_logs_id_seq'::regclass);


--
-- Name: api_tokens id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.api_tokens ALTER COLUMN id SET DEFAULT nextval('public.api_tokens_id_seq'::regclass);


--
-- Name: auto_assignment_rules id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.auto_assignment_rules ALTER COLUMN id SET DEFAULT nextval('public.auto_assignment_rules_id_seq'::regclass);


--
-- Name: bsg_field_options id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_field_options ALTER COLUMN id SET DEFAULT nextval('public.bsg_field_options_id_seq'::regclass);


--
-- Name: bsg_field_types id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_field_types ALTER COLUMN id SET DEFAULT nextval('public.bsg_field_types_id_seq'::regclass);


--
-- Name: bsg_global_field_definitions id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_global_field_definitions ALTER COLUMN id SET DEFAULT nextval('public.bsg_global_field_definitions_id_seq'::regclass);


--
-- Name: bsg_master_data id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_master_data ALTER COLUMN id SET DEFAULT nextval('public.bsg_master_data_id_seq'::regclass);


--
-- Name: bsg_template_categories id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_categories ALTER COLUMN id SET DEFAULT nextval('public.bsg_template_categories_id_seq'::regclass);


--
-- Name: bsg_template_fields id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_fields ALTER COLUMN id SET DEFAULT nextval('public.bsg_template_fields_id_seq'::regclass);


--
-- Name: bsg_template_usage_logs id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.bsg_template_usage_logs_id_seq'::regclass);


--
-- Name: bsg_templates id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_templates ALTER COLUMN id SET DEFAULT nextval('public.bsg_templates_id_seq'::regclass);


--
-- Name: bsg_ticket_field_values id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_ticket_field_values ALTER COLUMN id SET DEFAULT nextval('public.bsg_ticket_field_values_id_seq'::regclass);


--
-- Name: business_approvals id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_approvals ALTER COLUMN id SET DEFAULT nextval('public.business_approvals_id_seq'::regclass);


--
-- Name: business_hours_config id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_hours_config ALTER COLUMN id SET DEFAULT nextval('public.business_hours_config_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: comment_notifications id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.comment_notifications ALTER COLUMN id SET DEFAULT nextval('public.comment_notifications_id_seq'::regclass);


--
-- Name: custom_field_definitions id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.custom_field_definitions ALTER COLUMN id SET DEFAULT nextval('public.custom_field_definitions_id_seq'::regclass);


--
-- Name: department_sla_policies id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.department_sla_policies ALTER COLUMN id SET DEFAULT nextval('public.department_sla_policies_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: escalation_instances id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.escalation_instances ALTER COLUMN id SET DEFAULT nextval('public.escalation_instances_id_seq'::regclass);


--
-- Name: field_type_definitions id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.field_type_definitions ALTER COLUMN id SET DEFAULT nextval('public.field_type_definitions_id_seq'::regclass);


--
-- Name: government_entities id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.government_entities ALTER COLUMN id SET DEFAULT nextval('public.government_entities_id_seq'::regclass);


--
-- Name: holiday_calendar id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.holiday_calendar ALTER COLUMN id SET DEFAULT nextval('public.holiday_calendar_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: kasda_user_profiles id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.kasda_user_profiles ALTER COLUMN id SET DEFAULT nextval('public.kasda_user_profiles_id_seq'::regclass);


--
-- Name: master_data_entities id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.master_data_entities ALTER COLUMN id SET DEFAULT nextval('public.master_data_entities_id_seq'::regclass);


--
-- Name: service_catalog id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_catalog ALTER COLUMN id SET DEFAULT nextval('public.service_catalog_id_seq'::regclass);


--
-- Name: service_field_definitions id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_field_definitions ALTER COLUMN id SET DEFAULT nextval('public.service_field_definitions_id_seq'::regclass);


--
-- Name: service_items id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_items ALTER COLUMN id SET DEFAULT nextval('public.service_items_id_seq'::regclass);


--
-- Name: service_templates id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_templates ALTER COLUMN id SET DEFAULT nextval('public.service_templates_id_seq'::regclass);


--
-- Name: sla_policies id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sla_policies ALTER COLUMN id SET DEFAULT nextval('public.sla_policies_id_seq'::regclass);


--
-- Name: sub_categories id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sub_categories ALTER COLUMN id SET DEFAULT nextval('public.sub_categories_id_seq'::regclass);


--
-- Name: template_categories id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_categories ALTER COLUMN id SET DEFAULT nextval('public.template_categories_id_seq'::regclass);


--
-- Name: template_metadata id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata ALTER COLUMN id SET DEFAULT nextval('public.template_metadata_id_seq'::regclass);


--
-- Name: template_usage_logs id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.template_usage_logs_id_seq'::regclass);


--
-- Name: ticket_assignment_logs id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs ALTER COLUMN id SET DEFAULT nextval('public.ticket_assignment_logs_id_seq'::regclass);


--
-- Name: ticket_attachments id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_attachments ALTER COLUMN id SET DEFAULT nextval('public.ticket_attachments_id_seq'::regclass);


--
-- Name: ticket_classification_audit id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_classification_audit ALTER COLUMN id SET DEFAULT nextval('public.ticket_classification_audit_id_seq'::regclass);


--
-- Name: ticket_comments id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments ALTER COLUMN id SET DEFAULT nextval('public.ticket_comments_id_seq'::regclass);


--
-- Name: ticket_custom_field_values id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_custom_field_values ALTER COLUMN id SET DEFAULT nextval('public.ticket_custom_field_values_id_seq'::regclass);


--
-- Name: ticket_service_field_values id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_service_field_values ALTER COLUMN id SET DEFAULT nextval('public.ticket_service_field_values_id_seq'::regclass);


--
-- Name: ticket_templates id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_templates ALTER COLUMN id SET DEFAULT nextval('public.ticket_templates_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bae28118-0f8f-4b42-b4fb-f64cc01119fb	0fea3f9f04713b271c3257df3244c2ce6436b3fe18a147aefe88ef9b5c899b19	2025-07-01 07:09:00.893338+08	20250619023958_init	\N	\N	2025-07-01 07:09:00.826756+08	1
\.


--
-- Data for Name: api_token_usage_logs; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.api_token_usage_logs (id, token_id, endpoint, method, ip_address, user_agent, status_code, response_time, created_at) FROM stdin;
\.


--
-- Data for Name: api_tokens; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.api_tokens (id, name, description, token_hash, scopes, is_active, expires_at, last_used_at, usage_count, created_by_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: auto_assignment_rules; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.auto_assignment_rules (id, name, description, is_active, priority, template_id, department_id, priority_level, required_skill, assignment_strategy, respect_capacity, max_workload_percent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bsg_field_options; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_field_options (id, field_id, master_data_type, option_value, option_label, is_default, sort_order, created_at) FROM stdin;
1	2	\N	kantor_cabang_utama	Kantor Cabang Utama	t	1	2025-07-01 11:49:00.989+08
2	2	\N	kantor_cabang_jakarta	Kantor Cabang JAKARTA	f	2	2025-07-01 11:49:00.994+08
3	2	\N	kantor_cabang_gorontalo	Kantor Cabang GORONTALO	f	3	2025-07-01 11:49:00.995+08
4	2	\N	kantor_cabang_kotamobagu	Kantor Cabang KOTAMOBAGU	f	4	2025-07-01 11:49:00.997+08
5	2	\N	kantor_cabang_bitung	Kantor Cabang BITUNG	f	5	2025-07-01 11:49:00.998+08
6	2	\N	kantor_cabang_airmadidi	Kantor Cabang AIRMADIDI	f	6	2025-07-01 11:49:00.999+08
7	2	\N	kantor_cabang_tomohon	Kantor Cabang TOMOHON	f	7	2025-07-01 11:49:01.001+08
8	2	\N	kantor_cabang_tondano	Kantor Cabang TONDANO	f	8	2025-07-01 11:49:01.002+08
9	2	\N	kantor_cabang_pembantu_kelapa_gading	Kantor Cabang Pembantu KELAPA GADING	f	9	2025-07-01 11:49:01.003+08
10	2	\N	kantor_cabang_pembantu_tuminting	Kantor Cabang Pembantu TUMINTING	f	10	2025-07-01 11:49:01.004+08
11	2	\N	kantor_cabang_pembantu_wenang	Kantor Cabang Pembantu WENANG	f	11	2025-07-01 11:49:01.006+08
12	2	\N	kantor_cabang_pembantu_wanea	Kantor Cabang Pembantu WANEA	f	12	2025-07-01 11:49:01.007+08
13	2	\N	kantor_cabang_pembantu_malalayang	Kantor Cabang Pembantu MALALAYANG	f	13	2025-07-01 11:49:01.008+08
14	2	\N	kantor_cabang_pembantu_poigar	Kantor Cabang Pembantu POIGAR	f	14	2025-07-01 11:49:01.009+08
15	2	\N	kantor_cabang_pembantu_bolmong_selatan	Kantor Cabang Pembantu BOLMONG SELATAN	f	15	2025-07-01 11:49:01.01+08
16	7	\N	program_fasilitas_olibs	Program Fasilitas OLIBS	t	1	2025-07-01 11:49:01.02+08
17	7	\N	aplikasi_olibs	Aplikasi OLIBS	f	2	2025-07-01 11:49:01.021+08
18	9	\N	kantor_cabang_utama	Kantor Cabang Utama	t	1	2025-07-01 11:49:01.025+08
19	9	\N	kantor_cabang_jakarta	Kantor Cabang JAKARTA	f	2	2025-07-01 11:49:01.026+08
20	9	\N	kantor_cabang_gorontalo	Kantor Cabang GORONTALO	f	3	2025-07-01 11:49:01.027+08
21	9	\N	kantor_cabang_kotamobagu	Kantor Cabang KOTAMOBAGU	f	4	2025-07-01 11:49:01.028+08
22	9	\N	kantor_cabang_bitung	Kantor Cabang BITUNG	f	5	2025-07-01 11:49:01.029+08
23	9	\N	kantor_cabang_airmadidi	Kantor Cabang AIRMADIDI	f	6	2025-07-01 11:49:01.03+08
24	9	\N	kantor_cabang_tomohon	Kantor Cabang TOMOHON	f	7	2025-07-01 11:49:01.031+08
25	9	\N	kantor_cabang_tondano	Kantor Cabang TONDANO	f	8	2025-07-01 11:49:01.032+08
26	9	\N	kantor_cabang_pembantu_kelapa_gading	Kantor Cabang Pembantu KELAPA GADING	f	9	2025-07-01 11:49:01.033+08
27	9	\N	kantor_cabang_pembantu_tuminting	Kantor Cabang Pembantu TUMINTING	f	10	2025-07-01 11:49:01.034+08
28	9	\N	kantor_cabang_pembantu_wenang	Kantor Cabang Pembantu WENANG	f	11	2025-07-01 11:49:01.036+08
29	9	\N	kantor_cabang_pembantu_wanea	Kantor Cabang Pembantu WANEA	f	12	2025-07-01 11:49:01.037+08
30	9	\N	kantor_cabang_pembantu_malalayang	Kantor Cabang Pembantu MALALAYANG	f	13	2025-07-01 11:49:01.038+08
31	9	\N	kantor_cabang_pembantu_poigar	Kantor Cabang Pembantu POIGAR	f	14	2025-07-01 11:49:01.039+08
32	9	\N	kantor_cabang_pembantu_bolmong_selatan	Kantor Cabang Pembantu BOLMONG SELATAN	f	15	2025-07-01 11:49:01.04+08
33	14	\N	kantor_cabang_utama	Kantor Cabang Utama	t	1	2025-07-01 11:49:01.045+08
34	14	\N	kantor_cabang_jakarta	Kantor Cabang JAKARTA	f	2	2025-07-01 11:49:01.046+08
35	14	\N	kantor_cabang_gorontalo	Kantor Cabang GORONTALO	f	3	2025-07-01 11:49:01.047+08
36	14	\N	kantor_cabang_kotamobagu	Kantor Cabang KOTAMOBAGU	f	4	2025-07-01 11:49:01.048+08
37	14	\N	kantor_cabang_bitung	Kantor Cabang BITUNG	f	5	2025-07-01 11:49:01.049+08
38	14	\N	kantor_cabang_airmadidi	Kantor Cabang AIRMADIDI	f	6	2025-07-01 11:49:01.05+08
39	14	\N	kantor_cabang_tomohon	Kantor Cabang TOMOHON	f	7	2025-07-01 11:49:01.052+08
40	14	\N	kantor_cabang_tondano	Kantor Cabang TONDANO	f	8	2025-07-01 11:49:01.053+08
41	14	\N	kantor_cabang_pembantu_kelapa_gading	Kantor Cabang Pembantu KELAPA GADING	f	9	2025-07-01 11:49:01.054+08
42	14	\N	kantor_cabang_pembantu_tuminting	Kantor Cabang Pembantu TUMINTING	f	10	2025-07-01 11:49:01.054+08
43	14	\N	kantor_cabang_pembantu_wenang	Kantor Cabang Pembantu WENANG	f	11	2025-07-01 11:49:01.055+08
44	14	\N	kantor_cabang_pembantu_wanea	Kantor Cabang Pembantu WANEA	f	12	2025-07-01 11:49:01.056+08
45	14	\N	kantor_cabang_pembantu_malalayang	Kantor Cabang Pembantu MALALAYANG	f	13	2025-07-01 11:49:01.058+08
46	14	\N	kantor_cabang_pembantu_poigar	Kantor Cabang Pembantu POIGAR	f	14	2025-07-01 11:49:01.059+08
47	14	\N	kantor_cabang_pembantu_bolmong_selatan	Kantor Cabang Pembantu BOLMONG SELATAN	f	15	2025-07-01 11:49:01.06+08
48	16	\N	program_fasilitas_olibs	Program Fasilitas OLIBS	t	1	2025-07-01 11:49:01.063+08
49	16	\N	aplikasi_olibs	Aplikasi OLIBS	f	2	2025-07-01 11:49:01.064+08
50	17	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.067+08
51	17	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.068+08
52	17	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.069+08
53	21	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.074+08
54	21	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.075+08
55	21	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.076+08
56	25	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.082+08
57	25	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.083+08
58	25	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.084+08
59	35	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.094+08
60	35	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.096+08
61	35	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.097+08
62	39	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.1+08
63	39	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.101+08
64	39	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.103+08
65	41	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.106+08
66	41	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.107+08
67	41	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.108+08
68	46	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.113+08
69	46	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.114+08
70	46	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.115+08
71	53	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.123+08
72	53	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.124+08
73	53	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.125+08
74	57	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.131+08
75	57	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.132+08
76	57	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.133+08
77	61	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.136+08
78	61	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.137+08
79	61	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.138+08
80	65	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.143+08
81	65	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.144+08
82	65	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.145+08
83	69	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.149+08
84	69	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.15+08
85	69	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.151+08
86	73	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.156+08
87	73	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.157+08
88	73	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.158+08
89	77	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.163+08
90	77	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.164+08
91	77	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.165+08
92	81	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.169+08
93	81	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.17+08
94	81	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.173+08
95	85	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.176+08
96	85	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.178+08
97	85	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.179+08
98	89	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.184+08
99	89	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.186+08
100	89	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.187+08
101	93	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.191+08
102	93	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.192+08
103	93	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.193+08
104	95	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.196+08
105	95	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.198+08
106	95	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.199+08
107	102	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.205+08
108	102	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.206+08
109	102	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.207+08
110	106	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.212+08
111	106	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.213+08
112	106	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.215+08
113	110	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.219+08
114	110	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.221+08
115	110	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.222+08
116	114	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.227+08
117	114	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.228+08
118	114	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.229+08
119	118	\N	option_1	Option 1	t	1	2025-07-01 11:49:01.233+08
120	118	\N	option_2	Option 2	f	2	2025-07-01 11:49:01.234+08
121	118	\N	option_3	Option 3	f	3	2025-07-01 11:49:01.235+08
\.


--
-- Data for Name: bsg_field_types; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_field_types (id, name, display_name, html_input_type, validation_pattern, is_active, created_at) FROM stdin;
1	text_input	Text Input	text	.{0,255}	t	2025-07-01 11:40:17.832+08
2	textarea	Text Area	textarea	.{0,2000}	t	2025-07-01 11:40:17.833+08
4	checkbox	Checkbox	checkbox	\N	t	2025-07-01 11:40:17.833+08
5	dropdown	Dropdown Selection	select	\N	t	2025-07-01 11:40:17.832+08
3	number_input	Number Input	number	^[0-9]+$	t	2025-07-01 11:40:17.833+08
6	date_custom	Date	date	\N	t	2025-07-01 11:49:00.972+08
7	datetime-local_custom	Timestamp	datetime-local	\N	t	2025-07-01 11:49:01.09+08
\.


--
-- Data for Name: bsg_global_field_definitions; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_global_field_definitions (id, field_name, field_type, field_label, description, placeholder_text, help_text, is_required, max_length, validation_rules, field_category, usage_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bsg_master_data; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_master_data (id, data_type, code, name, display_name, parent_id, metadata, is_active, sort_order, created_at, updated_at) FROM stdin;
5	access_level	admin	Admin	Admin	\N	\N	t	1	2025-07-01 11:40:17.858+08	2025-07-01 11:40:17.858+08
2	olibs_menu	aplikasi_olibs	Aplikasi OLIBS	Aplikasi OLIBS	\N	\N	t	2	2025-07-01 11:40:17.858+08	2025-07-01 11:40:17.858+08
1	olibs_menu	program_fasilitas	Program Fasilitas OLIBS	Program Fasilitas OLIBS	\N	\N	t	1	2025-07-01 11:40:17.858+08	2025-07-01 11:40:17.858+08
4	government_entity	prov_sulut	Pemerintah Provinsi Sulawesi Utara	Pemerintah Provinsi Sulawesi Utara	\N	\N	t	1	2025-07-01 11:40:17.858+08	2025-07-01 11:40:17.858+08
3	government_entity	pemkot_manado	Pemerintah Kota Manado	Pemerintah Kota Manado	\N	\N	t	2	2025-07-01 11:40:17.858+08	2025-07-01 11:40:17.858+08
6	access_level	user	User	User	\N	\N	t	2	2025-07-01 11:40:17.858+08	2025-07-01 11:40:17.858+08
\.


--
-- Data for Name: bsg_template_categories; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_template_categories (id, name, display_name, description, icon, sort_order, is_active, created_at, updated_at) FROM stdin;
1	IT Support	IT Support	Templates for IT support requests	\N	1	t	2025-07-01 11:40:17.877+08	2025-07-01 11:40:17.877+08
2	Banking Operations	Banking Operations	Templates for banking operation requests	\N	2	t	2025-07-01 11:40:17.877+08	2025-07-01 11:40:17.877+08
3	Government Services	Government Services	Templates for government and KASDA services	\N	3	t	2025-07-01 11:40:17.877+08	2025-07-01 11:40:17.877+08
\.


--
-- Data for Name: bsg_template_fields; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_template_fields (id, template_id, field_type_id, field_name, field_label, field_description, is_required, max_length, sort_order, placeholder_text, help_text, validation_rules, created_at) FROM stdin;
1	1	6	tanggal_berlaku	Tanggal berlaku	Tanggal berlaku perubahan menu User	t	\N	1	Enter tanggal berlaku	Tanggal berlaku perubahan menu User	\N	2025-07-01 11:49:00.974+08
2	1	5	cabang___capem	Cabang / Capem	Cabang/Capem Requester	t	\N	2	Enter cabang / capem	Cabang/Capem Requester	\N	2025-07-01 11:49:00.981+08
3	1	1	kantor_kas	Kantor Kas	Kantor kas dari User	f	\N	3	Enter kantor kas	Kantor kas dari User	\N	2025-07-01 11:49:01.011+08
4	1	1	kode_user	Kode User	Kode User Requester	t	\N	4	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.012+08
5	1	1	nama_user	Nama User	Nama User Requester	t	\N	5	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.013+08
6	1	1	jabatan	Jabatan	Jabatan dari User Requester	t	\N	6	Enter jabatan	Jabatan dari User Requester	\N	2025-07-01 11:49:01.014+08
7	1	5	program_fasilitas_olibs	Program Fasilitas OLIBS	Wewenang menu permintaan User	t	\N	7	Enter program fasilitas olibs	Wewenang menu permintaan User	\N	2025-07-01 11:49:01.015+08
8	2	6	tanggal_berlaku	Tanggal berlaku	Tanggal berlaku perubahan menu User	t	\N	1	Enter tanggal berlaku	Tanggal berlaku perubahan menu User	\N	2025-07-01 11:49:01.022+08
9	2	5	cabang___capem	Cabang / Capem	Cabang/Capem Requester	t	\N	2	Enter cabang / capem	Cabang/Capem Requester	\N	2025-07-01 11:49:01.023+08
10	2	1	kantor_kas	Kantor Kas	Kantor kas dari User	f	\N	3	Enter kantor kas	Kantor kas dari User	\N	2025-07-01 11:49:01.041+08
11	2	1	kode_user	Kode User	Kode User Requester	t	\N	4	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.041+08
12	2	1	nama_user	Nama User	Nama User Requester	t	\N	5	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.042+08
13	2	1	jabatan	Jabatan	Jabatan dari User Requester	t	\N	6	Enter jabatan	Jabatan dari User Requester	\N	2025-07-01 11:49:01.042+08
14	2	5	mutasi_dari	Mutasi dari	Cabang/Capem asal dari Requester	f	\N	7	Enter mutasi dari	Cabang/Capem asal dari Requester	\N	2025-07-01 11:49:01.043+08
15	2	1	mutasi_ke_kantor_kas	Mutasi ke Kantor Kas	Kantor kas tujuan apabila hanya terjadi mutasi internal User	f	\N	8	Enter mutasi ke kantor kas	Kantor kas tujuan apabila hanya terjadi mutasi internal User	\N	2025-07-01 11:49:01.061+08
16	2	5	program_fasilitas_olibs	Program Fasilitas OLIBS	Wewenang menu permintaan User	t	\N	9	Enter program fasilitas olibs	Wewenang menu permintaan User	\N	2025-07-01 11:49:01.061+08
17	3	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.066+08
18	3	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.07+08
19	3	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.07+08
20	3	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.071+08
21	4	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.073+08
22	4	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.077+08
23	4	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.078+08
24	4	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.079+08
25	5	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.08+08
26	5	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.085+08
27	5	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.086+08
28	5	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.086+08
29	6	1	nama_nasabah	Nama Nasabah	Nama nasabah pengirim transaksi	t	\N	1	Enter nama nasabah	Nama nasabah pengirim transaksi	\N	2025-07-01 11:49:01.088+08
30	6	3	nomor_rekening	Nomor Rekening	Nomor rekening pengirim transaksi	t	\N	2	Enter nomor rekening	Nomor rekening pengirim transaksi	\N	2025-07-01 11:49:01.088+08
31	6	1	nomor_kartu	Nomor Kartu	Nomor kartu nasabah	f	\N	3	Enter nomor kartu	Nomor kartu nasabah	\N	2025-07-01 11:49:01.089+08
32	6	3	nominal_transaksi	Nominal Transaksi	Nominal per transaksi yang diklaim, sudah ditambahkan dengan fee transaksi	t	\N	4	Enter nominal transaksi	Nominal per transaksi yang diklaim, sudah ditambahkan dengan fee transaksi	\N	2025-07-01 11:49:01.09+08
33	6	7	tanggal_transaksi	Tanggal transaksi	Tanggal transaksi dilakukan	t	\N	5	Enter tanggal transaksi	Tanggal transaksi dilakukan	\N	2025-07-01 11:49:01.091+08
34	6	1	nomor_arsip	Nomor Arsip	Nomor arsip transaksi	t	\N	6	Enter nomor arsip	Nomor arsip transaksi	\N	2025-07-01 11:49:01.092+08
35	7	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.093+08
36	7	1	nama_nasabah	Nama Nasabah	Nama Nasabah	f	\N	2	Enter nama nasabah	Nama Nasabah	\N	2025-07-01 11:49:01.097+08
37	7	1	nomor_rekening	Nomor Rekening	Nomor rekening Nasabah	f	\N	3	Enter nomor rekening	Nomor rekening Nasabah	\N	2025-07-01 11:49:01.098+08
38	7	1	nominal_transaksi	Nominal Transaksi	Jumlah nominal transaksi	f	\N	4	Enter nominal transaksi	Jumlah nominal transaksi	\N	2025-07-01 11:49:01.099+08
39	7	5	tgl__transaksi	Tgl. Transaksi	Tanggal transaksi	f	\N	5	Enter tgl. transaksi	Tanggal transaksi	\N	2025-07-01 11:49:01.099+08
40	7	1	nomor_arsip	Nomor Arsip	Nomor arsip transaksi	f	\N	6	Enter nomor arsip	Nomor arsip transaksi	\N	2025-07-01 11:49:01.103+08
41	8	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.104+08
42	8	1	kantor_kas	Kantor kas	Kantor kas dari User	f	\N	2	Enter kantor kas	Kantor kas dari User	\N	2025-07-01 11:49:01.108+08
43	8	1	kode_user	Kode User	Kode User Requester	f	\N	3	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.109+08
44	8	1	nama_user	Nama User	Nama User Requester	f	\N	4	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.11+08
45	8	1	jabatan	Jabatan	Jabatan User Requester	f	\N	5	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.11+08
46	9	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.112+08
47	9	1	kantor_kas	Kantor kas	Kantor kas dari User	f	\N	2	Enter kantor kas	Kantor kas dari User	\N	2025-07-01 11:49:01.116+08
48	9	1	kode_user	Kode User	Kode User Requester	f	\N	3	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.117+08
49	9	1	nama_user	Nama User	Nama User Requester	f	\N	4	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.117+08
50	9	1	jabatan	Jabatan	Jabatan User Requester	f	\N	5	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.118+08
51	9	1	ip_komputer	IP Komputer	IP computer User	f	\N	6	Enter ip komputer	IP computer User	\N	2025-07-01 11:49:01.119+08
52	9	1	menu_xcard	Menu XCARD	Menu yang digunakan	f	\N	7	Enter menu xcard	Menu yang digunakan	\N	2025-07-01 11:49:01.119+08
53	10	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.122+08
54	10	1	menu_teller_app	Menu Teller App	Menu yang dimintakan (Tunai, Non Tunai, SPV)	f	\N	2	Enter menu teller app	Menu yang dimintakan (Tunai, Non Tunai, SPV)	\N	2025-07-01 11:49:01.126+08
55	10	1	user_spv_1	User SPV 1	Nama User SPV 1 Requester	f	\N	3	Enter user spv 1	Nama User SPV 1 Requester	\N	2025-07-01 11:49:01.127+08
56	10	1	user_spv_2	User SPV 2	Jabatan User SPV 2 Requester	f	\N	4	Enter user spv 2	Jabatan User SPV 2 Requester	\N	2025-07-01 11:49:01.128+08
57	11	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.13+08
58	11	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.133+08
59	11	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.134+08
60	11	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.134+08
61	12	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.135+08
62	12	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.139+08
63	12	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.14+08
64	12	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.14+08
65	13	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.141+08
66	13	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.145+08
67	13	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.146+08
68	13	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.147+08
69	14	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.148+08
70	14	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.152+08
71	14	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.153+08
72	14	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.153+08
73	15	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.154+08
74	15	1	nomor_surat	Nomor Surat	Nomor Surat dari Cabang/Capem	f	\N	2	Enter nomor surat	Nomor Surat dari Cabang/Capem	\N	2025-07-01 11:49:01.158+08
75	15	1	alasan	Alasan	Alasan Perpanjangan waktu operasional	f	\N	3	Enter alasan	Alasan Perpanjangan waktu operasional	\N	2025-07-01 11:49:01.159+08
76	15	1	estimasi_close_cabang	Estimasi Close Cabang	Estimasi Waktu Closed Cabang/Capem	f	\N	4	Enter estimasi close cabang	Estimasi Waktu Closed Cabang/Capem	\N	2025-07-01 11:49:01.16+08
77	16	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.162+08
78	16	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.166+08
79	16	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.166+08
80	16	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.167+08
81	17	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.168+08
82	17	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.173+08
83	17	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.174+08
84	17	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.174+08
85	18	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.175+08
86	18	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.179+08
87	18	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.18+08
88	18	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.181+08
89	19	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.183+08
90	19	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.188+08
91	19	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.188+08
92	19	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.189+08
93	19	5	mutasi_dari_cabang___capem	Mutasi dari Cabang / Capem	Cabang/Capem Sebelum	f	\N	5	Enter mutasi dari cabang / capem	Cabang/Capem Sebelum	\N	2025-07-01 11:49:01.19+08
94	19	1	mutasi_ke_kantor_kas	Mutasi ke Kantor Kas	Nama Kantor Kas	f	\N	6	Enter mutasi ke kantor kas	Nama Kantor Kas	\N	2025-07-01 11:49:01.194+08
95	20	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.195+08
96	20	1	id_atm	ID ATM	ID ATM Terdaftar	f	\N	2	Enter id atm	ID ATM Terdaftar	\N	2025-07-01 11:49:01.199+08
97	20	1	nama_atm	Nama ATM	Nama ATM terdaftar	f	\N	3	Enter nama atm	Nama ATM terdaftar	\N	2025-07-01 11:49:01.2+08
98	20	1	serial_number	Serial Number	SN ATM	f	\N	4	Enter serial number	SN ATM	\N	2025-07-01 11:49:01.201+08
99	20	1	tipe_mesin	Tipe Mesin	Merk mesin	f	\N	5	Enter tipe mesin	Merk mesin	\N	2025-07-01 11:49:01.201+08
100	20	1	nama_pic	Nama PIC	Nama PIC	f	\N	6	Enter nama pic	Nama PIC	\N	2025-07-01 11:49:01.202+08
101	20	1	no_hp_pic	No HP PIC	No HP	f	\N	7	Enter no hp pic	No HP	\N	2025-07-01 11:49:01.203+08
102	21	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.204+08
103	21	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.208+08
104	21	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.208+08
105	21	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.209+08
106	22	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.21+08
107	22	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.215+08
108	22	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.216+08
109	22	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.217+08
110	23	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.218+08
111	23	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.222+08
112	23	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.223+08
113	23	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.224+08
114	24	5	cabang_capem	Cabang/Capem	Nama Cabang/Capem Requester	f	\N	1	Enter cabang/capem	Nama Cabang/Capem Requester	\N	2025-07-01 11:49:01.225+08
115	24	1	kode_user	Kode User	Kode User Requester	f	\N	2	Enter kode user	Kode User Requester	\N	2025-07-01 11:49:01.23+08
116	24	1	nama_user	Nama User	Nama User Requester	f	\N	3	Enter nama user	Nama User Requester	\N	2025-07-01 11:49:01.23+08
117	24	1	jabatan	Jabatan	Jabatan User Requester	f	\N	4	Enter jabatan	Jabatan User Requester	\N	2025-07-01 11:49:01.231+08
118	24	5	mutasi_dari_cabang___capem	Mutasi dari Cabang / Capem	Cabang/Capem Sebelum	f	\N	5	Enter mutasi dari cabang / capem	Cabang/Capem Sebelum	\N	2025-07-01 11:49:01.232+08
119	24	1	mutasi_ke_kantor_kas	Mutasi ke Kantor Kas	Nama Kantor Kas	f	\N	6	Enter mutasi ke kantor kas	Nama Kantor Kas	\N	2025-07-01 11:49:01.236+08
\.


--
-- Data for Name: bsg_template_usage_logs; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_template_usage_logs (id, template_id, user_id, department_id, ticket_id, action_type, session_id, ip_address, user_agent, completion_time_ms, created_at) FROM stdin;
\.


--
-- Data for Name: bsg_templates; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_templates (id, category_id, name, display_name, description, template_number, is_active, popularity_score, usage_count, created_at, updated_at) FROM stdin;
1	2	OLIBS - Perubahan Menu & Limit Transaksi	OLIBS - Perubahan Menu & Limit Transaksi	Template for OLIBS - Perubahan Menu & Limit Transaksi requests	1	t	0	0	2025-07-01 11:49:00.965+08	2025-07-01 11:49:00.965+08
2	2	OLIBS - Mutasi User Pegawai	OLIBS - Mutasi User Pegawai	Template for OLIBS - Mutasi User Pegawai requests	2	t	0	0	2025-07-01 11:49:01.021+08	2025-07-01 11:49:01.021+08
3	2	OLIBS - Pendaftaran User Baru	OLIBS - Pendaftaran User Baru	Template for OLIBS - Pendaftaran User Baru requests	3	t	0	0	2025-07-01 11:49:01.065+08	2025-07-01 11:49:01.065+08
4	2	OLIBS - Non Aktif User	OLIBS - Non Aktif User	Template for OLIBS - Non Aktif User requests	4	t	0	0	2025-07-01 11:49:01.072+08	2025-07-01 11:49:01.072+08
5	2	OLIBS - Override Password	OLIBS - Override Password	Template for OLIBS - Override Password requests	5	t	0	0	2025-07-01 11:49:01.079+08	2025-07-01 11:49:01.079+08
6	3	KLAIM - BSGTouch – Transfer Antar Bank	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	6	t	0	0	2025-07-01 11:49:01.087+08	2025-07-01 11:49:01.087+08
7	3	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	7	t	0	0	2025-07-01 11:49:01.092+08	2025-07-01 11:49:01.092+08
8	1	XCARD - Buka Blokir dan Reset Password	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	8	t	0	0	2025-07-01 11:49:01.104+08	2025-07-01 11:49:01.104+08
9	1	XCARD - Pendaftaran User Baru	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	9	t	0	0	2025-07-01 11:49:01.111+08	2025-07-01 11:49:01.111+08
10	1	TellerApp/Reporting - Perubahan User	TellerApp/Reporting - Perubahan User	Template for TellerApp/Reporting - Perubahan User requests	10	t	0	0	2025-07-01 11:49:01.121+08	2025-07-01 11:49:01.121+08
11	1	TellerApp/Reporting - Pendaftaran User	TellerApp/Reporting - Pendaftaran User	Template for TellerApp/Reporting - Pendaftaran User requests	11	t	0	0	2025-07-01 11:49:01.129+08	2025-07-01 11:49:01.129+08
12	1	BSG QRIS - Pendaftaran User	BSG QRIS - Pendaftaran User	Template for BSG QRIS - Pendaftaran User requests	12	t	0	0	2025-07-01 11:49:01.135+08	2025-07-01 11:49:01.135+08
13	1	BSG QRIS - Perpanjang Masa Berlaku	BSG QRIS - Perpanjang Masa Berlaku	Template for BSG QRIS - Perpanjang Masa Berlaku requests	13	t	0	0	2025-07-01 11:49:01.141+08	2025-07-01 11:49:01.141+08
14	1	BSG QRIS - Buka Blokir & Reset Password	BSG QRIS - Buka Blokir & Reset Password	Template for BSG QRIS - Buka Blokir & Reset Password requests	14	t	0	0	2025-07-01 11:49:01.147+08	2025-07-01 11:49:01.147+08
15	1	Permintaan Perpanjangan operasional - Perpanjangan Waktu Operasional	Permintaan Perpanjangan operasional - Perpanjangan Waktu Operasional	Template for Permintaan Perpanjangan operasional - Perpanjangan Waktu Operasional requests	15	t	0	0	2025-07-01 11:49:01.154+08	2025-07-01 11:49:01.154+08
16	1	BSGTouch - Pendaftaran User	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	16	t	0	0	2025-07-01 11:49:01.161+08	2025-07-01 11:49:01.161+08
17	1	BSGTouch - Perubahan User	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	17	t	0	0	2025-07-01 11:49:01.168+08	2025-07-01 11:49:01.168+08
18	1	BSGTouch - Perpanjang Masa Berlaku	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	18	t	0	0	2025-07-01 11:49:01.175+08	2025-07-01 11:49:01.175+08
19	1	BSGTouch - Mutasi User	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	19	t	0	0	2025-07-01 11:49:01.181+08	2025-07-01 11:49:01.181+08
20	1	ATM - PERMASALAHAN TEKNIS	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	20	t	0	0	2025-07-01 11:49:01.195+08	2025-07-01 11:49:01.195+08
21	1	SMS BANKING - Pendaftaran User	SMS BANKING - Pendaftaran User	Template for SMS BANKING - Pendaftaran User requests	21	t	0	0	2025-07-01 11:49:01.203+08	2025-07-01 11:49:01.203+08
22	1	SMS BANKING - Perubahan User	SMS BANKING - Perubahan User	Template for SMS BANKING - Perubahan User requests	22	t	0	0	2025-07-01 11:49:01.21+08	2025-07-01 11:49:01.21+08
23	1	SMS BANKING - Perpanjang Masa Berlaku	SMS BANKING - Perpanjang Masa Berlaku	Template for SMS BANKING - Perpanjang Masa Berlaku requests	23	t	0	0	2025-07-01 11:49:01.218+08	2025-07-01 11:49:01.218+08
24	1	SMS BANKING - Mutasi User	SMS BANKING - Mutasi User	Template for SMS BANKING - Mutasi User requests	24	t	0	0	2025-07-01 11:49:01.224+08	2025-07-01 11:49:01.224+08
\.


--
-- Data for Name: bsg_ticket_field_values; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.bsg_ticket_field_values (id, ticket_id, field_id, field_value, master_data_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_approvals; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.business_approvals (id, ticket_id, business_reviewer_id, approval_status, business_comments, gov_docs_verified, authorization_letter_path, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_hours_config; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.business_hours_config (id, department_id, unit_id, day_of_week, start_time, end_time, is_active, timezone, created_at, updated_at) FROM stdin;
1	5	\N	1	09:00	17:00	t	Asia/Jakarta	2025-07-01 13:18:46.922+08	2025-07-01 13:18:46.922+08
2	5	\N	2	09:00	17:00	t	Asia/Jakarta	2025-07-01 13:18:46.922+08	2025-07-01 13:18:46.922+08
3	5	\N	3	09:00	17:00	t	Asia/Jakarta	2025-07-01 13:18:46.922+08	2025-07-01 13:18:46.922+08
4	5	\N	4	09:00	17:00	t	Asia/Jakarta	2025-07-01 13:18:46.922+08	2025-07-01 13:18:46.922+08
5	5	\N	5	09:00	17:00	t	Asia/Jakarta	2025-07-01 13:18:46.922+08	2025-07-01 13:18:46.922+08
6	5	\N	6	09:00	12:00	t	Asia/Jakarta	2025-07-01 13:18:46.922+08	2025-07-01 13:18:46.922+08
7	6	\N	1	08:00	18:00	t	Asia/Jakarta	2025-07-01 13:18:46.937+08	2025-07-01 13:18:46.937+08
8	6	\N	2	08:00	18:00	t	Asia/Jakarta	2025-07-01 13:18:46.937+08	2025-07-01 13:18:46.937+08
9	6	\N	3	08:00	18:00	t	Asia/Jakarta	2025-07-01 13:18:46.937+08	2025-07-01 13:18:46.937+08
10	6	\N	4	08:00	18:00	t	Asia/Jakarta	2025-07-01 13:18:46.937+08	2025-07-01 13:18:46.937+08
11	6	\N	5	08:00	18:00	t	Asia/Jakarta	2025-07-01 13:18:46.937+08	2025-07-01 13:18:46.937+08
12	6	\N	6	08:00	14:00	t	Asia/Jakarta	2025-07-01 13:18:46.937+08	2025-07-01 13:18:46.937+08
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.categories (id, name, department_id) FROM stdin;
8	Hardware	5
9	OLIBS	6
10	KASDA	6
\.


--
-- Data for Name: comment_notifications; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.comment_notifications (id, comment_id, recipient_id, notification_type, is_read, read_at, email_sent, email_sent_at, created_at) FROM stdin;
1	4	28	new_comment	f	\N	f	\N	2025-07-01 17:26:49.623+08
\.


--
-- Data for Name: custom_field_definitions; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.custom_field_definitions (id, template_id, field_name, field_label, field_type, options, is_required, placeholder, default_value) FROM stdin;
\.


--
-- Data for Name: department_sla_policies; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.department_sla_policies (id, department_id, service_type, business_hours_only, response_time_hours, resolution_time_hours, escalation_rules, is_active, created_at, updated_at) FROM stdin;
3	6	medium	t	8	48	\N	t	2025-07-01 11:40:17.88+08	2025-07-01 11:40:17.88+08
4	6	urgent	t	2	8	\N	t	2025-07-01 11:40:17.88+08	2025-07-01 11:40:17.88+08
1	5	urgent	t	1	4	\N	t	2025-07-01 11:40:17.88+08	2025-07-01 11:40:17.88+08
2	5	high	t	4	24	\N	t	2025-07-01 11:40:17.88+08	2025-07-01 11:40:17.88+08
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.departments (id, name, description, department_type, is_service_owner, created_at, updated_at) FROM stdin;
5	Information Technology	IT support and technical services	internal	t	2025-07-01 11:40:17.812+08	2025-07-01 11:40:17.812+08
6	Dukungan dan Layanan	Support and services for KASDA and BSGDirect users	business	t	2025-07-01 11:40:17.815+08	2025-07-01 11:40:17.815+08
\.


--
-- Data for Name: escalation_instances; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.escalation_instances (id, ticket_id, sla_policy_id, escalation_level, triggered_at, resolved_at, notified_users, escalation_data, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: field_type_definitions; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.field_type_definitions (id, name, display_name, display_name_id, category, description, validation_rules, formatting_rules, ui_config, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: government_entities; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.government_entities (id, entity_name, entity_type, entity_level, contact_person, contact_email, contact_phone, address, is_active, created_at, updated_at) FROM stdin;
2	Pemerintah Kota Manado	municipal	city	Kepala Dinas Keuangan	dinkeu@manadokota.go.id	0431-852000	Jl. Balai Kota, Manado	t	2025-07-01 11:40:17.867+08	2025-07-01 11:40:17.867+08
3	Pemerintah Provinsi Gorontalo	provincial	province	Sekretaris Daerah	setda@gorontaloprov.go.id	0435-881006	Jl. Nani Wartabone, Gorontalo	t	2025-07-01 11:40:17.867+08	2025-07-01 11:40:17.867+08
1	Pemerintah Provinsi Sulawesi Utara	provincial	province	Kepala Bagian Keuangan	keuangan@sulutprov.go.id	0431-863333	Jl. 17 Agustus No. 1, Manado	t	2025-07-01 11:40:17.867+08	2025-07-01 11:40:17.867+08
\.


--
-- Data for Name: holiday_calendar; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.holiday_calendar (id, name, date, description, is_recurring, recurrence_rule, department_id, unit_id, is_active, created_at, updated_at) FROM stdin;
1	Tahun Baru	2025-01-01	New Year's Day	t	FREQ=YEARLY	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
2	Hari Raya Idul Fitri	2025-03-31	Eid al-Fitr (estimated)	f	\N	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
3	Hari Raya Idul Fitri (Kedua)	2025-04-01	Second day of Eid al-Fitr	f	\N	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
4	Hari Buruh	2025-05-01	Labour Day	t	FREQ=YEARLY	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
5	Kenaikan Isa Almasih	2025-05-29	Ascension of Jesus Christ	f	\N	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
6	Hari Pancasila	2025-06-01	Pancasila Day	t	FREQ=YEARLY	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
7	Hari Raya Idul Adha	2025-06-07	Eid al-Adha (estimated)	f	\N	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
8	Tahun Baru Islam	2025-06-27	Islamic New Year (estimated)	f	\N	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
9	Hari Kemerdekaan	2025-08-17	Independence Day	t	FREQ=YEARLY	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
10	Maulid Nabi Muhammad	2025-09-05	Prophet Muhammad's Birthday (estimated)	f	\N	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
11	Hari Natal	2025-12-25	Christmas Day	t	FREQ=YEARLY	\N	\N	t	2025-07-01 13:18:46.94+08	2025-07-01 13:18:46.94+08
12	IT Department Training Day	2025-07-15	Annual IT department training and team building	t	FREQ=YEARLY	5	\N	t	2025-07-01 13:18:46.951+08	2025-07-01 13:18:46.951+08
13	Customer Service Excellence Day	2025-10-15	Support department excellence day	t	FREQ=YEARLY	6	\N	t	2025-07-01 13:18:46.951+08	2025-07-01 13:18:46.951+08
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.items (id, name, sub_category_id) FROM stdin;
1	Forgot Password	2
2	Cannot Login to KASDA	3
3	Computer Won't Start	1
\.


--
-- Data for Name: kasda_user_profiles; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.kasda_user_profiles (id, user_id, government_entity_id, position_title, authority_level, treasury_account_access, budget_codes, fiscal_year, government_id_number, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: master_data_entities; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.master_data_entities (id, type, code, name, name_indonesian, description, metadata, parent_id, department_id, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_catalog; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.service_catalog (id, name, description, service_type, category_level, parent_id, department_id, is_active, requires_approval, estimated_time, business_impact, created_at, updated_at) FROM stdin;
3	Government Banking Services	Services for government entities and KASDA users	business_service	1	\N	6	t	f	\N	medium	2025-07-01 11:40:17.869+08	2025-07-01 11:40:17.869+08
4	Information Technology Services	IT support and technical services	business_service	1	\N	5	t	f	\N	medium	2025-07-01 11:40:17.869+08	2025-07-01 11:40:17.869+08
5	Banking Support Services	KASDA and BSGDirect support services	business_service	1	\N	6	t	f	\N	medium	2025-07-01 11:40:17.869+08	2025-07-01 11:40:17.869+08
6	Core Banking & Financial Systems	Services for core financial platforms and specialized financial applications	business_service	1	\N	6	t	t	\N	medium	2025-07-01 11:47:58.589+08	2025-07-01 11:47:58.589+08
7	Digital Channels & Customer Applications	Services for all customer-facing digital applications	business_service	1	\N	6	t	t	\N	medium	2025-07-01 11:47:58.638+08	2025-07-01 11:47:58.638+08
8	ATM, EDC & Branch Hardware	Services related to physical endpoints and hardware in branches and at customer locations	technical_service	1	\N	5	t	f	\N	medium	2025-07-01 11:47:58.655+08	2025-07-01 11:47:58.655+08
9	Corporate IT & Employee Support	Internal IT services that support employees and corporate functions	technical_service	1	\N	5	t	f	\N	medium	2025-07-01 11:47:58.67+08	2025-07-01 11:47:58.67+08
10	Claims & Disputes	A dedicated category for all transaction-related claims, disputes, and reconciliations	business_service	1	\N	6	t	t	\N	medium	2025-07-01 11:47:58.725+08	2025-07-01 11:47:58.725+08
11	General & Default Services	Catch-all services for requests that do not fit into other categories	technical_service	1	\N	5	t	f	\N	medium	2025-07-01 11:47:58.761+08	2025-07-01 11:47:58.761+08
12	Error Resolution & Technical Support	Technical error resolution and application support services	technical_service	1	\N	5	t	f	\N	medium	2025-07-02 16:03:48.47+08	2025-07-02 16:03:48.47+08
13	User Management & Account Services	User account management and access control services	business_service	1	\N	6	t	t	\N	medium	2025-07-02 16:03:48.476+08	2025-07-02 16:03:48.476+08
\.


--
-- Data for Name: service_field_definitions; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.service_field_definitions (id, service_template_id, service_item_id, field_name, field_label, field_type, options, is_required, is_kasda_specific, placeholder, default_value, validation_rules, sort_order, is_visible, created_at, updated_at) FROM stdin;
65	\N	18	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.767+08	2025-07-01 11:51:00.769+08
27	\N	7	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.709+08	2025-07-01 11:51:00.712+08
23	\N	9	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.692+08	2025-07-01 11:51:00.702+08
24	\N	9	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.703+08	2025-07-01 11:51:00.703+08
28	\N	7	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.712+08	2025-07-01 11:51:00.712+08
66	\N	18	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.77+08	2025-07-01 11:51:00.77+08
25	\N	5	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.704+08	2025-07-01 11:51:00.707+08
26	\N	5	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.708+08	2025-07-01 11:51:00.708+08
41	\N	12	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.735+08	2025-07-01 11:51:00.737+08
42	\N	12	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.738+08	2025-07-01 11:51:00.738+08
43	\N	12	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.739+08	2025-07-01 11:51:00.739+08
29	\N	4	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.713+08	2025-07-01 11:51:00.716+08
30	\N	4	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.716+08	2025-07-01 11:51:00.716+08
44	\N	12	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.739+08	2025-07-01 11:51:00.739+08
53	\N	15	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.75+08	2025-07-01 11:51:00.753+08
31	\N	8	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.717+08	2025-07-01 11:51:00.72+08
32	\N	8	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.72+08	2025-07-01 11:51:00.72+08
54	\N	15	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.754+08	2025-07-01 11:51:00.754+08
55	\N	15	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.754+08	2025-07-01 11:51:00.754+08
45	\N	13	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.74+08	2025-07-01 11:51:00.743+08
33	\N	6	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.721+08	2025-07-01 11:51:00.724+08
34	\N	6	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.725+08	2025-07-01 11:51:00.725+08
46	\N	13	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.743+08	2025-07-01 11:51:00.743+08
47	\N	13	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.744+08	2025-07-01 11:51:00.744+08
48	\N	13	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.745+08	2025-07-01 11:51:00.745+08
35	\N	10	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.725+08	2025-07-01 11:51:00.728+08
36	\N	10	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.729+08	2025-07-01 11:51:00.729+08
37	\N	10	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.73+08	2025-07-01 11:51:00.73+08
38	\N	10	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.73+08	2025-07-01 11:51:00.73+08
56	\N	15	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.755+08	2025-07-01 11:51:00.755+08
39	\N	11	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.731+08	2025-07-01 11:51:00.734+08
40	\N	11	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.734+08	2025-07-01 11:51:00.734+08
61	\N	17	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.761+08	2025-07-01 11:51:00.764+08
49	\N	14	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.745+08	2025-07-01 11:51:00.748+08
50	\N	14	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.748+08	2025-07-01 11:51:00.748+08
51	\N	14	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.749+08	2025-07-01 11:51:00.749+08
52	\N	14	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.75+08	2025-07-01 11:51:00.75+08
62	\N	17	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.765+08	2025-07-01 11:51:00.765+08
63	\N	17	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.765+08	2025-07-01 11:51:00.765+08
57	\N	16	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.756+08	2025-07-01 11:51:00.759+08
58	\N	16	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.759+08	2025-07-01 11:51:00.759+08
59	\N	16	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.76+08	2025-07-01 11:51:00.76+08
60	\N	16	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.76+08	2025-07-01 11:51:00.76+08
64	\N	17	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.766+08	2025-07-01 11:51:00.766+08
67	\N	18	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.771+08	2025-07-01 11:51:00.771+08
68	\N	18	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.771+08	2025-07-01 11:51:00.771+08
69	\N	19	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.772+08	2025-07-01 11:51:00.775+08
70	\N	19	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.775+08	2025-07-01 11:51:00.775+08
89	\N	30	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.8+08	2025-07-01 11:51:00.803+08
90	\N	30	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.803+08	2025-07-01 11:51:00.803+08
91	\N	30	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.804+08	2025-07-01 11:51:00.804+08
71	\N	25	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.777+08	2025-07-01 11:51:00.781+08
72	\N	25	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.781+08	2025-07-01 11:51:00.781+08
92	\N	30	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.805+08	2025-07-01 11:51:00.805+08
73	\N	26	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.782+08	2025-07-01 11:51:00.784+08
74	\N	26	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.784+08	2025-07-01 11:51:00.784+08
75	\N	26	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.785+08	2025-07-01 11:51:00.785+08
76	\N	26	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.785+08	2025-07-01 11:51:00.785+08
117	\N	38	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.84+08	2025-07-01 11:51:00.843+08
113	\N	37	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.835+08	2025-07-01 11:51:00.837+08
93	\N	31	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.805+08	2025-07-01 11:51:00.808+08
77	\N	27	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.786+08	2025-07-01 11:51:00.787+08
78	\N	27	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.788+08	2025-07-01 11:51:00.788+08
79	\N	27	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.788+08	2025-07-01 11:51:00.788+08
80	\N	27	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.789+08	2025-07-01 11:51:00.789+08
94	\N	31	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.809+08	2025-07-01 11:51:00.809+08
95	\N	31	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.809+08	2025-07-01 11:51:00.809+08
96	\N	31	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.81+08	2025-07-01 11:51:00.81+08
81	\N	28	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.789+08	2025-07-01 11:51:00.792+08
82	\N	28	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.793+08	2025-07-01 11:51:00.793+08
83	\N	28	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.793+08	2025-07-01 11:51:00.793+08
84	\N	28	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.794+08	2025-07-01 11:51:00.794+08
103	\N	34	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.819+08	2025-07-01 11:51:00.822+08
104	\N	34	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.823+08	2025-07-01 11:51:00.823+08
85	\N	29	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.795+08	2025-07-01 11:51:00.797+08
86	\N	29	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.798+08	2025-07-01 11:51:00.798+08
87	\N	29	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.799+08	2025-07-01 11:51:00.799+08
88	\N	29	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.799+08	2025-07-01 11:51:00.799+08
97	\N	32	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.811+08	2025-07-01 11:51:00.813+08
109	\N	36	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.829+08	2025-07-01 11:51:00.832+08
98	\N	32	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.814+08	2025-07-01 11:51:00.814+08
99	\N	32	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.814+08	2025-07-01 11:51:00.814+08
100	\N	32	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.815+08	2025-07-01 11:51:00.815+08
110	\N	36	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.833+08	2025-07-01 11:51:00.833+08
111	\N	36	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.833+08	2025-07-01 11:51:00.833+08
105	\N	35	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.824+08	2025-07-01 11:51:00.827+08
101	\N	33	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.816+08	2025-07-01 11:51:00.819+08
102	\N	33	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.819+08	2025-07-01 11:51:00.819+08
106	\N	35	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.827+08	2025-07-01 11:51:00.827+08
107	\N	35	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.828+08	2025-07-01 11:51:00.828+08
108	\N	35	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.829+08	2025-07-01 11:51:00.829+08
112	\N	36	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.834+08	2025-07-01 11:51:00.834+08
114	\N	37	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.838+08	2025-07-01 11:51:00.838+08
115	\N	37	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.839+08	2025-07-01 11:51:00.839+08
116	\N	37	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.839+08	2025-07-01 11:51:00.839+08
118	\N	38	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.843+08	2025-07-01 11:51:00.843+08
119	\N	38	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.844+08	2025-07-01 11:51:00.844+08
120	\N	38	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.845+08	2025-07-01 11:51:00.845+08
139	\N	44	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.872+08	2025-07-01 11:51:00.874+08
140	\N	44	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.875+08	2025-07-01 11:51:00.875+08
141	\N	44	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.876+08	2025-07-01 11:51:00.876+08
121	\N	39	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.846+08	2025-07-01 11:51:00.848+08
122	\N	39	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.849+08	2025-07-01 11:51:00.849+08
142	\N	44	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.877+08	2025-07-01 11:51:00.877+08
157	\N	49	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.899+08	2025-07-01 11:51:00.902+08
123	\N	40	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.85+08	2025-07-01 11:51:00.852+08
124	\N	40	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.853+08	2025-07-01 11:51:00.853+08
125	\N	40	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.854+08	2025-07-01 11:51:00.854+08
126	\N	40	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.854+08	2025-07-01 11:51:00.854+08
158	\N	49	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.903+08	2025-07-01 11:51:00.903+08
159	\N	49	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.903+08	2025-07-01 11:51:00.903+08
143	\N	45	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.877+08	2025-07-01 11:51:00.88+08
127	\N	41	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.855+08	2025-07-01 11:51:00.858+08
128	\N	41	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.858+08	2025-07-01 11:51:00.858+08
129	\N	41	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.859+08	2025-07-01 11:51:00.859+08
130	\N	41	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.86+08	2025-07-01 11:51:00.86+08
144	\N	45	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.881+08	2025-07-01 11:51:00.881+08
145	\N	45	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.881+08	2025-07-01 11:51:00.881+08
146	\N	45	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.882+08	2025-07-01 11:51:00.882+08
131	\N	42	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.86+08	2025-07-01 11:51:00.863+08
132	\N	42	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.864+08	2025-07-01 11:51:00.864+08
133	\N	42	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.865+08	2025-07-01 11:51:00.865+08
134	\N	42	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.865+08	2025-07-01 11:51:00.865+08
153	\N	48	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.893+08	2025-07-01 11:51:00.896+08
154	\N	48	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.896+08	2025-07-01 11:51:00.896+08
135	\N	43	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.866+08	2025-07-01 11:51:00.869+08
136	\N	43	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.87+08	2025-07-01 11:51:00.87+08
137	\N	43	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.87+08	2025-07-01 11:51:00.87+08
138	\N	43	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.871+08	2025-07-01 11:51:00.871+08
155	\N	48	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.897+08	2025-07-01 11:51:00.897+08
147	\N	46	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.883+08	2025-07-01 11:51:00.886+08
156	\N	48	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.898+08	2025-07-01 11:51:00.898+08
148	\N	46	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.887+08	2025-07-01 11:51:00.887+08
160	\N	49	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.904+08	2025-07-01 11:51:00.904+08
149	\N	47	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.887+08	2025-07-01 11:51:00.89+08
150	\N	47	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.891+08	2025-07-01 11:51:00.891+08
151	\N	47	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.892+08	2025-07-01 11:51:00.892+08
152	\N	47	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.892+08	2025-07-01 11:51:00.892+08
161	\N	50	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.905+08	2025-07-01 11:51:00.908+08
165	\N	51	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.91+08	2025-07-01 11:51:00.913+08
162	\N	50	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.908+08	2025-07-01 11:51:00.908+08
163	\N	50	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.909+08	2025-07-01 11:51:00.909+08
164	\N	50	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.91+08	2025-07-01 11:51:00.91+08
166	\N	51	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.914+08	2025-07-01 11:51:00.914+08
167	\N	51	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.915+08	2025-07-01 11:51:00.915+08
168	\N	51	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.915+08	2025-07-01 11:51:00.915+08
207	\N	62	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.972+08	2025-07-01 11:51:00.976+08
208	\N	62	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.977+08	2025-07-01 11:51:00.977+08
169	\N	52	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.916+08	2025-07-01 11:51:00.919+08
170	\N	52	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.919+08	2025-07-01 11:51:00.919+08
171	\N	52	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.92+08	2025-07-01 11:51:00.92+08
172	\N	52	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.921+08	2025-07-01 11:51:00.921+08
191	\N	58	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.949+08	2025-07-01 11:51:00.951+08
192	\N	58	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.952+08	2025-07-01 11:51:00.952+08
193	\N	58	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.953+08	2025-07-01 11:51:00.953+08
173	\N	53	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.922+08	2025-07-01 11:51:00.924+08
174	\N	53	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.925+08	2025-07-01 11:51:00.925+08
175	\N	53	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.926+08	2025-07-01 11:51:00.926+08
176	\N	53	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.927+08	2025-07-01 11:51:00.927+08
194	\N	58	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.954+08	2025-07-01 11:51:00.954+08
203	\N	61	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.965+08	2025-07-01 11:51:00.968+08
177	\N	54	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.927+08	2025-07-01 11:51:00.93+08
178	\N	54	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.931+08	2025-07-01 11:51:00.931+08
204	\N	61	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.969+08	2025-07-01 11:51:00.969+08
205	\N	61	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.969+08	2025-07-01 11:51:00.969+08
195	\N	59	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.954+08	2025-07-01 11:51:00.957+08
179	\N	55	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.932+08	2025-07-01 11:51:00.934+08
180	\N	55	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.935+08	2025-07-01 11:51:00.935+08
181	\N	55	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.936+08	2025-07-01 11:51:00.936+08
182	\N	55	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.937+08	2025-07-01 11:51:00.937+08
196	\N	59	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.958+08	2025-07-01 11:51:00.958+08
197	\N	59	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.958+08	2025-07-01 11:51:00.958+08
198	\N	59	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.959+08	2025-07-01 11:51:00.959+08
183	\N	56	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.937+08	2025-07-01 11:51:00.94+08
184	\N	56	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.941+08	2025-07-01 11:51:00.941+08
185	\N	56	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.942+08	2025-07-01 11:51:00.942+08
186	\N	56	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.942+08	2025-07-01 11:51:00.942+08
206	\N	61	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.97+08	2025-07-01 11:51:00.97+08
187	\N	57	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.943+08	2025-07-01 11:51:00.946+08
188	\N	57	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.947+08	2025-07-01 11:51:00.947+08
189	\N	57	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.947+08	2025-07-01 11:51:00.947+08
190	\N	57	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.948+08	2025-07-01 11:51:00.948+08
199	\N	60	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.959+08	2025-07-01 11:51:00.962+08
200	\N	60	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.963+08	2025-07-01 11:51:00.963+08
201	\N	60	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.964+08	2025-07-01 11:51:00.964+08
202	\N	60	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.964+08	2025-07-01 11:51:00.964+08
213	\N	64	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.983+08	2025-07-01 11:51:00.985+08
214	\N	64	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.986+08	2025-07-01 11:51:00.986+08
215	\N	64	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.986+08	2025-07-01 11:51:00.986+08
209	\N	63	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.977+08	2025-07-01 11:51:00.98+08
210	\N	63	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.981+08	2025-07-01 11:51:00.981+08
211	\N	63	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:00.981+08	2025-07-01 11:51:00.981+08
212	\N	63	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.982+08	2025-07-01 11:51:00.982+08
216	\N	64	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:00.987+08	2025-07-01 11:51:00.987+08
217	\N	65	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.988+08	2025-07-01 11:51:00.99+08
218	\N	65	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.991+08	2025-07-01 11:51:00.991+08
219	\N	65	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:00.991+08	2025-07-01 11:51:00.991+08
220	\N	65	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:00.992+08	2025-07-01 11:51:00.992+08
237	\N	83	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.015+08	2025-07-01 11:51:01.018+08
238	\N	83	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.018+08	2025-07-01 11:51:01.018+08
239	\N	83	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.019+08	2025-07-01 11:51:01.019+08
221	\N	66	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.993+08	2025-07-01 11:51:00.995+08
222	\N	66	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.995+08	2025-07-01 11:51:00.995+08
240	\N	83	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.02+08	2025-07-01 11:51:01.02+08
255	\N	108	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.039+08	2025-07-01 11:51:01.042+08
223	\N	67	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:00.996+08	2025-07-01 11:51:00.999+08
224	\N	67	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:00.999+08	2025-07-01 11:51:00.999+08
256	\N	108	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.042+08	2025-07-01 11:51:01.042+08
241	\N	87	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.021+08	2025-07-01 11:51:01.023+08
225	\N	80	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01+08	2025-07-01 11:51:01.002+08
226	\N	80	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.003+08	2025-07-01 11:51:01.003+08
227	\N	80	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.004+08	2025-07-01 11:51:01.004+08
228	\N	80	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.004+08	2025-07-01 11:51:01.004+08
242	\N	87	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.024+08	2025-07-01 11:51:01.024+08
251	\N	93	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.035+08	2025-07-01 11:51:01.036+08
229	\N	81	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.005+08	2025-07-01 11:51:01.008+08
230	\N	81	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.008+08	2025-07-01 11:51:01.008+08
231	\N	81	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.009+08	2025-07-01 11:51:01.009+08
232	\N	81	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.01+08	2025-07-01 11:51:01.01+08
252	\N	93	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.037+08	2025-07-01 11:51:01.037+08
253	\N	93	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.038+08	2025-07-01 11:51:01.038+08
243	\N	89	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.024+08	2025-07-01 11:51:01.027+08
233	\N	82	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.01+08	2025-07-01 11:51:01.013+08
234	\N	82	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.013+08	2025-07-01 11:51:01.013+08
235	\N	82	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.014+08	2025-07-01 11:51:01.014+08
236	\N	82	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.015+08	2025-07-01 11:51:01.015+08
244	\N	89	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.027+08	2025-07-01 11:51:01.027+08
245	\N	89	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.028+08	2025-07-01 11:51:01.028+08
254	\N	93	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.038+08	2025-07-01 11:51:01.038+08
246	\N	89	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.029+08	2025-07-01 11:51:01.029+08
259	\N	110	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.047+08	2025-07-01 11:51:01.05+08
260	\N	110	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.05+08	2025-07-01 11:51:01.05+08
247	\N	90	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.029+08	2025-07-01 11:51:01.032+08
248	\N	90	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.033+08	2025-07-01 11:51:01.033+08
249	\N	90	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.033+08	2025-07-01 11:51:01.033+08
250	\N	90	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.034+08	2025-07-01 11:51:01.034+08
261	\N	110	transaction_amount	Transaction Amount	text	\N	t	f	Enter transaction amount	\N	{"required": true}	3	t	2025-07-01 11:51:01.051+08	2025-07-01 11:51:01.051+08
257	\N	109	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.043+08	2025-07-01 11:51:01.046+08
258	\N	109	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.046+08	2025-07-01 11:51:01.046+08
262	\N	110	transaction_date	Transaction Date	text	\N	t	f	Enter transaction date	\N	{"required": true}	4	t	2025-07-01 11:51:01.052+08	2025-07-01 11:51:01.052+08
263	\N	110	reference_number	Reference Number	text	\N	f	f	Enter reference number	\N	{}	5	t	2025-07-01 11:51:01.052+08	2025-07-01 11:51:01.052+08
264	\N	111	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.053+08	2025-07-01 11:51:01.056+08
265	\N	111	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.057+08	2025-07-01 11:51:01.057+08
266	\N	111	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.057+08	2025-07-01 11:51:01.057+08
267	\N	111	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.058+08	2025-07-01 11:51:01.058+08
312	\N	125	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.122+08	2025-07-01 11:51:01.124+08
298	\N	121	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.103+08	2025-07-01 11:51:01.105+08
268	\N	112	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.059+08	2025-07-01 11:51:01.061+08
269	\N	112	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.062+08	2025-07-01 11:51:01.062+08
286	\N	118	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.087+08	2025-07-01 11:51:01.09+08
287	\N	118	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.09+08	2025-07-01 11:51:01.09+08
288	\N	118	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.091+08	2025-07-01 11:51:01.091+08
270	\N	113	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.063+08	2025-07-01 11:51:01.065+08
271	\N	113	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.066+08	2025-07-01 11:51:01.066+08
272	\N	113	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.066+08	2025-07-01 11:51:01.066+08
273	\N	113	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.067+08	2025-07-01 11:51:01.067+08
289	\N	118	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.092+08	2025-07-01 11:51:01.092+08
299	\N	121	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.106+08	2025-07-01 11:51:01.106+08
274	\N	114	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.068+08	2025-07-01 11:51:01.07+08
275	\N	114	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.071+08	2025-07-01 11:51:01.071+08
313	\N	125	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.125+08	2025-07-01 11:51:01.125+08
290	\N	119	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.092+08	2025-07-01 11:51:01.095+08
276	\N	115	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.072+08	2025-07-01 11:51:01.074+08
277	\N	115	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.075+08	2025-07-01 11:51:01.075+08
278	\N	115	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.076+08	2025-07-01 11:51:01.076+08
279	\N	115	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.076+08	2025-07-01 11:51:01.076+08
291	\N	119	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.096+08	2025-07-01 11:51:01.096+08
292	\N	119	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.096+08	2025-07-01 11:51:01.096+08
293	\N	119	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.097+08	2025-07-01 11:51:01.097+08
280	\N	116	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.077+08	2025-07-01 11:51:01.08+08
281	\N	116	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.081+08	2025-07-01 11:51:01.081+08
282	\N	116	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.081+08	2025-07-01 11:51:01.081+08
283	\N	116	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.082+08	2025-07-01 11:51:01.082+08
304	\N	123	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.112+08	2025-07-01 11:51:01.114+08
305	\N	123	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.115+08	2025-07-01 11:51:01.115+08
284	\N	117	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.083+08	2025-07-01 11:51:01.085+08
285	\N	117	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.086+08	2025-07-01 11:51:01.086+08
300	\N	122	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.106+08	2025-07-01 11:51:01.109+08
294	\N	120	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.098+08	2025-07-01 11:51:01.1+08
295	\N	120	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.101+08	2025-07-01 11:51:01.101+08
296	\N	120	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.101+08	2025-07-01 11:51:01.101+08
297	\N	120	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.102+08	2025-07-01 11:51:01.102+08
306	\N	123	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.115+08	2025-07-01 11:51:01.115+08
301	\N	122	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.11+08	2025-07-01 11:51:01.11+08
302	\N	122	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.111+08	2025-07-01 11:51:01.111+08
303	\N	122	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.111+08	2025-07-01 11:51:01.111+08
307	\N	123	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.116+08	2025-07-01 11:51:01.116+08
308	\N	124	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.117+08	2025-07-01 11:51:01.119+08
309	\N	124	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.12+08	2025-07-01 11:51:01.12+08
310	\N	124	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.12+08	2025-07-01 11:51:01.12+08
311	\N	124	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.121+08	2025-07-01 11:51:01.121+08
314	\N	125	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.126+08	2025-07-01 11:51:01.126+08
315	\N	125	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.126+08	2025-07-01 11:51:01.126+08
360	\N	138	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.188+08	2025-07-01 11:51:01.19+08
361	\N	138	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.191+08	2025-07-01 11:51:01.191+08
316	\N	126	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.127+08	2025-07-01 11:51:01.13+08
317	\N	126	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.13+08	2025-07-01 11:51:01.13+08
318	\N	126	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.131+08	2025-07-01 11:51:01.131+08
319	\N	126	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.132+08	2025-07-01 11:51:01.132+08
338	\N	132	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.157+08	2025-07-01 11:51:01.16+08
339	\N	132	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.16+08	2025-07-01 11:51:01.16+08
320	\N	127	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.132+08	2025-07-01 11:51:01.135+08
321	\N	127	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.135+08	2025-07-01 11:51:01.135+08
322	\N	127	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.136+08	2025-07-01 11:51:01.136+08
323	\N	127	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.137+08	2025-07-01 11:51:01.137+08
348	\N	135	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.172+08	2025-07-01 11:51:01.174+08
349	\N	135	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.175+08	2025-07-01 11:51:01.175+08
350	\N	135	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.176+08	2025-07-01 11:51:01.176+08
324	\N	128	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.137+08	2025-07-01 11:51:01.14+08
325	\N	128	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.141+08	2025-07-01 11:51:01.141+08
326	\N	128	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.141+08	2025-07-01 11:51:01.141+08
327	\N	128	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.142+08	2025-07-01 11:51:01.142+08
340	\N	133	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.161+08	2025-07-01 11:51:01.163+08
341	\N	133	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.164+08	2025-07-01 11:51:01.164+08
342	\N	133	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.165+08	2025-07-01 11:51:01.165+08
328	\N	129	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.143+08	2025-07-01 11:51:01.145+08
329	\N	129	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.146+08	2025-07-01 11:51:01.146+08
343	\N	133	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.166+08	2025-07-01 11:51:01.166+08
351	\N	135	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.176+08	2025-07-01 11:51:01.176+08
330	\N	130	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.147+08	2025-07-01 11:51:01.149+08
331	\N	130	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.15+08	2025-07-01 11:51:01.15+08
332	\N	130	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.151+08	2025-07-01 11:51:01.151+08
333	\N	130	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.151+08	2025-07-01 11:51:01.151+08
356	\N	137	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.182+08	2025-07-01 11:51:01.185+08
344	\N	134	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.166+08	2025-07-01 11:51:01.169+08
334	\N	131	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.152+08	2025-07-01 11:51:01.154+08
335	\N	131	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.155+08	2025-07-01 11:51:01.155+08
336	\N	131	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.156+08	2025-07-01 11:51:01.156+08
337	\N	131	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.156+08	2025-07-01 11:51:01.156+08
345	\N	134	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.169+08	2025-07-01 11:51:01.169+08
346	\N	134	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.17+08	2025-07-01 11:51:01.17+08
347	\N	134	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.171+08	2025-07-01 11:51:01.171+08
357	\N	137	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.186+08	2025-07-01 11:51:01.186+08
358	\N	137	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.187+08	2025-07-01 11:51:01.187+08
352	\N	136	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.177+08	2025-07-01 11:51:01.18+08
353	\N	136	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.18+08	2025-07-01 11:51:01.18+08
354	\N	136	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.181+08	2025-07-01 11:51:01.181+08
355	\N	136	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.182+08	2025-07-01 11:51:01.182+08
359	\N	137	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.187+08	2025-07-01 11:51:01.187+08
362	\N	138	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.192+08	2025-07-01 11:51:01.192+08
363	\N	138	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.193+08	2025-07-01 11:51:01.193+08
364	\N	139	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.193+08	2025-07-01 11:51:01.196+08
365	\N	139	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.196+08	2025-07-01 11:51:01.196+08
384	\N	145	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.221+08	2025-07-01 11:51:01.224+08
385	\N	145	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.225+08	2025-07-01 11:51:01.225+08
386	\N	145	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.225+08	2025-07-01 11:51:01.225+08
366	\N	140	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.197+08	2025-07-01 11:51:01.199+08
367	\N	140	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.2+08	2025-07-01 11:51:01.2+08
368	\N	140	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.201+08	2025-07-01 11:51:01.201+08
369	\N	140	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.201+08	2025-07-01 11:51:01.201+08
387	\N	145	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.226+08	2025-07-01 11:51:01.226+08
370	\N	141	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.202+08	2025-07-01 11:51:01.204+08
371	\N	141	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.205+08	2025-07-01 11:51:01.205+08
372	\N	141	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.206+08	2025-07-01 11:51:01.206+08
373	\N	141	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.206+08	2025-07-01 11:51:01.206+08
412	\N	153	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.262+08	2025-07-01 11:51:01.265+08
408	\N	152	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.256+08	2025-07-01 11:51:01.259+08
388	\N	146	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.227+08	2025-07-01 11:51:01.229+08
374	\N	142	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.207+08	2025-07-01 11:51:01.209+08
375	\N	142	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.21+08	2025-07-01 11:51:01.21+08
376	\N	142	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.21+08	2025-07-01 11:51:01.21+08
377	\N	142	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.211+08	2025-07-01 11:51:01.211+08
389	\N	146	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.23+08	2025-07-01 11:51:01.23+08
396	\N	149	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.239+08	2025-07-01 11:51:01.242+08
378	\N	143	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.212+08	2025-07-01 11:51:01.214+08
379	\N	143	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.215+08	2025-07-01 11:51:01.215+08
380	\N	143	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.216+08	2025-07-01 11:51:01.216+08
381	\N	143	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.216+08	2025-07-01 11:51:01.216+08
397	\N	149	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.242+08	2025-07-01 11:51:01.242+08
398	\N	149	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.243+08	2025-07-01 11:51:01.243+08
390	\N	147	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.23+08	2025-07-01 11:51:01.233+08
382	\N	144	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.217+08	2025-07-01 11:51:01.22+08
383	\N	144	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.22+08	2025-07-01 11:51:01.22+08
391	\N	147	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.234+08	2025-07-01 11:51:01.234+08
392	\N	147	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.234+08	2025-07-01 11:51:01.234+08
399	\N	149	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.244+08	2025-07-01 11:51:01.244+08
393	\N	147	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.235+08	2025-07-01 11:51:01.235+08
404	\N	151	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.251+08	2025-07-01 11:51:01.254+08
405	\N	151	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.254+08	2025-07-01 11:51:01.254+08
394	\N	148	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.236+08	2025-07-01 11:51:01.238+08
395	\N	148	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.239+08	2025-07-01 11:51:01.239+08
406	\N	151	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.255+08	2025-07-01 11:51:01.255+08
400	\N	150	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.244+08	2025-07-01 11:51:01.248+08
401	\N	150	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.249+08	2025-07-01 11:51:01.249+08
402	\N	150	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.25+08	2025-07-01 11:51:01.25+08
403	\N	150	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.251+08	2025-07-01 11:51:01.251+08
407	\N	151	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.256+08	2025-07-01 11:51:01.256+08
409	\N	152	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.26+08	2025-07-01 11:51:01.26+08
410	\N	152	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.261+08	2025-07-01 11:51:01.261+08
411	\N	152	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.261+08	2025-07-01 11:51:01.261+08
413	\N	153	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.266+08	2025-07-01 11:51:01.266+08
458	\N	179	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.329+08	2025-07-01 11:51:01.332+08
456	\N	178	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.326+08	2025-07-01 11:51:01.328+08
414	\N	154	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.266+08	2025-07-01 11:51:01.269+08
415	\N	154	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.27+08	2025-07-01 11:51:01.27+08
416	\N	154	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.27+08	2025-07-01 11:51:01.27+08
417	\N	154	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.271+08	2025-07-01 11:51:01.271+08
436	\N	171	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.295+08	2025-07-01 11:51:01.297+08
437	\N	171	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.298+08	2025-07-01 11:51:01.298+08
438	\N	171	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.299+08	2025-07-01 11:51:01.299+08
418	\N	155	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.272+08	2025-07-01 11:51:01.273+08
419	\N	155	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.274+08	2025-07-01 11:51:01.274+08
420	\N	155	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.275+08	2025-07-01 11:51:01.275+08
421	\N	155	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.275+08	2025-07-01 11:51:01.275+08
439	\N	171	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.299+08	2025-07-01 11:51:01.299+08
448	\N	174	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.31+08	2025-07-01 11:51:01.313+08
422	\N	156	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.276+08	2025-07-01 11:51:01.278+08
423	\N	156	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.279+08	2025-07-01 11:51:01.279+08
424	\N	156	user_name	User Name	text	\N	t	f	Enter user name	\N	{"required": true}	3	t	2025-07-01 11:51:01.28+08	2025-07-01 11:51:01.28+08
425	\N	156	position	Position/Role	text	\N	t	f	Enter position/role	\N	{"required": true}	4	t	2025-07-01 11:51:01.281+08	2025-07-01 11:51:01.281+08
449	\N	174	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.314+08	2025-07-01 11:51:01.314+08
440	\N	172	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.3+08	2025-07-01 11:51:01.302+08
426	\N	157	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.281+08	2025-07-01 11:51:01.284+08
427	\N	157	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.284+08	2025-07-01 11:51:01.284+08
441	\N	172	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.303+08	2025-07-01 11:51:01.303+08
442	\N	172	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.304+08	2025-07-01 11:51:01.304+08
443	\N	172	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.304+08	2025-07-01 11:51:01.304+08
428	\N	164	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.284+08	2025-07-01 11:51:01.287+08
429	\N	164	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.287+08	2025-07-01 11:51:01.287+08
430	\N	164	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.288+08	2025-07-01 11:51:01.288+08
431	\N	164	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.289+08	2025-07-01 11:51:01.289+08
452	\N	176	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.318+08	2025-07-01 11:51:01.321+08
453	\N	176	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.321+08	2025-07-01 11:51:01.321+08
432	\N	170	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.289+08	2025-07-01 11:51:01.292+08
433	\N	170	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.292+08	2025-07-01 11:51:01.292+08
434	\N	170	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.293+08	2025-07-01 11:51:01.293+08
435	\N	170	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.294+08	2025-07-01 11:51:01.294+08
444	\N	173	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.305+08	2025-07-01 11:51:01.308+08
445	\N	173	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.308+08	2025-07-01 11:51:01.308+08
446	\N	173	error_message	Error Message	text	\N	f	f	Enter error message	\N	{}	3	t	2025-07-01 11:51:01.309+08	2025-07-01 11:51:01.309+08
447	\N	173	steps_to_reproduce	Steps to Reproduce	textarea	\N	f	f	Enter steps to reproduce	\N	{}	4	t	2025-07-01 11:51:01.309+08	2025-07-01 11:51:01.309+08
450	\N	175	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.314+08	2025-07-01 11:51:01.317+08
451	\N	175	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.317+08	2025-07-01 11:51:01.317+08
454	\N	177	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.322+08	2025-07-01 11:51:01.324+08
455	\N	177	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.325+08	2025-07-01 11:51:01.325+08
457	\N	178	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.329+08	2025-07-01 11:51:01.329+08
459	\N	179	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.333+08	2025-07-01 11:51:01.333+08
460	\N	180	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.333+08	2025-07-01 11:51:01.336+08
461	\N	180	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.337+08	2025-07-01 11:51:01.337+08
462	\N	181	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.337+08	2025-07-01 11:51:01.34+08
463	\N	181	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.34+08	2025-07-01 11:51:01.34+08
476	\N	248	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.364+08	2025-07-01 11:51:01.366+08
477	\N	248	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.367+08	2025-07-01 11:51:01.367+08
478	\N	20	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 12:02:21.974+08	2025-07-01 12:02:21.974+08
464	\N	182	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.341+08	2025-07-01 11:51:01.343+08
465	\N	182	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.344+08	2025-07-01 11:51:01.344+08
479	\N	20	description	Issue Description	textarea	\N	t	f	Enter issue description	\N	{"options": [], "required": true}	2	t	2025-07-01 12:02:21.976+08	2025-07-01 12:02:21.976+08
480	\N	20	branch_office	Branch/CAPEM	dropdown	\N	t	f	Enter branch/capem	\N	{"options": ["Kantor Cabang Utama", "Kantor Cabang Jakarta", "Kantor Cabang Gorontalo"], "required": true}	3	t	2025-07-01 12:02:21.977+08	2025-07-01 12:02:21.977+08
481	\N	20	user_code	User Code	text	\N	t	f	Enter user code	\N	{"options": [], "required": true}	4	t	2025-07-01 12:02:21.978+08	2025-07-01 12:02:21.978+08
466	\N	183	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.345+08	2025-07-01 11:51:01.347+08
467	\N	183	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.348+08	2025-07-01 11:51:01.348+08
482	\N	20	employee_name	Employee Name	text	\N	t	f	Enter employee name	\N	{"options": [], "required": true}	5	t	2025-07-01 12:02:21.978+08	2025-07-01 12:02:21.978+08
483	\N	21	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 12:02:21.979+08	2025-07-01 12:02:21.979+08
484	\N	21	description	Issue Description	textarea	\N	t	f	Enter issue description	\N	{"options": [], "required": true}	2	t	2025-07-01 12:02:21.979+08	2025-07-01 12:02:21.979+08
468	\N	187	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.348+08	2025-07-01 11:51:01.351+08
469	\N	187	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.352+08	2025-07-01 11:51:01.352+08
485	\N	21	branch_office	Branch/CAPEM	dropdown	\N	t	f	Enter branch/capem	\N	{"options": ["Kantor Cabang Utama", "Kantor Cabang Jakarta", "Kantor Cabang Gorontalo"], "required": true}	3	t	2025-07-01 12:02:21.98+08	2025-07-01 12:02:21.98+08
486	\N	21	user_code	User Code	text	\N	t	f	Enter user code	\N	{"options": [], "required": true}	4	t	2025-07-01 12:02:21.98+08	2025-07-01 12:02:21.98+08
487	\N	21	employee_name	Employee Name	text	\N	t	f	Enter employee name	\N	{"options": [], "required": true}	5	t	2025-07-01 12:02:21.981+08	2025-07-01 12:02:21.981+08
470	\N	188	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.352+08	2025-07-01 11:51:01.355+08
471	\N	188	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.356+08	2025-07-01 11:51:01.356+08
488	\N	24	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 12:02:21.981+08	2025-07-01 12:02:21.981+08
489	\N	24	description	Issue Description	textarea	\N	t	f	Enter issue description	\N	{"options": [], "required": true}	2	t	2025-07-01 12:02:21.982+08	2025-07-01 12:02:21.982+08
490	\N	24	branch_office	Branch/CAPEM	dropdown	\N	t	f	Enter branch/capem	\N	{"options": ["Kantor Cabang Utama", "Kantor Cabang Jakarta", "Kantor Cabang Gorontalo"], "required": true}	3	t	2025-07-01 12:02:21.982+08	2025-07-01 12:02:21.982+08
472	\N	189	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.356+08	2025-07-01 11:51:01.359+08
473	\N	189	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.359+08	2025-07-01 11:51:01.359+08
491	\N	24	user_code	User Code	text	\N	f	f	Enter user code	\N	{"options": [], "required": false}	4	t	2025-07-01 12:02:21.983+08	2025-07-01 12:02:21.983+08
492	\N	24	employee_name	Employee Name	text	\N	f	f	Enter employee name	\N	{"options": [], "required": false}	5	t	2025-07-01 12:02:21.983+08	2025-07-01 12:02:21.983+08
493	\N	23	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 12:02:21.984+08	2025-07-01 12:02:21.984+08
474	\N	247	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 11:51:01.36+08	2025-07-01 11:51:01.362+08
475	\N	247	description	Problem Description	textarea	\N	t	f	Enter problem description	\N	{"required": true}	2	t	2025-07-01 11:51:01.363+08	2025-07-01 11:51:01.363+08
494	\N	23	description	Issue Description	textarea	\N	t	f	Enter issue description	\N	{"options": [], "required": true}	2	t	2025-07-01 12:02:21.984+08	2025-07-01 12:02:21.984+08
495	\N	23	branch_office	Branch/CAPEM	dropdown	\N	t	f	Enter branch/capem	\N	{"options": ["Kantor Cabang Utama", "Kantor Cabang Jakarta", "Kantor Cabang Gorontalo"], "required": true}	3	t	2025-07-01 12:02:21.985+08	2025-07-01 12:02:21.985+08
496	\N	23	user_code	User Code	text	\N	t	f	Enter user code	\N	{"options": [], "required": true}	4	t	2025-07-01 12:02:21.985+08	2025-07-01 12:02:21.985+08
497	\N	23	employee_name	Employee Name	text	\N	t	f	Enter employee name	\N	{"options": [], "required": true}	5	t	2025-07-01 12:02:21.986+08	2025-07-01 12:02:21.986+08
498	\N	22	urgency	Urgency Level	dropdown	\N	t	f	Enter urgency level	\N	{"options": ["Low", "Medium", "High", "Critical"], "required": true}	1	t	2025-07-01 12:02:21.986+08	2025-07-01 12:02:21.986+08
499	\N	22	description	Issue Description	textarea	\N	t	f	Enter issue description	\N	{"options": [], "required": true}	2	t	2025-07-01 12:02:21.986+08	2025-07-01 12:02:21.986+08
500	\N	22	branch_office	Branch/CAPEM	dropdown	\N	t	f	Enter branch/capem	\N	{"options": ["Kantor Cabang Utama", "Kantor Cabang Jakarta", "Kantor Cabang Gorontalo"], "required": true}	3	t	2025-07-01 12:02:21.987+08	2025-07-01 12:02:21.987+08
501	\N	22	user_code	User Code	text	\N	f	f	Enter user code	\N	{"options": [], "required": false}	4	t	2025-07-01 12:02:21.987+08	2025-07-01 12:02:21.987+08
502	\N	22	employee_name	Employee Name	text	\N	f	f	Enter employee name	\N	{"options": [], "required": false}	5	t	2025-07-01 12:02:21.988+08	2025-07-01 12:02:21.988+08
619	309	\N	Tanggal berlaku	Tanggal berlaku	date	\N	t	f	Tanggal berlaku perubahan menu User	\N	\N	1	t	2025-07-01 12:51:19.28+08	2025-07-01 12:51:19.28+08
620	309	\N	Cabang / Capem	Cabang / Capem	dropdown	{"values": "DYNAMIC_BRANCHES"}	t	f	Cabang/Capem Requester	\N	\N	2	t	2025-07-01 12:51:19.284+08	2025-07-01 12:51:19.284+08
621	309	\N	Kantor Kas	Kantor Kas	text	\N	f	f	Kantor kas dari User	\N	\N	3	t	2025-07-01 12:51:19.286+08	2025-07-01 12:51:19.286+08
622	309	\N	Kode User	Kode User	text	\N	t	f	Kode User Requester	\N	{"maxLength": 5}	4	t	2025-07-01 12:51:19.287+08	2025-07-01 12:51:19.287+08
623	309	\N	Nama User	Nama User	text	\N	t	f	Nama User Requester	\N	\N	5	t	2025-07-01 12:51:19.289+08	2025-07-01 12:51:19.289+08
624	309	\N	Jabatan	Jabatan	text	\N	t	f	Jabatan dari User Requester	\N	\N	6	t	2025-07-01 12:51:19.29+08	2025-07-01 12:51:19.29+08
625	309	\N	Program Fasilitas OLIBS	Program Fasilitas OLIBS	dropdown	{"values": "DYNAMIC_OPTIONS"}	t	f	Wewenang menu permintaan User	\N	\N	7	t	2025-07-01 12:51:19.292+08	2025-07-01 12:51:19.292+08
626	310	\N	Tanggal berlaku	Tanggal berlaku	date	\N	t	f	Tanggal berlaku perubahan menu User	\N	\N	1	t	2025-07-01 12:51:19.297+08	2025-07-01 12:51:19.297+08
627	310	\N	Cabang / Capem	Cabang / Capem	dropdown	{"values": "DYNAMIC_BRANCHES"}	t	f	Cabang/Capem Requester	\N	\N	2	t	2025-07-01 12:51:19.298+08	2025-07-01 12:51:19.298+08
628	310	\N	Kantor Kas	Kantor Kas	text	\N	f	f	Kantor kas dari User	\N	\N	3	t	2025-07-01 12:51:19.298+08	2025-07-01 12:51:19.298+08
629	310	\N	Kode User	Kode User	text	\N	t	f	Kode User Requester	\N	{"maxLength": 5}	4	t	2025-07-01 12:51:19.299+08	2025-07-01 12:51:19.299+08
630	310	\N	Nama User	Nama User	text	\N	t	f	Nama User Requester	\N	\N	5	t	2025-07-01 12:51:19.3+08	2025-07-01 12:51:19.3+08
631	310	\N	Jabatan	Jabatan	text	\N	t	f	Jabatan dari User Requester	\N	\N	6	t	2025-07-01 12:51:19.301+08	2025-07-01 12:51:19.301+08
632	310	\N	Mutasi dari	Mutasi dari	dropdown	{"values": "DYNAMIC_BRANCHES"}	f	f	Cabang/Capem asal dari Requester	\N	\N	7	t	2025-07-01 12:51:19.301+08	2025-07-01 12:51:19.301+08
633	310	\N	Mutasi ke Kantor Kas	Mutasi ke Kantor Kas	text	\N	f	f	Kantor kas tujuan apabila hanya terjadi mutasi internal User	\N	\N	8	t	2025-07-01 12:51:19.302+08	2025-07-01 12:51:19.302+08
634	310	\N	Program Fasilitas OLIBS	Program Fasilitas OLIBS	dropdown	{"values": "DYNAMIC_OPTIONS"}	t	f	Wewenang menu permintaan User	\N	\N	9	t	2025-07-01 12:51:19.303+08	2025-07-01 12:51:19.303+08
635	311	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.307+08	2025-07-01 12:51:19.307+08
636	311	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.307+08	2025-07-01 12:51:19.307+08
637	311	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.308+08	2025-07-01 12:51:19.308+08
638	311	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.309+08	2025-07-01 12:51:19.309+08
639	312	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.313+08	2025-07-01 12:51:19.313+08
640	312	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.314+08	2025-07-01 12:51:19.314+08
641	312	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.315+08	2025-07-01 12:51:19.315+08
642	312	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.316+08	2025-07-01 12:51:19.316+08
643	313	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.319+08	2025-07-01 12:51:19.319+08
644	313	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.32+08	2025-07-01 12:51:19.32+08
645	313	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.321+08	2025-07-01 12:51:19.321+08
646	313	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.321+08	2025-07-01 12:51:19.321+08
647	314	\N	Nama Nasabah	Nama Nasabah	text	\N	t	f	Nama nasabah pengirim transaksi	\N	\N	1	t	2025-07-01 12:51:19.324+08	2025-07-01 12:51:19.324+08
648	314	\N	Nomor Rekening	Nomor Rekening	number	\N	t	f	Nomor rekening pengirim transaksi	\N	\N	2	t	2025-07-01 12:51:19.324+08	2025-07-01 12:51:19.324+08
649	314	\N	Nomor Kartu	Nomor Kartu	text	\N	f	f	Nomor kartu nasabah	\N	\N	3	t	2025-07-01 12:51:19.325+08	2025-07-01 12:51:19.325+08
650	314	\N	Nominal Transaksi	Nominal Transaksi	number	\N	t	f	Nominal per transaksi yang diklaim, sudah ditambahkan dengan fee transaksi	\N	\N	4	t	2025-07-01 12:51:19.325+08	2025-07-01 12:51:19.325+08
651	314	\N	Tanggal transaksi	Tanggal transaksi	datetime	\N	t	f	Tanggal transaksi dilakukan	\N	\N	5	t	2025-07-01 12:51:19.326+08	2025-07-01 12:51:19.326+08
652	314	\N	Nomor Arsip	Nomor Arsip	text	\N	t	f	Nomor arsip transaksi	\N	\N	6	t	2025-07-01 12:51:19.326+08	2025-07-01 12:51:19.326+08
653	315	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.328+08	2025-07-01 12:51:19.328+08
654	315	\N	Nama Nasabah	Nama Nasabah	textarea	\N	f	f	Nama Nasabah	\N	\N	2	t	2025-07-01 12:51:19.329+08	2025-07-01 12:51:19.329+08
655	315	\N	Nomor Rekening	Nomor Rekening	textarea	\N	f	f	Nomor rekening Nasabah	\N	\N	3	t	2025-07-01 12:51:19.329+08	2025-07-01 12:51:19.329+08
656	315	\N	Nominal Transaksi	Nominal Transaksi	textarea	\N	f	f	Jumlah nominal transaksi	\N	\N	4	t	2025-07-01 12:51:19.33+08	2025-07-01 12:51:19.33+08
657	315	\N	Tgl. Transaksi	Tgl. Transaksi	text	\N	f	f	Tanggal transaksi	\N	\N	5	t	2025-07-01 12:51:19.33+08	2025-07-01 12:51:19.33+08
658	315	\N	Nomor Arsip	Nomor Arsip	textarea	\N	f	f	Nomor arsip transaksi	\N	\N	6	t	2025-07-01 12:51:19.331+08	2025-07-01 12:51:19.331+08
659	316	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.332+08	2025-07-01 12:51:19.332+08
660	316	\N	Kantor kas	Kantor kas	textarea	\N	f	f	Kantor kas dari User	\N	\N	2	t	2025-07-01 12:51:19.333+08	2025-07-01 12:51:19.333+08
661	316	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	3	t	2025-07-01 12:51:19.333+08	2025-07-01 12:51:19.333+08
662	316	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	4	t	2025-07-01 12:51:19.334+08	2025-07-01 12:51:19.334+08
663	316	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	5	t	2025-07-01 12:51:19.334+08	2025-07-01 12:51:19.334+08
664	317	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.336+08	2025-07-01 12:51:19.336+08
665	317	\N	Kantor kas	Kantor kas	textarea	\N	f	f	Kantor kas dari User	\N	\N	2	t	2025-07-01 12:51:19.337+08	2025-07-01 12:51:19.337+08
666	317	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	3	t	2025-07-01 12:51:19.337+08	2025-07-01 12:51:19.337+08
667	317	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	4	t	2025-07-01 12:51:19.338+08	2025-07-01 12:51:19.338+08
668	317	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	5	t	2025-07-01 12:51:19.338+08	2025-07-01 12:51:19.338+08
669	317	\N	IP Komputer	IP Komputer	text	\N	f	f	IP computer User	\N	\N	6	t	2025-07-01 12:51:19.339+08	2025-07-01 12:51:19.339+08
670	317	\N	Menu XCARD	Menu XCARD	textarea	\N	f	f	Menu yang digunakan	\N	\N	7	t	2025-07-01 12:51:19.339+08	2025-07-01 12:51:19.339+08
671	318	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.341+08	2025-07-01 12:51:19.341+08
672	318	\N	Menu Teller App	Menu Teller App	textarea	\N	f	f	Menu yang dimintakan (Tunai, Non Tunai, SPV)	\N	\N	2	t	2025-07-01 12:51:19.342+08	2025-07-01 12:51:19.342+08
673	318	\N	User SPV 1	User SPV 1	textarea	\N	f	f	Nama User SPV 1 Requester	\N	\N	3	t	2025-07-01 12:51:19.342+08	2025-07-01 12:51:19.342+08
674	318	\N	User SPV 2	User SPV 2	textarea	\N	f	f	Jabatan User SPV 2 Requester	\N	\N	4	t	2025-07-01 12:51:19.343+08	2025-07-01 12:51:19.343+08
675	319	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.345+08	2025-07-01 12:51:19.345+08
676	319	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.347+08	2025-07-01 12:51:19.347+08
677	319	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.347+08	2025-07-01 12:51:19.347+08
678	319	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.348+08	2025-07-01 12:51:19.348+08
679	320	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.351+08	2025-07-01 12:51:19.351+08
680	320	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.352+08	2025-07-01 12:51:19.352+08
681	320	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.352+08	2025-07-01 12:51:19.352+08
682	320	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.353+08	2025-07-01 12:51:19.353+08
687	322	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.36+08	2025-07-01 12:51:19.36+08
688	322	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.361+08	2025-07-01 12:51:19.361+08
689	322	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.362+08	2025-07-01 12:51:19.362+08
690	322	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.362+08	2025-07-01 12:51:19.362+08
691	323	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.366+08	2025-07-01 12:51:19.366+08
692	323	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.366+08	2025-07-01 12:51:19.366+08
693	323	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.367+08	2025-07-01 12:51:19.367+08
694	323	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.368+08	2025-07-01 12:51:19.368+08
695	324	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.371+08	2025-07-01 12:51:19.371+08
696	324	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.372+08	2025-07-01 12:51:19.372+08
697	324	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.372+08	2025-07-01 12:51:19.372+08
698	324	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.373+08	2025-07-01 12:51:19.373+08
699	325	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.376+08	2025-07-01 12:51:19.376+08
700	325	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.377+08	2025-07-01 12:51:19.377+08
701	325	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.378+08	2025-07-01 12:51:19.378+08
702	325	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.379+08	2025-07-01 12:51:19.379+08
703	326	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.381+08	2025-07-01 12:51:19.381+08
704	326	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.381+08	2025-07-01 12:51:19.381+08
705	326	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.382+08	2025-07-01 12:51:19.382+08
706	326	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.382+08	2025-07-01 12:51:19.382+08
707	326	\N	Mutasi dari Cabang / Capem	Mutasi dari Cabang / Capem	text	\N	f	f	Cabang/Capem Sebelum	\N	\N	5	t	2025-07-01 12:51:19.382+08	2025-07-01 12:51:19.382+08
708	326	\N	Mutasi ke Kantor Kas	Mutasi ke Kantor Kas	textarea	\N	f	f	Nama Kantor Kas	\N	\N	6	t	2025-07-01 12:51:19.383+08	2025-07-01 12:51:19.383+08
709	327	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.384+08	2025-07-01 12:51:19.384+08
710	327	\N	ID ATM	ID ATM	text	\N	f	f	ID ATM Terdaftar	\N	\N	2	t	2025-07-01 12:51:19.385+08	2025-07-01 12:51:19.385+08
711	327	\N	Nama ATM	Nama ATM	textarea	\N	f	f	Nama ATM terdaftar	\N	\N	3	t	2025-07-01 12:51:19.385+08	2025-07-01 12:51:19.385+08
712	327	\N	Serial Number	Serial Number	text	\N	f	f	SN ATM	\N	\N	4	t	2025-07-01 12:51:19.385+08	2025-07-01 12:51:19.385+08
713	327	\N	Tipe Mesin	Tipe Mesin	textarea	\N	f	f	Merk mesin	\N	\N	5	t	2025-07-01 12:51:19.386+08	2025-07-01 12:51:19.386+08
714	327	\N	Nama PIC	Nama PIC	textarea	\N	f	f	Nama PIC	\N	\N	6	t	2025-07-01 12:51:19.386+08	2025-07-01 12:51:19.386+08
715	327	\N	No HP PIC	No HP PIC	text	\N	f	f	No HP	\N	\N	7	t	2025-07-01 12:51:19.386+08	2025-07-01 12:51:19.386+08
716	328	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.388+08	2025-07-01 12:51:19.388+08
717	328	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.388+08	2025-07-01 12:51:19.388+08
718	328	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.389+08	2025-07-01 12:51:19.389+08
719	328	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.389+08	2025-07-01 12:51:19.389+08
720	329	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.39+08	2025-07-01 12:51:19.39+08
721	329	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.391+08	2025-07-01 12:51:19.391+08
722	329	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.391+08	2025-07-01 12:51:19.391+08
723	329	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.391+08	2025-07-01 12:51:19.391+08
724	321	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.393+08	2025-07-01 12:51:19.393+08
725	321	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.393+08	2025-07-01 12:51:19.393+08
726	321	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.394+08	2025-07-01 12:51:19.394+08
727	321	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.394+08	2025-07-01 12:51:19.394+08
728	331	\N	Cabang/Capem	Cabang/Capem	text	\N	f	f	Nama Cabang/Capem Requester	\N	\N	1	t	2025-07-01 12:51:19.396+08	2025-07-01 12:51:19.396+08
729	331	\N	Kode User	Kode User	textarea	\N	f	f	Kode User Requester	\N	\N	2	t	2025-07-01 12:51:19.396+08	2025-07-01 12:51:19.396+08
730	331	\N	Nama User	Nama User	textarea	\N	f	f	Nama User Requester	\N	\N	3	t	2025-07-01 12:51:19.396+08	2025-07-01 12:51:19.396+08
731	331	\N	Jabatan	Jabatan	textarea	\N	f	f	Jabatan User Requester	\N	\N	4	t	2025-07-01 12:51:19.397+08	2025-07-01 12:51:19.397+08
732	331	\N	Mutasi dari Cabang / Capem	Mutasi dari Cabang / Capem	text	\N	f	f	Cabang/Capem Sebelum	\N	\N	5	t	2025-07-01 12:51:19.397+08	2025-07-01 12:51:19.397+08
733	331	\N	Mutasi ke Kantor Kas	Mutasi ke Kantor Kas	textarea	\N	f	f	Nama Kantor Kas	\N	\N	6	t	2025-07-01 12:51:19.397+08	2025-07-01 12:51:19.397+08
\.


--
-- Data for Name: service_items; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.service_items (id, service_catalog_id, name, description, request_type, is_kasda_related, requires_gov_approval, is_active, sort_order, created_at, updated_at) FROM stdin;
9	3	Government Banking Integration	Integration services for government banking systems	service_request	t	t	t	0	2025-07-01 11:40:17.874+08	2025-07-01 11:40:17.874+08
5	4	Hardware Support	Computer and hardware troubleshooting	service_request	f	t	t	0	2025-07-01 11:40:17.874+08	2025-07-01 11:40:17.874+08
7	5	BSGDirect Support	BSGDirect application support	service_request	f	t	t	0	2025-07-01 11:40:17.874+08	2025-07-01 11:40:17.874+08
4	4	Network Connectivity	Network and internet connectivity issues	service_request	f	t	t	0	2025-07-01 11:40:17.874+08	2025-07-01 11:40:17.874+08
8	3	KASDA Account Management	KASDA user account and access management	service_request	t	t	t	0	2025-07-01 11:40:17.874+08	2025-07-01 11:40:17.874+08
6	5	OLIBS Support	OLIBS system support and troubleshooting	service_request	f	t	t	0	2025-07-01 11:40:17.874+08	2025-07-01 11:40:17.874+08
11	6	OLIBs - Buka Blokir	OLIBS service request: OLIBs - Buka Blokir	service_request	f	f	t	2	2025-07-01 11:47:58.597+08	2025-07-01 11:47:58.597+08
19	6	OLIBs - Gagal Close Operasional	OLIBS service request: OLIBs - Gagal Close Operasional	service_request	f	f	t	10	2025-07-01 11:47:58.604+08	2025-07-01 11:47:58.604+08
20	6	OLIBs - Mutasi User Pegawai	OLIBS service request: OLIBs - Mutasi User Pegawai	service_request	f	f	t	11	2025-07-01 11:47:58.605+08	2025-07-01 11:47:58.605+08
21	6	OLIBs - Non Aktif User	OLIBS service request: OLIBs - Non Aktif User	service_request	f	f	t	12	2025-07-01 11:47:58.605+08	2025-07-01 11:47:58.605+08
22	6	OLIBs - Override Password	OLIBS service request: OLIBs - Override Password	service_request	f	f	t	13	2025-07-01 11:47:58.606+08	2025-07-01 11:47:58.606+08
23	6	OLIBs - Pendaftaran User Baru	OLIBS service request: OLIBs - Pendaftaran User Baru	service_request	f	f	t	14	2025-07-01 11:47:58.607+08	2025-07-01 11:47:58.607+08
24	6	OLIBs - Perubahan Menu dan Limit Transaksi	OLIBS service request: OLIBs - Perubahan Menu dan Limit Transaksi	service_request	f	f	t	15	2025-07-01 11:47:58.608+08	2025-07-01 11:47:58.608+08
25	6	OLIBs - Selisih Pembukuan	OLIBS service request: OLIBs - Selisih Pembukuan	service_request	f	f	t	16	2025-07-01 11:47:58.608+08	2025-07-01 11:47:58.608+08
33	6	Kasda Online - Gagal Pembayaran	KASDA service request: Kasda Online - Gagal Pembayaran	service_request	t	f	t	24	2025-07-01 11:47:58.614+08	2025-07-01 11:47:58.614+08
34	6	Kasda Online - Gagal Transfer	KASDA service request: Kasda Online - Gagal Transfer	service_request	t	f	t	25	2025-07-01 11:47:58.614+08	2025-07-01 11:47:58.614+08
36	6	Kasda Online - User Management	KASDA service request: Kasda Online - User Management	service_request	t	t	t	27	2025-07-01 11:47:58.616+08	2025-07-01 11:47:58.616+08
38	6	Antasena - Pendaftaran User	Specialized financial system service: Antasena - Pendaftaran User	service_request	f	f	t	29	2025-07-01 11:47:58.617+08	2025-07-01 11:47:58.617+08
39	6	Antasena - Reset Password	Specialized financial system service: Antasena - Reset Password	service_request	f	f	t	30	2025-07-01 11:47:58.618+08	2025-07-01 11:47:58.618+08
40	6	Antasena - User Expire	Specialized financial system service: Antasena - User Expire	service_request	f	f	t	31	2025-07-01 11:47:58.618+08	2025-07-01 11:47:58.618+08
43	6	Brocade (Broker) - Mutasi User	Specialized financial system service: Brocade (Broker) - Mutasi User	service_request	f	f	t	34	2025-07-01 11:47:58.62+08	2025-07-01 11:47:58.62+08
44	6	Brocade (Broker) - Pendaftaran User Baru	Specialized financial system service: Brocade (Broker) - Pendaftaran User Baru	service_request	f	f	t	35	2025-07-01 11:47:58.621+08	2025-07-01 11:47:58.621+08
45	6	Brocade (Broker) - Perubahan User	Specialized financial system service: Brocade (Broker) - Perubahan User	service_request	f	f	t	36	2025-07-01 11:47:58.621+08	2025-07-01 11:47:58.621+08
46	6	Brocade (Broker) - Reset Password	Specialized financial system service: Brocade (Broker) - Reset Password	service_request	f	f	t	37	2025-07-01 11:47:58.622+08	2025-07-01 11:47:58.622+08
54	6	Report Viewer 724 - Selisih	Specialized financial system service: Report Viewer 724 - Selisih	service_request	f	f	t	45	2025-07-01 11:47:58.627+08	2025-07-01 11:47:58.627+08
30	12	Kasda Online - Error Login	KASDA service request: Kasda Online - Error Login	service_request	t	f	t	21	2025-07-01 11:47:58.612+08	2025-07-02 16:03:48.477+08
42	12	BI RTGS - Error Aplikasi	Specialized financial system service: BI RTGS - Error Aplikasi	service_request	f	f	t	33	2025-07-01 11:47:58.619+08	2025-07-02 16:03:48.485+08
51	12	MPN - Error Transaksi	Specialized financial system service: MPN - Error Transaksi	service_request	f	f	t	42	2025-07-01 11:47:58.625+08	2025-07-02 16:03:48.486+08
52	12	PSAK 71 - Error Aplikasi	Specialized financial system service: PSAK 71 - Error Aplikasi	service_request	f	f	t	43	2025-07-01 11:47:58.625+08	2025-07-02 16:03:48.487+08
10	12	OLIBs - BE Error	OLIBS service request: OLIBs - BE Error	service_request	f	f	t	1	2025-07-01 11:47:58.594+08	2025-07-02 16:05:02.27+08
12	12	OLIBs - Error Deposito	OLIBS service request: OLIBs - Error Deposito	service_request	f	f	t	3	2025-07-01 11:47:58.598+08	2025-07-02 16:05:02.276+08
13	12	OLIBs - Error Giro	OLIBS service request: OLIBs - Error Giro	service_request	f	f	t	4	2025-07-01 11:47:58.599+08	2025-07-02 16:05:02.277+08
14	12	OLIBs - Error Kredit	OLIBS service request: OLIBs - Error Kredit	service_request	f	f	t	5	2025-07-01 11:47:58.6+08	2025-07-02 16:05:02.278+08
15	12	OLIBs - Error PRK	OLIBS service request: OLIBs - Error PRK	service_request	f	f	t	6	2025-07-01 11:47:58.601+08	2025-07-02 16:05:02.279+08
16	12	OLIBs - Error Tabungan	OLIBS service request: OLIBs - Error Tabungan	service_request	f	f	t	7	2025-07-01 11:47:58.602+08	2025-07-02 16:05:02.281+08
17	12	OLIBs - Error User	OLIBS service request: OLIBs - Error User	service_request	f	f	t	8	2025-07-01 11:47:58.603+08	2025-07-02 16:05:02.282+08
18	12	OLIBs - FE Error	OLIBS service request: OLIBs - FE Error	service_request	f	f	t	9	2025-07-01 11:47:58.604+08	2025-07-02 16:05:02.283+08
26	12	Kasda Online - Error Approval Maker	KASDA service request: Kasda Online - Error Approval Maker	service_request	t	f	t	17	2025-07-01 11:47:58.609+08	2025-07-02 16:05:02.284+08
27	12	Kasda Online - Error Approval Transaksi	KASDA service request: Kasda Online - Error Approval Transaksi	service_request	t	f	t	18	2025-07-01 11:47:58.61+08	2025-07-02 16:05:02.284+08
28	12	Kasda Online - Error Cek Transaksi/Saldo Rekening	KASDA service request: Kasda Online - Error Cek Transaksi/Saldo Rekening	service_request	t	f	t	19	2025-07-01 11:47:58.61+08	2025-07-02 16:05:02.285+08
29	12	Kasda Online - Error Lainnya	KASDA service request: Kasda Online - Error Lainnya	service_request	t	f	t	20	2025-07-01 11:47:58.611+08	2025-07-02 16:05:02.286+08
31	12	Kasda Online - Error Permintaan Token Transaksi	KASDA service request: Kasda Online - Error Permintaan Token Transaksi	service_request	t	f	t	22	2025-07-01 11:47:58.612+08	2025-07-02 16:05:02.287+08
32	12	Kasda Online - Error Tarik Data SP2D (Kasda FMIS)	KASDA service request: Kasda Online - Error Tarik Data SP2D (Kasda FMIS)	service_request	t	f	t	23	2025-07-01 11:47:58.613+08	2025-07-02 16:05:02.288+08
35	12	Kasda Online BUD - Error	KASDA service request: Kasda Online BUD - Error	service_request	t	f	t	26	2025-07-01 11:47:58.615+08	2025-07-02 16:05:02.289+08
37	12	Antasena - Error Proses Aplikasi	Specialized financial system service: Antasena - Error Proses Aplikasi	service_request	f	f	t	28	2025-07-01 11:47:58.616+08	2025-07-02 16:05:02.29+08
41	12	BI Fast - Error	Specialized financial system service: BI Fast - Error	service_request	f	f	t	32	2025-07-01 11:47:58.619+08	2025-07-02 16:05:02.29+08
47	12	BSG sprint TNP - Error	Specialized financial system service: BSG sprint TNP - Error	service_request	f	f	t	38	2025-07-01 11:47:58.622+08	2025-07-02 16:05:02.291+08
48	12	BSGbrocade - Error	Specialized financial system service: BSGbrocade - Error	service_request	f	f	t	39	2025-07-01 11:47:58.623+08	2025-07-02 16:05:02.292+08
49	12	Error GoAML - Error Proses	Specialized financial system service: Error GoAML - Error Proses	service_request	f	f	t	40	2025-07-01 11:47:58.624+08	2025-07-02 16:05:02.293+08
50	12	Finnet - Error	Specialized financial system service: Finnet - Error	service_request	f	f	t	41	2025-07-01 11:47:58.624+08	2025-07-02 16:05:02.294+08
53	12	Report Viewer 724 - Error	Specialized financial system service: Report Viewer 724 - Error	service_request	f	f	t	44	2025-07-01 11:47:58.626+08	2025-07-02 16:05:02.294+08
57	6	SIKP - Pendaftaran user	Specialized financial system service: SIKP - Pendaftaran user	service_request	f	f	t	48	2025-07-01 11:47:58.631+08	2025-07-01 11:47:58.631+08
59	6	SKNBI - Mutasi User	Specialized financial system service: SKNBI - Mutasi User	service_request	f	f	t	50	2025-07-01 11:47:58.632+08	2025-07-01 11:47:58.632+08
60	6	SKNBI - Pendaftaran User	Specialized financial system service: SKNBI - Pendaftaran User	service_request	f	f	t	51	2025-07-01 11:47:58.633+08	2025-07-01 11:47:58.633+08
61	6	SKNBI - Perubahan User	Specialized financial system service: SKNBI - Perubahan User	service_request	f	f	t	52	2025-07-01 11:47:58.634+08	2025-07-01 11:47:58.634+08
62	6	SKNBI - Reset Password	Specialized financial system service: SKNBI - Reset Password	service_request	f	f	t	53	2025-07-01 11:47:58.634+08	2025-07-01 11:47:58.634+08
65	6	Switching - Permintaan Pendaftaran Prefiks Bank	Specialized financial system service: Switching - Permintaan Pendaftaran Prefiks Bank	service_request	f	f	t	56	2025-07-01 11:47:58.636+08	2025-07-01 11:47:58.636+08
66	6	Switching - Permintaan Penghapusan Prefiks Bank	Specialized financial system service: Switching - Permintaan Penghapusan Prefiks Bank	service_request	f	f	t	57	2025-07-01 11:47:58.637+08	2025-07-01 11:47:58.637+08
67	6	Switching - Permintaan Penyesuaian Prefiks Bank	Specialized financial system service: Switching - Permintaan Penyesuaian Prefiks Bank	service_request	f	f	t	58	2025-07-01 11:47:58.637+08	2025-07-01 11:47:58.637+08
68	7	BSGTouch (Android) - Mutasi User	Digital channel service: BSGTouch (Android) - Mutasi User	service_request	f	f	t	1	2025-07-01 11:47:58.639+08	2025-07-01 11:47:58.639+08
69	7	BSGTouch (Android) - Pendaftaran User Baru	Digital channel service: BSGTouch (Android) - Pendaftaran User Baru	service_request	f	f	t	2	2025-07-01 11:47:58.64+08	2025-07-01 11:47:58.64+08
70	7	BSGTouch (Android) - Buka Blokir dan Reset Password	Digital channel service: BSGTouch (Android) - Buka Blokir dan Reset Password	service_request	f	f	t	3	2025-07-01 11:47:58.64+08	2025-07-01 11:47:58.64+08
72	7	BSGTouch (Android) - Perpanjang Masa Berlaku	Digital channel service: BSGTouch (Android) - Perpanjang Masa Berlaku	service_request	f	f	t	5	2025-07-01 11:47:58.642+08	2025-07-01 11:47:58.642+08
73	7	BSGTouch (Android) - Perubahan User	Digital channel service: BSGTouch (Android) - Perubahan User	service_request	f	f	t	6	2025-07-01 11:47:58.642+08	2025-07-01 11:47:58.642+08
74	7	BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi	Digital channel service: BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi	service_request	f	f	t	7	2025-07-01 11:47:58.642+08	2025-07-01 11:47:58.642+08
77	7	BSGTouch (iOS) - SMS Aktivasi tidak terkirim	Digital channel service: BSGTouch (iOS) - SMS Aktivasi tidak terkirim	service_request	f	f	t	10	2025-07-01 11:47:58.644+08	2025-07-01 11:47:58.644+08
79	7	BSGTouch - Penutupan Akun BSGTouch	Digital channel service: BSGTouch - Penutupan Akun BSGTouch	service_request	f	f	t	12	2025-07-01 11:47:58.645+08	2025-07-01 11:47:58.645+08
82	7	BSGDirect - User Management	Digital channel service: BSGDirect - User Management	service_request	f	t	t	15	2025-07-01 11:47:58.647+08	2025-07-01 11:47:58.647+08
84	7	SMS Banking - Mutasi user	Digital channel service: SMS Banking - Mutasi user	service_request	f	f	t	17	2025-07-01 11:47:58.649+08	2025-07-01 11:47:58.649+08
85	7	SMS Banking - Pendaftaran User	Digital channel service: SMS Banking - Pendaftaran User	service_request	f	f	t	18	2025-07-01 11:47:58.65+08	2025-07-01 11:47:58.65+08
86	7	SMS Banking - Perubahan User	Digital channel service: SMS Banking - Perubahan User	service_request	f	f	t	19	2025-07-01 11:47:58.65+08	2025-07-01 11:47:58.65+08
87	7	SMS Banking - Reset Password	Digital channel service: SMS Banking - Reset Password	service_request	f	f	t	20	2025-07-01 11:47:58.651+08	2025-07-01 11:47:58.651+08
88	7	BSG QRIS - Buka Blokir & Reset Password	Digital channel service: BSG QRIS - Buka Blokir & Reset Password	service_request	f	f	t	21	2025-07-01 11:47:58.652+08	2025-07-01 11:47:58.652+08
90	7	BSG QRIS - Mutasi User	Digital channel service: BSG QRIS - Mutasi User	service_request	f	f	t	23	2025-07-01 11:47:58.653+08	2025-07-01 11:47:58.653+08
91	7	BSG QRIS - Pendaftaran User	Digital channel service: BSG QRIS - Pendaftaran User	service_request	f	f	t	24	2025-07-01 11:47:58.654+08	2025-07-01 11:47:58.654+08
92	7	BSG QRIS - Perpanjang Masa Berlaku	Digital channel service: BSG QRIS - Perpanjang Masa Berlaku	service_request	f	f	t	25	2025-07-01 11:47:58.654+08	2025-07-01 11:47:58.654+08
93	7	BSG QRIS - Perubahan User	Digital channel service: BSG QRIS - Perubahan User	service_request	f	f	t	26	2025-07-01 11:47:58.655+08	2025-07-01 11:47:58.655+08
94	8	ATM - ATMB Error Transfer Antar Bank	Hardware service: ATM - ATMB Error Transfer Antar Bank	incident	f	f	t	1	2025-07-01 11:47:58.657+08	2025-07-01 11:47:58.657+08
95	8	ATM - Cash Handler	Hardware service: ATM - Cash Handler	incident	f	f	t	2	2025-07-01 11:47:58.657+08	2025-07-01 11:47:58.657+08
96	8	ATM - Cassette Supply/Persediaan Kaset	Hardware service: ATM - Cassette Supply/Persediaan Kaset	incident	f	f	t	3	2025-07-01 11:47:58.658+08	2025-07-01 11:47:58.658+08
97	8	ATM - Communication Offline	Hardware service: ATM - Communication Offline	incident	f	f	t	4	2025-07-01 11:47:58.658+08	2025-07-01 11:47:58.658+08
98	8	ATM - Door Contact Sensor Abnormal	Hardware service: ATM - Door Contact Sensor Abnormal	incident	f	f	t	5	2025-07-01 11:47:58.659+08	2025-07-01 11:47:58.659+08
99	8	ATM - Gagal Cash in/Cash out	Hardware service: ATM - Gagal Cash in/Cash out	incident	f	f	t	6	2025-07-01 11:47:58.659+08	2025-07-01 11:47:58.659+08
100	8	ATM - MCRW Fatal	Hardware service: ATM - MCRW Fatal	incident	f	f	t	7	2025-07-01 11:47:58.66+08	2025-07-01 11:47:58.66+08
101	8	ATM - Receipt Paper Media Out	Hardware service: ATM - Receipt Paper Media Out	incident	f	f	t	8	2025-07-01 11:47:58.661+08	2025-07-01 11:47:58.661+08
102	8	ATM-Pendaftaran Terminal Baru	Hardware service: ATM-Pendaftaran Terminal Baru	incident	f	f	t	9	2025-07-01 11:47:58.661+08	2025-07-01 11:47:58.661+08
103	8	ATM-Pengiriman Log Jurnal	Hardware service: ATM-Pengiriman Log Jurnal	incident	f	f	t	10	2025-07-01 11:47:58.662+08	2025-07-01 11:47:58.662+08
104	8	ATM-Permasalahan Teknis	Hardware service: ATM-Permasalahan Teknis	incident	f	f	t	11	2025-07-01 11:47:58.662+08	2025-07-01 11:47:58.662+08
105	8	ATM-Permintaan Log Switching	Hardware service: ATM-Permintaan Log Switching	incident	f	f	t	12	2025-07-01 11:47:58.663+08	2025-07-01 11:47:58.663+08
106	8	ATM-Perubahan IP	Hardware service: ATM-Perubahan IP	incident	f	f	t	13	2025-07-01 11:47:58.664+08	2025-07-01 11:47:58.664+08
58	12	SKNBI - Error Aplikasi	Specialized financial system service: SKNBI - Error Aplikasi	service_request	f	f	t	49	2025-07-01 11:47:58.632+08	2025-07-02 16:03:48.491+08
75	12	BSGTouch (Android/Ios) - Error Aplikasi	Digital channel service: BSGTouch (Android/Ios) - Error Aplikasi	service_request	f	f	t	8	2025-07-01 11:47:58.643+08	2025-07-02 16:03:48.493+08
78	12	BSGtouch - Error Transaksi	Digital channel service: BSGtouch - Error Transaksi	service_request	f	f	t	11	2025-07-01 11:47:58.645+08	2025-07-02 16:03:48.494+08
80	12	BSGDirect - Error Aplikasi	Digital channel service: BSGDirect - Error Aplikasi	service_request	f	f	t	13	2025-07-01 11:47:58.646+08	2025-07-02 16:03:48.495+08
81	12	BSGDirect - Error Transaksi	Digital channel service: BSGDirect - Error Transaksi	service_request	f	f	t	14	2025-07-01 11:47:58.646+08	2025-07-02 16:03:48.497+08
89	12	BSG QRIS - Error Transaksi/Aplikasi	Digital channel service: BSG QRIS - Error Transaksi/Aplikasi	service_request	f	f	t	22	2025-07-01 11:47:58.652+08	2025-07-02 16:03:48.498+08
55	12	SIKP - Error	Specialized financial system service: SIKP - Error	service_request	f	f	t	46	2025-07-01 11:47:58.627+08	2025-07-02 16:05:02.296+08
63	12	SLIK - Error	Specialized financial system service: SLIK - Error	service_request	f	f	t	54	2025-07-01 11:47:58.635+08	2025-07-02 16:05:02.297+08
71	12	BSGTouch (Android) - Error Registrasi BSGtouch	Digital channel service: BSGTouch (Android) - Error Registrasi BSGtouch	service_request	f	f	t	4	2025-07-01 11:47:58.641+08	2025-07-02 16:05:02.298+08
76	12	BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)	Digital channel service: BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)	service_request	f	f	t	9	2025-07-01 11:47:58.643+08	2025-07-02 16:05:02.299+08
83	12	SMS Banking - Error	Digital channel service: SMS Banking - Error	service_request	f	f	t	16	2025-07-01 11:47:58.648+08	2025-07-02 16:05:02.3+08
107	8	ATM-Perubahan Profil	Hardware service: ATM-Perubahan Profil	incident	f	f	t	14	2025-07-01 11:47:58.665+08	2025-07-01 11:47:58.665+08
108	8	Penggantian Mesin	Hardware service: Penggantian Mesin	incident	f	f	t	15	2025-07-01 11:47:58.665+08	2025-07-01 11:47:58.665+08
109	8	Perubahan Denom	Hardware service: Perubahan Denom	incident	f	f	t	16	2025-07-01 11:47:58.666+08	2025-07-01 11:47:58.666+08
110	8	BSGDebit/EDC - Permintaan Salinan Bukti Transaksi	Hardware service: BSGDebit/EDC - Permintaan Salinan Bukti Transaksi	incident	f	f	t	17	2025-07-01 11:47:58.667+08	2025-07-01 11:47:58.667+08
111	8	Error Pinpad	Hardware service: Error Pinpad	incident	f	f	t	18	2025-07-01 11:47:58.667+08	2025-07-01 11:47:58.667+08
112	8	Maintenance Printer	Hardware service: Maintenance Printer	incident	f	f	t	19	2025-07-01 11:47:58.668+08	2025-07-01 11:47:58.668+08
113	8	Pendaftaran Terminal Komputer Baru	Hardware service: Pendaftaran Terminal Komputer Baru	incident	f	f	t	20	2025-07-01 11:47:58.668+08	2025-07-01 11:47:58.668+08
114	8	Formulir Serah Terima Komputer	Hardware service: Formulir Serah Terima Komputer	incident	f	f	t	21	2025-07-01 11:47:58.669+08	2025-07-01 11:47:58.669+08
117	9	Digital Dashboard - Perpanjangan Masa Berlaku	Corporate IT service: Digital Dashboard - Perpanjangan Masa Berlaku	service_request	f	f	t	3	2025-07-01 11:47:58.672+08	2025-07-01 11:47:58.672+08
118	9	Digital Dashboard - Perubahan User	Corporate IT service: Digital Dashboard - Perubahan User	service_request	f	f	t	4	2025-07-01 11:47:58.672+08	2025-07-01 11:47:58.672+08
120	9	Domain - Pendaftaran/Perubahan User	Corporate IT service: Domain - Pendaftaran/Perubahan User	service_request	f	f	t	6	2025-07-01 11:47:58.673+08	2025-07-01 11:47:58.673+08
123	9	eLOS - Pendaftaran Akses VPN	Corporate IT service: eLOS - Pendaftaran Akses VPN	service_request	f	f	t	9	2025-07-01 11:47:58.675+08	2025-07-01 11:47:58.675+08
125	9	eLOS - Perubahan User	Corporate IT service: eLOS - Perubahan User	service_request	f	f	t	11	2025-07-01 11:47:58.676+08	2025-07-01 11:47:58.676+08
126	9	eLOS - Reset Akses User	Corporate IT service: eLOS - Reset Akses User	service_request	f	f	t	12	2025-07-01 11:47:58.677+08	2025-07-01 11:47:58.677+08
128	9	Ms. Office 365 - Pendaftaran Email Baru	Corporate IT service: Ms. Office 365 - Pendaftaran Email Baru	service_request	f	f	t	14	2025-07-01 11:47:58.678+08	2025-07-01 11:47:58.678+08
131	9	Payroll - Perubahan User	Corporate IT service: Payroll - Perubahan User	service_request	f	f	t	17	2025-07-01 11:47:58.68+08	2025-07-01 11:47:58.68+08
132	9	Payroll - Reset Batas Koneksi	Corporate IT service: Payroll - Reset Batas Koneksi	service_request	f	f	t	18	2025-07-01 11:47:58.68+08	2025-07-01 11:47:58.68+08
135	9	ARS73 - Error Aplikasi	Corporate IT service: ARS73 - Error Aplikasi	incident	f	f	t	21	2025-07-01 11:47:58.682+08	2025-07-01 11:47:58.682+08
138	9	ARS73 - Perubahan User	Corporate IT service: ARS73 - Perubahan User	service_request	f	f	t	24	2025-07-01 11:47:58.684+08	2025-07-01 11:47:58.684+08
139	9	ARS73 -Buka Blokir	Corporate IT service: ARS73 -Buka Blokir	service_request	f	f	t	25	2025-07-01 11:47:58.685+08	2025-07-01 11:47:58.685+08
140	9	E-Dapem - Error Transaksi	Corporate IT service: E-Dapem - Error Transaksi	incident	f	f	t	26	2025-07-01 11:47:58.685+08	2025-07-01 11:47:58.685+08
141	9	Error - Error Middleware	Corporate IT service: Error - Error Middleware	incident	f	f	t	27	2025-07-01 11:47:58.686+08	2025-07-01 11:47:58.686+08
142	9	Error - Rintis PaymentProd	Corporate IT service: Error - Rintis PaymentProd	incident	f	f	t	28	2025-07-01 11:47:58.687+08	2025-07-01 11:47:58.687+08
143	9	Error Aplikasi	Corporate IT service: Error Aplikasi	incident	f	f	t	29	2025-07-01 11:47:58.687+08	2025-07-01 11:47:58.687+08
144	9	HRMS - Gagal Koneksi	Corporate IT service: HRMS - Gagal Koneksi	service_request	f	f	t	30	2025-07-01 11:47:58.688+08	2025-07-01 11:47:58.688+08
146	9	HRMS - Perubahan IP PC	Corporate IT service: HRMS - Perubahan IP PC	service_request	f	f	t	32	2025-07-01 11:47:58.689+08	2025-07-01 11:47:58.689+08
147	9	HRMS - User Error	Corporate IT service: HRMS - User Error	incident	f	f	t	33	2025-07-01 11:47:58.69+08	2025-07-01 11:47:58.69+08
149	9	MIS - Error MIS	Corporate IT service: MIS - Error MIS	incident	f	f	t	35	2025-07-01 11:47:58.691+08	2025-07-01 11:47:58.691+08
150	9	Ms. Office 365 - Error	Corporate IT service: Ms. Office 365 - Error	incident	f	f	t	36	2025-07-01 11:47:58.691+08	2025-07-01 11:47:58.691+08
151	9	OBOX - Error Aplikasi	Corporate IT service: OBOX - Error Aplikasi	incident	f	f	t	37	2025-07-01 11:47:58.692+08	2025-07-01 11:47:58.692+08
152	9	Payroll - Error Proses	Corporate IT service: Payroll - Error Proses	incident	f	f	t	38	2025-07-01 11:47:58.693+08	2025-07-01 11:47:58.693+08
153	9	Teller App / Reporting - Gagal Connect	Corporate IT service: Teller App / Reporting - Gagal Connect	service_request	f	f	t	39	2025-07-01 11:47:58.693+08	2025-07-01 11:47:58.693+08
156	9	Teller App / Reporting - Perubahan User	Corporate IT service: Teller App / Reporting - Perubahan User	service_request	f	f	t	42	2025-07-01 11:47:58.695+08	2025-07-01 11:47:58.695+08
157	9	Teller App / Reporting - Reset Batas Koneksi	Corporate IT service: Teller App / Reporting - Reset Batas Koneksi	service_request	f	f	t	43	2025-07-01 11:47:58.696+08	2025-07-01 11:47:58.696+08
159	9	XCARD - Error Aplikasi	Corporate IT service: XCARD - Error Aplikasi	incident	f	f	t	45	2025-07-01 11:47:58.696+08	2025-07-01 11:47:58.696+08
162	9	XCARD - Penggantian PIN	Corporate IT service: XCARD - Penggantian PIN	service_request	f	f	t	48	2025-07-01 11:47:58.698+08	2025-07-01 11:47:58.698+08
116	13	Digital Dashboard - Pendaftaran User	Corporate IT service: Digital Dashboard - Pendaftaran User	service_request	f	f	t	2	2025-07-01 11:47:58.671+08	2025-07-02 16:03:48.5+08
119	13	Digital Dashboard - Reset Password User	Corporate IT service: Digital Dashboard - Reset Password User	service_request	f	f	t	5	2025-07-01 11:47:58.673+08	2025-07-02 16:03:48.501+08
121	13	Domain - Reset Password	Corporate IT service: Domain - Reset Password	service_request	f	f	t	7	2025-07-01 11:47:58.674+08	2025-07-02 16:03:48.501+08
122	13	eLOS - Mutasi User	Corporate IT service: eLOS - Mutasi User	service_request	f	f	t	8	2025-07-01 11:47:58.675+08	2025-07-02 16:03:48.502+08
124	13	eLOS - Pendaftaran User	Corporate IT service: eLOS - Pendaftaran User	service_request	f	f	t	10	2025-07-01 11:47:58.676+08	2025-07-02 16:03:48.502+08
127	13	eLOS - Reset Password User	Corporate IT service: eLOS - Reset Password User	service_request	f	f	t	13	2025-07-01 11:47:58.678+08	2025-07-02 16:03:48.503+08
129	13	Ms. Office 365 - Reset Password	Corporate IT service: Ms. Office 365 - Reset Password	service_request	f	f	t	15	2025-07-01 11:47:58.679+08	2025-07-02 16:03:48.503+08
130	13	Payroll - Pendaftaran User	Corporate IT service: Payroll - Pendaftaran User	service_request	f	f	t	16	2025-07-01 11:47:58.679+08	2025-07-02 16:03:48.504+08
134	13	XReport - Pendaftaran User Baru	Corporate IT service: XReport - Pendaftaran User Baru	service_request	f	f	t	20	2025-07-01 11:47:58.682+08	2025-07-02 16:03:48.505+08
136	13	ARS73 - Mutasi User	Corporate IT service: ARS73 - Mutasi User	service_request	f	f	t	22	2025-07-01 11:47:58.683+08	2025-07-02 16:03:48.505+08
137	13	ARS73 - Pendaftaran User Baru	Corporate IT service: ARS73 - Pendaftaran User Baru	service_request	f	f	t	23	2025-07-01 11:47:58.683+08	2025-07-02 16:03:48.505+08
145	13	HRMS - Pengaktifan dan Reset Password User	Corporate IT service: HRMS - Pengaktifan dan Reset Password User	service_request	f	f	t	31	2025-07-01 11:47:58.688+08	2025-07-02 16:03:48.506+08
148	13	KMS - Reset Password	Corporate IT service: KMS - Reset Password	service_request	f	f	t	34	2025-07-01 11:47:58.69+08	2025-07-02 16:03:48.506+08
154	13	Teller App / Reporting - Mutasi User	Corporate IT service: Teller App / Reporting - Mutasi User	service_request	f	f	t	40	2025-07-01 11:47:58.694+08	2025-07-02 16:03:48.507+08
155	13	Teller App / Reporting - Pendaftaran User Baru	Corporate IT service: Teller App / Reporting - Pendaftaran User Baru	service_request	f	f	t	41	2025-07-01 11:47:58.694+08	2025-07-02 16:03:48.507+08
158	13	XCARD - Buka Blokir dan Reset Password	Corporate IT service: XCARD - Buka Blokir dan Reset Password	service_request	f	f	t	44	2025-07-01 11:47:58.696+08	2025-07-02 16:03:48.507+08
160	13	XCARD - Mutasi User	Corporate IT service: XCARD - Mutasi User	service_request	f	f	t	46	2025-07-01 11:47:58.697+08	2025-07-02 16:03:48.508+08
161	13	XCARD - Pendaftaran User Baru	Corporate IT service: XCARD - Pendaftaran User Baru	service_request	f	f	t	47	2025-07-01 11:47:58.697+08	2025-07-02 16:03:48.508+08
163	9	XCARD - Perubahan Menu	Corporate IT service: XCARD - Perubahan Menu	service_request	f	f	t	49	2025-07-01 11:47:58.698+08	2025-07-01 11:47:58.698+08
164	9	XLink - Error	Corporate IT service: XLink - Error	incident	f	f	t	50	2025-07-01 11:47:58.699+08	2025-07-01 11:47:58.699+08
166	9	XMonitoring ATM - Error Aplikasi	Corporate IT service: XMonitoring ATM - Error Aplikasi	incident	f	f	t	52	2025-07-01 11:47:58.7+08	2025-07-01 11:47:58.7+08
169	9	XMonitoring ATM - Perubahan User	Corporate IT service: XMonitoring ATM - Perubahan User	service_request	f	f	t	55	2025-07-01 11:47:58.702+08	2025-07-01 11:47:58.702+08
170	9	Gangguan Ekstranet BI	Corporate IT service: Gangguan Ekstranet BI	incident	f	f	t	56	2025-07-01 11:47:58.703+08	2025-07-01 11:47:58.703+08
171	9	Gangguan Internet	Corporate IT service: Gangguan Internet	incident	f	f	t	57	2025-07-01 11:47:58.703+08	2025-07-01 11:47:58.703+08
172	9	Gangguan LAN	Corporate IT service: Gangguan LAN	incident	f	f	t	58	2025-07-01 11:47:58.704+08	2025-07-01 11:47:58.704+08
173	9	Gangguan WAN	Corporate IT service: Gangguan WAN	incident	f	f	t	59	2025-07-01 11:47:58.708+08	2025-07-01 11:47:58.708+08
174	9	Maintenance Komputer	Corporate IT service: Maintenance Komputer	service_request	f	f	t	60	2025-07-01 11:47:58.708+08	2025-07-01 11:47:58.708+08
175	9	Memo ke Divisi TI	Corporate IT service: Memo ke Divisi TI	service_request	f	f	t	61	2025-07-01 11:47:58.709+08	2025-07-01 11:47:58.709+08
176	9	Network - Permintaan Pemasangan Jaringan	Corporate IT service: Network - Permintaan Pemasangan Jaringan	service_request	f	f	t	62	2025-07-01 11:47:58.711+08	2025-07-01 11:47:58.711+08
177	9	Permintaan Akses Flashdisk/Harddisk/SSD	Corporate IT service: Permintaan Akses Flashdisk/Harddisk/SSD	service_request	f	f	t	63	2025-07-01 11:47:58.712+08	2025-07-01 11:47:58.712+08
178	9	Permintaan Data Lain	Corporate IT service: Permintaan Data Lain	service_request	f	f	t	64	2025-07-01 11:47:58.719+08	2025-07-01 11:47:58.719+08
179	9	Permintaan Pengembangan Aplikasi	Corporate IT service: Permintaan Pengembangan Aplikasi	service_request	f	f	t	65	2025-07-01 11:47:58.719+08	2025-07-01 11:47:58.719+08
180	9	Permintaan Perubahan Nomor PK Kredit	Corporate IT service: Permintaan Perubahan Nomor PK Kredit	service_request	f	f	t	66	2025-07-01 11:47:58.72+08	2025-07-01 11:47:58.72+08
181	9	Permintaan Softcopy RC	Corporate IT service: Permintaan Softcopy RC	service_request	f	f	t	67	2025-07-01 11:47:58.721+08	2025-07-01 11:47:58.721+08
182	9	Surat ke Divisi TI	Corporate IT service: Surat ke Divisi TI	service_request	f	f	t	68	2025-07-01 11:47:58.721+08	2025-07-01 11:47:58.721+08
183	9	Technical Problem	Corporate IT service: Technical Problem	service_request	f	f	t	69	2025-07-01 11:47:58.722+08	2025-07-01 11:47:58.722+08
184	9	Card Center - Laporan Penerimaan Kartu ATM di Cabang	Corporate IT service: Card Center - Laporan Penerimaan Kartu ATM di Cabang	service_request	f	f	t	70	2025-07-01 11:47:58.723+08	2025-07-01 11:47:58.723+08
185	9	Card Center - Laporan Penerimaan PIN ATM di Cabang	Corporate IT service: Card Center - Laporan Penerimaan PIN ATM di Cabang	service_request	f	f	t	71	2025-07-01 11:47:58.723+08	2025-07-01 11:47:58.723+08
186	9	Card Center - Laporan Persediaan Kartu ATM	Corporate IT service: Card Center - Laporan Persediaan Kartu ATM	service_request	f	f	t	72	2025-07-01 11:47:58.723+08	2025-07-01 11:47:58.723+08
187	9	Penggantian Kartu	Corporate IT service: Penggantian Kartu	service_request	f	f	t	73	2025-07-01 11:47:58.724+08	2025-07-01 11:47:58.724+08
188	9	Penggantian PIN - Call Center	Corporate IT service: Penggantian PIN - Call Center	service_request	f	f	t	74	2025-07-01 11:47:58.724+08	2025-07-01 11:47:58.724+08
189	9	Penutupan Kartu	Corporate IT service: Penutupan Kartu	service_request	f	f	t	75	2025-07-01 11:47:58.725+08	2025-07-01 11:47:58.725+08
190	10	ATM-Pembayaran Citilink	Claims service: ATM-Pembayaran Citilink	service_request	f	f	t	1	2025-07-01 11:47:58.726+08	2025-07-01 11:47:58.726+08
191	10	ATM-Pembayaran PBB	Claims service: ATM-Pembayaran PBB	service_request	f	f	t	2	2025-07-01 11:47:58.727+08	2025-07-01 11:47:58.727+08
192	10	ATM-Pembayaran Samsat	Claims service: ATM-Pembayaran Samsat	service_request	f	f	t	3	2025-07-01 11:47:58.727+08	2025-07-01 11:47:58.727+08
193	10	ATM-Pembayaran Tagihan BigTV	Claims service: ATM-Pembayaran Tagihan BigTV	service_request	f	f	t	4	2025-07-01 11:47:58.728+08	2025-07-01 11:47:58.728+08
194	10	ATM-Pembayaran Tagihan BPJS	Claims service: ATM-Pembayaran Tagihan BPJS	service_request	f	f	t	5	2025-07-01 11:47:58.728+08	2025-07-01 11:47:58.728+08
195	10	ATM-Pembayaran Tagihan PLN	Claims service: ATM-Pembayaran Tagihan PLN	service_request	f	f	t	6	2025-07-01 11:47:58.729+08	2025-07-01 11:47:58.729+08
196	10	ATM-Pembayaran Tagihan PSTN	Claims service: ATM-Pembayaran Tagihan PSTN	service_request	f	f	t	7	2025-07-01 11:47:58.73+08	2025-07-01 11:47:58.73+08
197	10	ATM-Pembelian Pulsa Indosat	Claims service: ATM-Pembelian Pulsa Indosat	service_request	f	f	t	8	2025-07-01 11:47:58.73+08	2025-07-01 11:47:58.73+08
198	10	ATM-Pembelian Pulsa Telkomsel	Claims service: ATM-Pembelian Pulsa Telkomsel	service_request	f	f	t	9	2025-07-01 11:47:58.731+08	2025-07-01 11:47:58.731+08
199	10	ATM-Pembelian Pulsa Three	Claims service: ATM-Pembelian Pulsa Three	service_request	f	f	t	10	2025-07-01 11:47:58.731+08	2025-07-01 11:47:58.731+08
200	10	ATM-Pembelian Pulsa XL	Claims service: ATM-Pembelian Pulsa XL	service_request	f	f	t	11	2025-07-01 11:47:58.732+08	2025-07-01 11:47:58.732+08
201	10	ATM-Pembelian Token PLN	Claims service: ATM-Pembelian Token PLN	service_request	f	f	t	12	2025-07-01 11:47:58.733+08	2025-07-01 11:47:58.733+08
202	10	ATM-Penarikan ATM Bank Lain	Claims service: ATM-Penarikan ATM Bank Lain	service_request	f	f	t	13	2025-07-01 11:47:58.733+08	2025-07-01 11:47:58.733+08
203	10	ATM-Penarikan ATM Bank Lain >75 Hari	Claims service: ATM-Penarikan ATM Bank Lain >75 Hari	service_request	f	f	t	14	2025-07-01 11:47:58.734+08	2025-07-01 11:47:58.734+08
204	10	ATM-Penyelesaian Re-Klaim Bank Lain	Claims service: ATM-Penyelesaian Re-Klaim Bank Lain	service_request	f	f	t	15	2025-07-01 11:47:58.734+08	2025-07-01 11:47:58.734+08
205	10	ATM-Transfer ATM Bank Lain	Claims service: ATM-Transfer ATM Bank Lain	service_request	f	f	t	16	2025-07-01 11:47:58.735+08	2025-07-01 11:47:58.735+08
206	10	ATM-Transfer Bank Lain > 75 Hari	Claims service: ATM-Transfer Bank Lain > 75 Hari	service_request	f	f	t	17	2025-07-01 11:47:58.736+08	2025-07-01 11:47:58.736+08
207	10	BSG QRIS - Klaim BI Fast	Claims service: BSG QRIS - Klaim BI Fast	service_request	f	f	t	18	2025-07-01 11:47:58.737+08	2025-07-01 11:47:58.737+08
208	10	BSG QRIS - Klaim Gagal Transaksi	Claims service: BSG QRIS - Klaim Gagal Transaksi	service_request	f	f	t	19	2025-07-01 11:47:58.737+08	2025-07-01 11:47:58.737+08
209	10	BSG QRIS - Pembelian Data Telkomsel	Claims service: BSG QRIS - Pembelian Data Telkomsel	service_request	f	f	t	20	2025-07-01 11:47:58.738+08	2025-07-01 11:47:58.738+08
210	10	BSG QRIS - Pembelian Pulsa Telkomsel	Claims service: BSG QRIS - Pembelian Pulsa Telkomsel	service_request	f	f	t	21	2025-07-01 11:47:58.738+08	2025-07-01 11:47:58.738+08
211	10	BSGDebit/EDC - Pembayaran	Claims service: BSGDebit/EDC - Pembayaran	service_request	f	f	t	22	2025-07-01 11:47:58.739+08	2025-07-01 11:47:58.739+08
212	10	BSGtouch - Pembayaran PBB	Claims service: BSGtouch - Pembayaran PBB	service_request	f	f	t	23	2025-07-01 11:47:58.74+08	2025-07-01 11:47:58.74+08
213	10	BSGtouch - Pembayaran Samsat	Claims service: BSGtouch - Pembayaran Samsat	service_request	f	f	t	24	2025-07-01 11:47:58.74+08	2025-07-01 11:47:58.74+08
214	10	BSGtouch - Pembayaran Tagihan BPJS	Claims service: BSGtouch - Pembayaran Tagihan BPJS	service_request	f	f	t	25	2025-07-01 11:47:58.741+08	2025-07-01 11:47:58.741+08
215	10	BSGtouch - Pembayaran Tagihan Kartu Halo	Claims service: BSGtouch - Pembayaran Tagihan Kartu Halo	service_request	f	f	t	26	2025-07-01 11:47:58.741+08	2025-07-01 11:47:58.741+08
216	10	BSGtouch - Pembayaran Tagihan PDAM	Claims service: BSGtouch - Pembayaran Tagihan PDAM	service_request	f	f	t	27	2025-07-01 11:47:58.742+08	2025-07-01 11:47:58.742+08
217	10	BSGtouch - Pembayaran Tagihan PLN	Claims service: BSGtouch - Pembayaran Tagihan PLN	service_request	f	f	t	28	2025-07-01 11:47:58.743+08	2025-07-01 11:47:58.743+08
218	10	BSGtouch - Pembayaran Tagihan PSTN	Claims service: BSGtouch - Pembayaran Tagihan PSTN	service_request	f	f	t	29	2025-07-01 11:47:58.743+08	2025-07-01 11:47:58.743+08
167	13	XMonitoring ATM - Mutasi User	Corporate IT service: XMonitoring ATM - Mutasi User	service_request	f	f	t	53	2025-07-01 11:47:58.701+08	2025-07-02 16:03:48.509+08
168	13	XMonitoring ATM - Pendaftaran User	Corporate IT service: XMonitoring ATM - Pendaftaran User	service_request	f	f	t	54	2025-07-01 11:47:58.701+08	2025-07-02 16:03:48.509+08
219	10	BSGTouch - Pembelian Pulsa Indosat	Claims service: BSGTouch - Pembelian Pulsa Indosat	service_request	f	f	t	30	2025-07-01 11:47:58.744+08	2025-07-01 11:47:58.744+08
220	10	BSGTouch - Pembelian Pulsa Telkomsel	Claims service: BSGTouch - Pembelian Pulsa Telkomsel	service_request	f	f	t	31	2025-07-01 11:47:58.744+08	2025-07-01 11:47:58.744+08
221	10	BSGTouch - Pembelian Pulsa Three	Claims service: BSGTouch - Pembelian Pulsa Three	service_request	f	f	t	32	2025-07-01 11:47:58.745+08	2025-07-01 11:47:58.745+08
222	10	BSGTouch - Pembelian Pulsa XL	Claims service: BSGTouch - Pembelian Pulsa XL	service_request	f	f	t	33	2025-07-01 11:47:58.746+08	2025-07-01 11:47:58.746+08
223	10	BSGTouch - Pembelian Token PLN	Claims service: BSGTouch - Pembelian Token PLN	service_request	f	f	t	34	2025-07-01 11:47:58.746+08	2025-07-01 11:47:58.746+08
224	10	BSGTouch - Top-Up BSGcash	Claims service: BSGTouch - Top-Up BSGcash	service_request	f	f	t	35	2025-07-01 11:47:58.747+08	2025-07-01 11:47:58.747+08
225	10	BSGTouch - Transfer Antar Bank	Claims service: BSGTouch - Transfer Antar Bank	service_request	f	f	t	36	2025-07-01 11:47:58.747+08	2025-07-01 11:47:58.747+08
226	10	Keamanan Informasi	Claims service: Keamanan Informasi	service_request	f	f	t	37	2025-07-01 11:47:58.748+08	2025-07-01 11:47:58.748+08
228	10	SMSBanking-Pembayaran PBB	Claims service: SMSBanking-Pembayaran PBB	service_request	f	f	t	39	2025-07-01 11:47:58.749+08	2025-07-01 11:47:58.749+08
229	10	SMSBanking-Pembayaran Samsat	Claims service: SMSBanking-Pembayaran Samsat	service_request	f	f	t	40	2025-07-01 11:47:58.75+08	2025-07-01 11:47:58.75+08
230	10	SMSBanking-Pembayaran Tagihan BigTV	Claims service: SMSBanking-Pembayaran Tagihan BigTV	service_request	f	f	t	41	2025-07-01 11:47:58.75+08	2025-07-01 11:47:58.75+08
231	10	SMSBanking-Pembayaran Tagihan Kartu Halo	Claims service: SMSBanking-Pembayaran Tagihan Kartu Halo	service_request	f	f	t	42	2025-07-01 11:47:58.751+08	2025-07-01 11:47:58.751+08
232	10	SMSBanking-Pembayaran Tagihan PLN	Claims service: SMSBanking-Pembayaran Tagihan PLN	service_request	f	f	t	43	2025-07-01 11:47:58.752+08	2025-07-01 11:47:58.752+08
233	10	SMSBanking-Pembayaran Tagihan PSTN	Claims service: SMSBanking-Pembayaran Tagihan PSTN	service_request	f	f	t	44	2025-07-01 11:47:58.752+08	2025-07-01 11:47:58.752+08
234	10	SMSBanking-Pembelian Pulsa Indosat	Claims service: SMSBanking-Pembelian Pulsa Indosat	service_request	f	f	t	45	2025-07-01 11:47:58.753+08	2025-07-01 11:47:58.753+08
235	10	SMSBanking-Pembelian Pulsa Telkomsel	Claims service: SMSBanking-Pembelian Pulsa Telkomsel	service_request	f	f	t	46	2025-07-01 11:47:58.753+08	2025-07-01 11:47:58.753+08
236	10	SMSBanking-Pembelian Pulsa Three	Claims service: SMSBanking-Pembelian Pulsa Three	service_request	f	f	t	47	2025-07-01 11:47:58.754+08	2025-07-01 11:47:58.754+08
237	10	SMSBanking-Pembelian Pulsa XL	Claims service: SMSBanking-Pembelian Pulsa XL	service_request	f	f	t	48	2025-07-01 11:47:58.755+08	2025-07-01 11:47:58.755+08
238	10	SMSBanking-Pembelian Token PLN	Claims service: SMSBanking-Pembelian Token PLN	service_request	f	f	t	49	2025-07-01 11:47:58.755+08	2025-07-01 11:47:58.755+08
239	10	SMSBanking-Transfer Bank Lain	Claims service: SMSBanking-Transfer Bank Lain	service_request	f	f	t	50	2025-07-01 11:47:58.756+08	2025-07-01 11:47:58.756+08
240	10	SMSBanking-Transfer Bank Lain >75 Hari	Claims service: SMSBanking-Transfer Bank Lain >75 Hari	service_request	f	f	t	51	2025-07-01 11:47:58.756+08	2025-07-01 11:47:58.756+08
241	10	Teller App-Pembayaran Samsat	Claims service: Teller App-Pembayaran Samsat	service_request	f	f	t	52	2025-07-01 11:47:58.757+08	2025-07-01 11:47:58.757+08
242	10	Teller App / Reporting - Gagal Transaksi	Claims service: Teller App / Reporting - Gagal Transaksi	service_request	f	f	t	53	2025-07-01 11:47:58.758+08	2025-07-01 11:47:58.758+08
243	10	Hasil Rekonsiliasi	Claims service: Hasil Rekonsiliasi	service_request	f	f	t	54	2025-07-01 11:47:58.758+08	2025-07-01 11:47:58.758+08
244	10	Permintaan - Penyelesaian Selisih ATM	Claims service: Permintaan - Penyelesaian Selisih ATM	service_request	f	f	t	55	2025-07-01 11:47:58.759+08	2025-07-01 11:47:58.759+08
245	10	Permintaan - Upload Data DHN	Claims service: Permintaan - Upload Data DHN	service_request	f	f	t	56	2025-07-01 11:47:58.76+08	2025-07-01 11:47:58.76+08
246	10	Permintaan Data Softcopy Rekening Koran	Claims service: Permintaan Data Softcopy Rekening Koran	service_request	f	f	t	57	2025-07-01 11:47:58.76+08	2025-07-01 11:47:58.76+08
247	11	Default Request	General service: Default Request	service_request	f	f	t	1	2025-07-01 11:47:58.762+08	2025-07-01 11:47:58.762+08
248	11	Permintaan Lainnya	General service: Permintaan Lainnya	service_request	f	f	t	2	2025-07-01 11:47:58.762+08	2025-07-01 11:47:58.762+08
56	12	SIKP - Error Aplikasi	Specialized financial system service: SIKP - Error Aplikasi	service_request	f	f	t	47	2025-07-01 11:47:58.631+08	2025-07-02 16:03:48.488+08
64	12	Switching - Error Transaksi	Specialized financial system service: Switching - Error Transaksi	service_request	f	f	t	55	2025-07-01 11:47:58.635+08	2025-07-02 16:03:48.493+08
227	12	Samsat - Error Transaksi	Claims service: Samsat - Error Transaksi	service_request	f	f	t	38	2025-07-01 11:47:58.749+08	2025-07-02 16:03:48.499+08
115	13	Digital Dashboard - Mutasi user	Corporate IT service: Digital Dashboard - Mutasi user	service_request	f	f	t	1	2025-07-01 11:47:58.67+08	2025-07-02 16:03:48.499+08
133	13	Portal - IT Hepldesk - Pendaftaran User	Corporate IT service: Portal - IT Hepldesk - Pendaftaran User	service_request	f	f	t	19	2025-07-01 11:47:58.681+08	2025-07-02 16:03:48.504+08
165	13	XMonitoring ATM - Buka Blokir & Reset Password	Corporate IT service: XMonitoring ATM - Buka Blokir & Reset Password	service_request	f	f	t	51	2025-07-01 11:47:58.7+08	2025-07-02 16:03:48.509+08
\.


--
-- Data for Name: service_templates; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.service_templates (id, service_item_id, name, description, template_type, is_kasda_template, requires_business_approval, is_visible, sort_order, estimated_resolution_time, default_root_cause, default_issue_type, created_at, updated_at) FROM stdin;
4	24	OLIBS - Perubahan Menu & Limit Transaksi	Template for OLIBS - Perubahan Menu & Limit Transaksi requests	standard	f	t	t	1	\N	\N	\N	2025-07-01 11:51:00.314+08	2025-07-01 11:51:00.314+08
5	20	OLIBS - Mutasi User Pegawai	Template for OLIBS - Mutasi User Pegawai requests	standard	f	t	t	2	\N	\N	\N	2025-07-01 11:51:00.318+08	2025-07-01 11:51:00.318+08
6	23	OLIBS - Pendaftaran User Baru	Template for OLIBS - Pendaftaran User Baru requests	standard	f	t	t	3	\N	\N	\N	2025-07-01 11:51:00.32+08	2025-07-01 11:51:00.32+08
7	21	OLIBS - Non Aktif User	Template for OLIBS - Non Aktif User requests	standard	f	t	t	4	\N	\N	\N	2025-07-01 11:51:00.321+08	2025-07-01 11:51:00.321+08
8	22	OLIBS - Override Password	Template for OLIBS - Override Password requests	standard	f	t	t	5	\N	\N	\N	2025-07-01 11:51:00.323+08	2025-07-01 11:51:00.323+08
9	68	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	6	\N	\N	\N	2025-07-01 11:51:00.325+08	2025-07-01 11:51:00.325+08
10	69	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	7	\N	\N	\N	2025-07-01 11:51:00.327+08	2025-07-01 11:51:00.327+08
11	70	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	8	\N	\N	\N	2025-07-01 11:51:00.328+08	2025-07-01 11:51:00.328+08
12	71	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	9	\N	\N	\N	2025-07-01 11:51:00.329+08	2025-07-01 11:51:00.329+08
13	72	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	10	\N	\N	\N	2025-07-01 11:51:00.331+08	2025-07-01 11:51:00.331+08
14	73	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	11	\N	\N	\N	2025-07-01 11:51:00.332+08	2025-07-01 11:51:00.332+08
15	74	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	12	\N	\N	\N	2025-07-01 11:51:00.333+08	2025-07-01 11:51:00.333+08
16	75	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	13	\N	\N	\N	2025-07-01 11:51:00.334+08	2025-07-01 11:51:00.334+08
17	76	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	14	\N	\N	\N	2025-07-01 11:51:00.335+08	2025-07-01 11:51:00.335+08
18	77	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	15	\N	\N	\N	2025-07-01 11:51:00.336+08	2025-07-01 11:51:00.336+08
19	78	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	16	\N	\N	\N	2025-07-01 11:51:00.338+08	2025-07-01 11:51:00.338+08
20	79	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	17	\N	\N	\N	2025-07-01 11:51:00.339+08	2025-07-01 11:51:00.339+08
21	190	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	18	\N	\N	\N	2025-07-01 11:51:00.34+08	2025-07-01 11:51:00.34+08
22	191	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	19	\N	\N	\N	2025-07-01 11:51:00.341+08	2025-07-01 11:51:00.341+08
23	192	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	20	\N	\N	\N	2025-07-01 11:51:00.343+08	2025-07-01 11:51:00.343+08
24	193	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	21	\N	\N	\N	2025-07-01 11:51:00.344+08	2025-07-01 11:51:00.344+08
25	194	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	22	\N	\N	\N	2025-07-01 11:51:00.345+08	2025-07-01 11:51:00.345+08
26	195	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	23	\N	\N	\N	2025-07-01 11:51:00.346+08	2025-07-01 11:51:00.346+08
27	196	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	24	\N	\N	\N	2025-07-01 11:51:00.347+08	2025-07-01 11:51:00.347+08
28	197	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	25	\N	\N	\N	2025-07-01 11:51:00.349+08	2025-07-01 11:51:00.349+08
29	198	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	26	\N	\N	\N	2025-07-01 11:51:00.35+08	2025-07-01 11:51:00.35+08
30	199	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	27	\N	\N	\N	2025-07-01 11:51:00.351+08	2025-07-01 11:51:00.351+08
31	200	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	28	\N	\N	\N	2025-07-01 11:51:00.352+08	2025-07-01 11:51:00.352+08
32	201	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	29	\N	\N	\N	2025-07-01 11:51:00.353+08	2025-07-01 11:51:00.353+08
33	202	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	30	\N	\N	\N	2025-07-01 11:51:00.354+08	2025-07-01 11:51:00.354+08
34	203	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	31	\N	\N	\N	2025-07-01 11:51:00.355+08	2025-07-01 11:51:00.355+08
35	204	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	32	\N	\N	\N	2025-07-01 11:51:00.356+08	2025-07-01 11:51:00.356+08
36	205	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	33	\N	\N	\N	2025-07-01 11:51:00.357+08	2025-07-01 11:51:00.357+08
37	206	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	34	\N	\N	\N	2025-07-01 11:51:00.358+08	2025-07-01 11:51:00.358+08
38	207	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	35	\N	\N	\N	2025-07-01 11:51:00.359+08	2025-07-01 11:51:00.359+08
39	208	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	36	\N	\N	\N	2025-07-01 11:51:00.361+08	2025-07-01 11:51:00.361+08
40	209	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	37	\N	\N	\N	2025-07-01 11:51:00.361+08	2025-07-01 11:51:00.361+08
41	210	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	38	\N	\N	\N	2025-07-01 11:51:00.363+08	2025-07-01 11:51:00.363+08
42	211	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	39	\N	\N	\N	2025-07-01 11:51:00.364+08	2025-07-01 11:51:00.364+08
43	212	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	40	\N	\N	\N	2025-07-01 11:51:00.365+08	2025-07-01 11:51:00.365+08
44	213	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	41	\N	\N	\N	2025-07-01 11:51:00.366+08	2025-07-01 11:51:00.366+08
45	214	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	42	\N	\N	\N	2025-07-01 11:51:00.367+08	2025-07-01 11:51:00.367+08
46	215	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	43	\N	\N	\N	2025-07-01 11:51:00.369+08	2025-07-01 11:51:00.369+08
47	216	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	44	\N	\N	\N	2025-07-01 11:51:00.37+08	2025-07-01 11:51:00.37+08
48	217	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	45	\N	\N	\N	2025-07-01 11:51:00.373+08	2025-07-01 11:51:00.373+08
49	218	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	46	\N	\N	\N	2025-07-01 11:51:00.374+08	2025-07-01 11:51:00.374+08
50	219	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	47	\N	\N	\N	2025-07-01 11:51:00.375+08	2025-07-01 11:51:00.375+08
51	220	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	48	\N	\N	\N	2025-07-01 11:51:00.377+08	2025-07-01 11:51:00.377+08
52	221	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	49	\N	\N	\N	2025-07-01 11:51:00.378+08	2025-07-01 11:51:00.378+08
53	222	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	50	\N	\N	\N	2025-07-01 11:51:00.379+08	2025-07-01 11:51:00.379+08
54	223	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	51	\N	\N	\N	2025-07-01 11:51:00.381+08	2025-07-01 11:51:00.381+08
55	224	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	52	\N	\N	\N	2025-07-01 11:51:00.382+08	2025-07-01 11:51:00.382+08
56	225	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	53	\N	\N	\N	2025-07-01 11:51:00.383+08	2025-07-01 11:51:00.383+08
57	226	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	54	\N	\N	\N	2025-07-01 11:51:00.384+08	2025-07-01 11:51:00.384+08
58	227	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	55	\N	\N	\N	2025-07-01 11:51:00.385+08	2025-07-01 11:51:00.385+08
59	228	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	56	\N	\N	\N	2025-07-01 11:51:00.387+08	2025-07-01 11:51:00.387+08
60	229	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	57	\N	\N	\N	2025-07-01 11:51:00.388+08	2025-07-01 11:51:00.388+08
61	230	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	58	\N	\N	\N	2025-07-01 11:51:00.389+08	2025-07-01 11:51:00.389+08
62	231	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	59	\N	\N	\N	2025-07-01 11:51:00.39+08	2025-07-01 11:51:00.39+08
63	232	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	60	\N	\N	\N	2025-07-01 11:51:00.391+08	2025-07-01 11:51:00.391+08
64	233	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	61	\N	\N	\N	2025-07-01 11:51:00.392+08	2025-07-01 11:51:00.392+08
65	234	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	62	\N	\N	\N	2025-07-01 11:51:00.394+08	2025-07-01 11:51:00.394+08
66	235	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	63	\N	\N	\N	2025-07-01 11:51:00.395+08	2025-07-01 11:51:00.395+08
67	236	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	64	\N	\N	\N	2025-07-01 11:51:00.396+08	2025-07-01 11:51:00.396+08
68	237	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	65	\N	\N	\N	2025-07-01 11:51:00.397+08	2025-07-01 11:51:00.397+08
69	238	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	66	\N	\N	\N	2025-07-01 11:51:00.398+08	2025-07-01 11:51:00.398+08
70	239	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	67	\N	\N	\N	2025-07-01 11:51:00.4+08	2025-07-01 11:51:00.4+08
71	240	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	68	\N	\N	\N	2025-07-01 11:51:00.401+08	2025-07-01 11:51:00.401+08
72	241	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	69	\N	\N	\N	2025-07-01 11:51:00.403+08	2025-07-01 11:51:00.403+08
73	242	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	70	\N	\N	\N	2025-07-01 11:51:00.404+08	2025-07-01 11:51:00.404+08
74	243	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	71	\N	\N	\N	2025-07-01 11:51:00.405+08	2025-07-01 11:51:00.405+08
75	244	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	72	\N	\N	\N	2025-07-01 11:51:00.407+08	2025-07-01 11:51:00.407+08
76	245	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	73	\N	\N	\N	2025-07-01 11:51:00.408+08	2025-07-01 11:51:00.408+08
77	246	KLAIM - BSGTouch – Transfer Antar Bank	Template for KLAIM - BSGTouch – Transfer Antar Bank requests	standard	f	t	t	74	\N	\N	\N	2025-07-01 11:51:00.409+08	2025-07-01 11:51:00.409+08
78	68	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	75	\N	\N	\N	2025-07-01 11:51:00.41+08	2025-07-01 11:51:00.41+08
79	69	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	76	\N	\N	\N	2025-07-01 11:51:00.411+08	2025-07-01 11:51:00.411+08
80	70	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	77	\N	\N	\N	2025-07-01 11:51:00.412+08	2025-07-01 11:51:00.412+08
81	71	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	78	\N	\N	\N	2025-07-01 11:51:00.414+08	2025-07-01 11:51:00.414+08
82	72	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	79	\N	\N	\N	2025-07-01 11:51:00.415+08	2025-07-01 11:51:00.415+08
83	73	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	80	\N	\N	\N	2025-07-01 11:51:00.416+08	2025-07-01 11:51:00.416+08
84	74	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	81	\N	\N	\N	2025-07-01 11:51:00.418+08	2025-07-01 11:51:00.418+08
85	75	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	82	\N	\N	\N	2025-07-01 11:51:00.419+08	2025-07-01 11:51:00.419+08
86	76	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	83	\N	\N	\N	2025-07-01 11:51:00.42+08	2025-07-01 11:51:00.42+08
87	77	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	84	\N	\N	\N	2025-07-01 11:51:00.421+08	2025-07-01 11:51:00.421+08
88	78	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	85	\N	\N	\N	2025-07-01 11:51:00.422+08	2025-07-01 11:51:00.422+08
89	79	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	86	\N	\N	\N	2025-07-01 11:51:00.423+08	2025-07-01 11:51:00.423+08
90	190	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	87	\N	\N	\N	2025-07-01 11:51:00.425+08	2025-07-01 11:51:00.425+08
91	191	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	88	\N	\N	\N	2025-07-01 11:51:00.426+08	2025-07-01 11:51:00.426+08
92	192	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	89	\N	\N	\N	2025-07-01 11:51:00.427+08	2025-07-01 11:51:00.427+08
93	193	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	90	\N	\N	\N	2025-07-01 11:51:00.428+08	2025-07-01 11:51:00.428+08
94	194	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	91	\N	\N	\N	2025-07-01 11:51:00.429+08	2025-07-01 11:51:00.429+08
95	195	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	92	\N	\N	\N	2025-07-01 11:51:00.43+08	2025-07-01 11:51:00.43+08
96	196	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	93	\N	\N	\N	2025-07-01 11:51:00.431+08	2025-07-01 11:51:00.431+08
97	197	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	94	\N	\N	\N	2025-07-01 11:51:00.431+08	2025-07-01 11:51:00.431+08
98	198	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	95	\N	\N	\N	2025-07-01 11:51:00.432+08	2025-07-01 11:51:00.432+08
99	199	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	96	\N	\N	\N	2025-07-01 11:51:00.433+08	2025-07-01 11:51:00.433+08
100	200	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	97	\N	\N	\N	2025-07-01 11:51:00.434+08	2025-07-01 11:51:00.434+08
101	201	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	98	\N	\N	\N	2025-07-01 11:51:00.435+08	2025-07-01 11:51:00.435+08
102	202	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	99	\N	\N	\N	2025-07-01 11:51:00.437+08	2025-07-01 11:51:00.437+08
103	203	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	100	\N	\N	\N	2025-07-01 11:51:00.438+08	2025-07-01 11:51:00.438+08
104	204	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	101	\N	\N	\N	2025-07-01 11:51:00.439+08	2025-07-01 11:51:00.439+08
105	205	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	102	\N	\N	\N	2025-07-01 11:51:00.44+08	2025-07-01 11:51:00.44+08
106	206	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	103	\N	\N	\N	2025-07-01 11:51:00.441+08	2025-07-01 11:51:00.441+08
107	207	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	104	\N	\N	\N	2025-07-01 11:51:00.443+08	2025-07-01 11:51:00.443+08
108	208	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	105	\N	\N	\N	2025-07-01 11:51:00.444+08	2025-07-01 11:51:00.444+08
109	209	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	106	\N	\N	\N	2025-07-01 11:51:00.445+08	2025-07-01 11:51:00.445+08
110	210	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	107	\N	\N	\N	2025-07-01 11:51:00.446+08	2025-07-01 11:51:00.446+08
111	211	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	108	\N	\N	\N	2025-07-01 11:51:00.446+08	2025-07-01 11:51:00.446+08
112	212	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	109	\N	\N	\N	2025-07-01 11:51:00.448+08	2025-07-01 11:51:00.448+08
113	213	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	110	\N	\N	\N	2025-07-01 11:51:00.449+08	2025-07-01 11:51:00.449+08
114	214	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	111	\N	\N	\N	2025-07-01 11:51:00.45+08	2025-07-01 11:51:00.45+08
115	215	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	112	\N	\N	\N	2025-07-01 11:51:00.451+08	2025-07-01 11:51:00.451+08
116	216	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	113	\N	\N	\N	2025-07-01 11:51:00.452+08	2025-07-01 11:51:00.452+08
117	217	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	114	\N	\N	\N	2025-07-01 11:51:00.454+08	2025-07-01 11:51:00.454+08
118	218	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	115	\N	\N	\N	2025-07-01 11:51:00.455+08	2025-07-01 11:51:00.455+08
119	219	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	116	\N	\N	\N	2025-07-01 11:51:00.456+08	2025-07-01 11:51:00.456+08
120	220	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	117	\N	\N	\N	2025-07-01 11:51:00.457+08	2025-07-01 11:51:00.457+08
121	221	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	118	\N	\N	\N	2025-07-01 11:51:00.459+08	2025-07-01 11:51:00.459+08
122	222	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	119	\N	\N	\N	2025-07-01 11:51:00.46+08	2025-07-01 11:51:00.46+08
123	223	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	120	\N	\N	\N	2025-07-01 11:51:00.461+08	2025-07-01 11:51:00.461+08
124	224	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	121	\N	\N	\N	2025-07-01 11:51:00.462+08	2025-07-01 11:51:00.462+08
125	225	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	122	\N	\N	\N	2025-07-01 11:51:00.463+08	2025-07-01 11:51:00.463+08
126	226	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	123	\N	\N	\N	2025-07-01 11:51:00.464+08	2025-07-01 11:51:00.464+08
127	227	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	124	\N	\N	\N	2025-07-01 11:51:00.466+08	2025-07-01 11:51:00.466+08
128	228	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	125	\N	\N	\N	2025-07-01 11:51:00.467+08	2025-07-01 11:51:00.467+08
129	229	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	126	\N	\N	\N	2025-07-01 11:51:00.468+08	2025-07-01 11:51:00.468+08
130	230	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	127	\N	\N	\N	2025-07-01 11:51:00.469+08	2025-07-01 11:51:00.469+08
131	231	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	128	\N	\N	\N	2025-07-01 11:51:00.471+08	2025-07-01 11:51:00.471+08
132	232	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	129	\N	\N	\N	2025-07-01 11:51:00.472+08	2025-07-01 11:51:00.472+08
133	233	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	130	\N	\N	\N	2025-07-01 11:51:00.473+08	2025-07-01 11:51:00.473+08
134	234	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	131	\N	\N	\N	2025-07-01 11:51:00.475+08	2025-07-01 11:51:00.475+08
135	235	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	132	\N	\N	\N	2025-07-01 11:51:00.476+08	2025-07-01 11:51:00.476+08
136	236	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	133	\N	\N	\N	2025-07-01 11:51:00.476+08	2025-07-01 11:51:00.476+08
137	237	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	134	\N	\N	\N	2025-07-01 11:51:00.478+08	2025-07-01 11:51:00.478+08
138	238	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	135	\N	\N	\N	2025-07-01 11:51:00.479+08	2025-07-01 11:51:00.479+08
139	239	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	136	\N	\N	\N	2025-07-01 11:51:00.48+08	2025-07-01 11:51:00.48+08
140	240	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	137	\N	\N	\N	2025-07-01 11:51:00.481+08	2025-07-01 11:51:00.481+08
141	241	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	138	\N	\N	\N	2025-07-01 11:51:00.482+08	2025-07-01 11:51:00.482+08
142	242	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	139	\N	\N	\N	2025-07-01 11:51:00.484+08	2025-07-01 11:51:00.484+08
143	243	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	140	\N	\N	\N	2025-07-01 11:51:00.485+08	2025-07-01 11:51:00.485+08
144	244	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	141	\N	\N	\N	2025-07-01 11:51:00.486+08	2025-07-01 11:51:00.486+08
145	245	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	142	\N	\N	\N	2025-07-01 11:51:00.487+08	2025-07-01 11:51:00.487+08
146	246	KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	Template for KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi requests	standard	f	t	t	143	\N	\N	\N	2025-07-01 11:51:00.489+08	2025-07-01 11:51:00.489+08
147	158	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	standard	f	t	t	144	\N	\N	\N	2025-07-01 11:51:00.49+08	2025-07-01 11:51:00.49+08
148	159	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	standard	f	t	t	145	\N	\N	\N	2025-07-01 11:51:00.491+08	2025-07-01 11:51:00.491+08
149	160	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	standard	f	t	t	146	\N	\N	\N	2025-07-01 11:51:00.493+08	2025-07-01 11:51:00.493+08
150	161	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	standard	f	t	t	147	\N	\N	\N	2025-07-01 11:51:00.494+08	2025-07-01 11:51:00.494+08
151	162	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	standard	f	t	t	148	\N	\N	\N	2025-07-01 11:51:00.495+08	2025-07-01 11:51:00.495+08
152	163	XCARD - Buka Blokir dan Reset Password	Template for XCARD - Buka Blokir dan Reset Password requests	standard	f	t	t	149	\N	\N	\N	2025-07-01 11:51:00.496+08	2025-07-01 11:51:00.496+08
153	158	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	standard	f	t	t	150	\N	\N	\N	2025-07-01 11:51:00.497+08	2025-07-01 11:51:00.497+08
154	159	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	standard	f	t	t	151	\N	\N	\N	2025-07-01 11:51:00.498+08	2025-07-01 11:51:00.498+08
155	160	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	standard	f	t	t	152	\N	\N	\N	2025-07-01 11:51:00.5+08	2025-07-01 11:51:00.5+08
156	161	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	standard	f	t	t	153	\N	\N	\N	2025-07-01 11:51:00.501+08	2025-07-01 11:51:00.501+08
157	162	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	standard	f	t	t	154	\N	\N	\N	2025-07-01 11:51:00.502+08	2025-07-01 11:51:00.502+08
158	163	XCARD - Pendaftaran User Baru	Template for XCARD - Pendaftaran User Baru requests	standard	f	t	t	155	\N	\N	\N	2025-07-01 11:51:00.503+08	2025-07-01 11:51:00.503+08
159	91	BSG QRIS - Pendaftaran User	Template for BSG QRIS - Pendaftaran User requests	standard	f	t	t	156	\N	\N	\N	2025-07-01 11:51:00.504+08	2025-07-01 11:51:00.504+08
160	92	BSG QRIS - Perpanjang Masa Berlaku	Template for BSG QRIS - Perpanjang Masa Berlaku requests	standard	f	t	t	157	\N	\N	\N	2025-07-01 11:51:00.506+08	2025-07-01 11:51:00.506+08
161	88	BSG QRIS - Buka Blokir & Reset Password	Template for BSG QRIS - Buka Blokir & Reset Password requests	standard	f	t	t	158	\N	\N	\N	2025-07-01 11:51:00.507+08	2025-07-01 11:51:00.507+08
162	68	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	159	\N	\N	\N	2025-07-01 11:51:00.508+08	2025-07-01 11:51:00.508+08
163	69	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	160	\N	\N	\N	2025-07-01 11:51:00.509+08	2025-07-01 11:51:00.509+08
164	70	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	161	\N	\N	\N	2025-07-01 11:51:00.511+08	2025-07-01 11:51:00.511+08
165	71	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	162	\N	\N	\N	2025-07-01 11:51:00.512+08	2025-07-01 11:51:00.512+08
166	72	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	163	\N	\N	\N	2025-07-01 11:51:00.513+08	2025-07-01 11:51:00.513+08
167	73	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	164	\N	\N	\N	2025-07-01 11:51:00.514+08	2025-07-01 11:51:00.514+08
168	74	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	165	\N	\N	\N	2025-07-01 11:51:00.515+08	2025-07-01 11:51:00.515+08
169	75	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	166	\N	\N	\N	2025-07-01 11:51:00.516+08	2025-07-01 11:51:00.516+08
170	76	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	167	\N	\N	\N	2025-07-01 11:51:00.518+08	2025-07-01 11:51:00.518+08
171	77	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	168	\N	\N	\N	2025-07-01 11:51:00.519+08	2025-07-01 11:51:00.519+08
172	78	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	169	\N	\N	\N	2025-07-01 11:51:00.52+08	2025-07-01 11:51:00.52+08
173	79	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	170	\N	\N	\N	2025-07-01 11:51:00.521+08	2025-07-01 11:51:00.521+08
174	212	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	171	\N	\N	\N	2025-07-01 11:51:00.522+08	2025-07-01 11:51:00.522+08
175	213	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	172	\N	\N	\N	2025-07-01 11:51:00.524+08	2025-07-01 11:51:00.524+08
176	214	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	173	\N	\N	\N	2025-07-01 11:51:00.525+08	2025-07-01 11:51:00.525+08
177	215	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	174	\N	\N	\N	2025-07-01 11:51:00.526+08	2025-07-01 11:51:00.526+08
178	216	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	175	\N	\N	\N	2025-07-01 11:51:00.527+08	2025-07-01 11:51:00.527+08
179	217	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	176	\N	\N	\N	2025-07-01 11:51:00.528+08	2025-07-01 11:51:00.528+08
180	218	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	177	\N	\N	\N	2025-07-01 11:51:00.53+08	2025-07-01 11:51:00.53+08
181	219	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	178	\N	\N	\N	2025-07-01 11:51:00.531+08	2025-07-01 11:51:00.531+08
182	220	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	179	\N	\N	\N	2025-07-01 11:51:00.532+08	2025-07-01 11:51:00.532+08
183	221	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	180	\N	\N	\N	2025-07-01 11:51:00.533+08	2025-07-01 11:51:00.533+08
184	222	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	181	\N	\N	\N	2025-07-01 11:51:00.534+08	2025-07-01 11:51:00.534+08
185	223	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	182	\N	\N	\N	2025-07-01 11:51:00.536+08	2025-07-01 11:51:00.536+08
186	224	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	183	\N	\N	\N	2025-07-01 11:51:00.537+08	2025-07-01 11:51:00.537+08
187	225	BSGTouch - Pendaftaran User	Template for BSGTouch - Pendaftaran User requests	standard	f	t	t	184	\N	\N	\N	2025-07-01 11:51:00.538+08	2025-07-01 11:51:00.538+08
188	68	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	185	\N	\N	\N	2025-07-01 11:51:00.539+08	2025-07-01 11:51:00.539+08
189	69	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	186	\N	\N	\N	2025-07-01 11:51:00.54+08	2025-07-01 11:51:00.54+08
190	70	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	187	\N	\N	\N	2025-07-01 11:51:00.541+08	2025-07-01 11:51:00.541+08
191	71	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	188	\N	\N	\N	2025-07-01 11:51:00.543+08	2025-07-01 11:51:00.543+08
192	72	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	189	\N	\N	\N	2025-07-01 11:51:00.544+08	2025-07-01 11:51:00.544+08
193	73	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	190	\N	\N	\N	2025-07-01 11:51:00.545+08	2025-07-01 11:51:00.545+08
194	74	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	191	\N	\N	\N	2025-07-01 11:51:00.547+08	2025-07-01 11:51:00.547+08
195	75	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	192	\N	\N	\N	2025-07-01 11:51:00.548+08	2025-07-01 11:51:00.548+08
196	76	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	193	\N	\N	\N	2025-07-01 11:51:00.549+08	2025-07-01 11:51:00.549+08
197	77	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	194	\N	\N	\N	2025-07-01 11:51:00.55+08	2025-07-01 11:51:00.55+08
198	78	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	195	\N	\N	\N	2025-07-01 11:51:00.551+08	2025-07-01 11:51:00.551+08
199	79	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	196	\N	\N	\N	2025-07-01 11:51:00.553+08	2025-07-01 11:51:00.553+08
200	212	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	197	\N	\N	\N	2025-07-01 11:51:00.554+08	2025-07-01 11:51:00.554+08
201	213	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	198	\N	\N	\N	2025-07-01 11:51:00.555+08	2025-07-01 11:51:00.555+08
202	214	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	199	\N	\N	\N	2025-07-01 11:51:00.556+08	2025-07-01 11:51:00.556+08
203	215	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	200	\N	\N	\N	2025-07-01 11:51:00.557+08	2025-07-01 11:51:00.557+08
204	216	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	201	\N	\N	\N	2025-07-01 11:51:00.559+08	2025-07-01 11:51:00.559+08
205	217	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	202	\N	\N	\N	2025-07-01 11:51:00.56+08	2025-07-01 11:51:00.56+08
206	218	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	203	\N	\N	\N	2025-07-01 11:51:00.561+08	2025-07-01 11:51:00.561+08
207	219	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	204	\N	\N	\N	2025-07-01 11:51:00.562+08	2025-07-01 11:51:00.562+08
208	220	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	205	\N	\N	\N	2025-07-01 11:51:00.564+08	2025-07-01 11:51:00.564+08
209	221	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	206	\N	\N	\N	2025-07-01 11:51:00.565+08	2025-07-01 11:51:00.565+08
210	222	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	207	\N	\N	\N	2025-07-01 11:51:00.566+08	2025-07-01 11:51:00.566+08
211	223	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	208	\N	\N	\N	2025-07-01 11:51:00.567+08	2025-07-01 11:51:00.567+08
212	224	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	209	\N	\N	\N	2025-07-01 11:51:00.568+08	2025-07-01 11:51:00.568+08
213	225	BSGTouch - Perubahan User	Template for BSGTouch - Perubahan User requests	standard	f	t	t	210	\N	\N	\N	2025-07-01 11:51:00.57+08	2025-07-01 11:51:00.57+08
214	68	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	211	\N	\N	\N	2025-07-01 11:51:00.571+08	2025-07-01 11:51:00.571+08
215	69	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	212	\N	\N	\N	2025-07-01 11:51:00.572+08	2025-07-01 11:51:00.572+08
216	70	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	213	\N	\N	\N	2025-07-01 11:51:00.573+08	2025-07-01 11:51:00.573+08
217	71	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	214	\N	\N	\N	2025-07-01 11:51:00.574+08	2025-07-01 11:51:00.574+08
218	72	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	215	\N	\N	\N	2025-07-01 11:51:00.576+08	2025-07-01 11:51:00.576+08
219	73	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	216	\N	\N	\N	2025-07-01 11:51:00.577+08	2025-07-01 11:51:00.577+08
220	74	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	217	\N	\N	\N	2025-07-01 11:51:00.578+08	2025-07-01 11:51:00.578+08
221	75	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	218	\N	\N	\N	2025-07-01 11:51:00.579+08	2025-07-01 11:51:00.579+08
222	76	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	219	\N	\N	\N	2025-07-01 11:51:00.58+08	2025-07-01 11:51:00.58+08
223	77	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	220	\N	\N	\N	2025-07-01 11:51:00.582+08	2025-07-01 11:51:00.582+08
224	78	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	221	\N	\N	\N	2025-07-01 11:51:00.583+08	2025-07-01 11:51:00.583+08
225	79	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	222	\N	\N	\N	2025-07-01 11:51:00.584+08	2025-07-01 11:51:00.584+08
226	212	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	223	\N	\N	\N	2025-07-01 11:51:00.586+08	2025-07-01 11:51:00.586+08
227	213	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	224	\N	\N	\N	2025-07-01 11:51:00.587+08	2025-07-01 11:51:00.587+08
228	214	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	225	\N	\N	\N	2025-07-01 11:51:00.588+08	2025-07-01 11:51:00.588+08
229	215	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	226	\N	\N	\N	2025-07-01 11:51:00.589+08	2025-07-01 11:51:00.589+08
230	216	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	227	\N	\N	\N	2025-07-01 11:51:00.591+08	2025-07-01 11:51:00.591+08
231	217	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	228	\N	\N	\N	2025-07-01 11:51:00.592+08	2025-07-01 11:51:00.592+08
232	218	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	229	\N	\N	\N	2025-07-01 11:51:00.593+08	2025-07-01 11:51:00.593+08
233	219	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	230	\N	\N	\N	2025-07-01 11:51:00.595+08	2025-07-01 11:51:00.595+08
234	220	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	231	\N	\N	\N	2025-07-01 11:51:00.596+08	2025-07-01 11:51:00.596+08
235	221	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	232	\N	\N	\N	2025-07-01 11:51:00.597+08	2025-07-01 11:51:00.597+08
236	222	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	233	\N	\N	\N	2025-07-01 11:51:00.597+08	2025-07-01 11:51:00.597+08
237	223	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	234	\N	\N	\N	2025-07-01 11:51:00.598+08	2025-07-01 11:51:00.598+08
238	224	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	235	\N	\N	\N	2025-07-01 11:51:00.6+08	2025-07-01 11:51:00.6+08
239	225	BSGTouch - Perpanjang Masa Berlaku	Template for BSGTouch - Perpanjang Masa Berlaku requests	standard	f	t	t	236	\N	\N	\N	2025-07-01 11:51:00.601+08	2025-07-01 11:51:00.601+08
240	68	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	237	\N	\N	\N	2025-07-01 11:51:00.602+08	2025-07-01 11:51:00.602+08
241	69	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	238	\N	\N	\N	2025-07-01 11:51:00.603+08	2025-07-01 11:51:00.603+08
242	70	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	239	\N	\N	\N	2025-07-01 11:51:00.605+08	2025-07-01 11:51:00.605+08
243	71	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	240	\N	\N	\N	2025-07-01 11:51:00.606+08	2025-07-01 11:51:00.606+08
244	72	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	241	\N	\N	\N	2025-07-01 11:51:00.607+08	2025-07-01 11:51:00.607+08
245	73	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	242	\N	\N	\N	2025-07-01 11:51:00.608+08	2025-07-01 11:51:00.608+08
246	74	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	243	\N	\N	\N	2025-07-01 11:51:00.609+08	2025-07-01 11:51:00.609+08
247	75	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	244	\N	\N	\N	2025-07-01 11:51:00.61+08	2025-07-01 11:51:00.61+08
248	76	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	245	\N	\N	\N	2025-07-01 11:51:00.611+08	2025-07-01 11:51:00.611+08
249	77	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	246	\N	\N	\N	2025-07-01 11:51:00.612+08	2025-07-01 11:51:00.612+08
250	78	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	247	\N	\N	\N	2025-07-01 11:51:00.613+08	2025-07-01 11:51:00.613+08
251	79	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	248	\N	\N	\N	2025-07-01 11:51:00.615+08	2025-07-01 11:51:00.615+08
252	212	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	249	\N	\N	\N	2025-07-01 11:51:00.616+08	2025-07-01 11:51:00.616+08
253	213	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	250	\N	\N	\N	2025-07-01 11:51:00.618+08	2025-07-01 11:51:00.618+08
254	214	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	251	\N	\N	\N	2025-07-01 11:51:00.619+08	2025-07-01 11:51:00.619+08
255	215	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	252	\N	\N	\N	2025-07-01 11:51:00.62+08	2025-07-01 11:51:00.62+08
256	216	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	253	\N	\N	\N	2025-07-01 11:51:00.621+08	2025-07-01 11:51:00.621+08
257	217	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	254	\N	\N	\N	2025-07-01 11:51:00.622+08	2025-07-01 11:51:00.622+08
258	218	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	255	\N	\N	\N	2025-07-01 11:51:00.624+08	2025-07-01 11:51:00.624+08
259	219	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	256	\N	\N	\N	2025-07-01 11:51:00.625+08	2025-07-01 11:51:00.625+08
260	220	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	257	\N	\N	\N	2025-07-01 11:51:00.626+08	2025-07-01 11:51:00.626+08
261	221	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	258	\N	\N	\N	2025-07-01 11:51:00.627+08	2025-07-01 11:51:00.627+08
262	222	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	259	\N	\N	\N	2025-07-01 11:51:00.628+08	2025-07-01 11:51:00.628+08
263	223	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	260	\N	\N	\N	2025-07-01 11:51:00.63+08	2025-07-01 11:51:00.63+08
264	224	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	261	\N	\N	\N	2025-07-01 11:51:00.631+08	2025-07-01 11:51:00.631+08
265	225	BSGTouch - Mutasi User	Template for BSGTouch - Mutasi User requests	standard	f	t	t	262	\N	\N	\N	2025-07-01 11:51:00.632+08	2025-07-01 11:51:00.632+08
266	94	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	263	\N	\N	\N	2025-07-01 11:51:00.633+08	2025-07-01 11:51:00.633+08
267	95	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	264	\N	\N	\N	2025-07-01 11:51:00.634+08	2025-07-01 11:51:00.634+08
268	96	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	265	\N	\N	\N	2025-07-01 11:51:00.636+08	2025-07-01 11:51:00.636+08
269	97	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	266	\N	\N	\N	2025-07-01 11:51:00.637+08	2025-07-01 11:51:00.637+08
270	98	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	267	\N	\N	\N	2025-07-01 11:51:00.638+08	2025-07-01 11:51:00.638+08
271	99	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	268	\N	\N	\N	2025-07-01 11:51:00.639+08	2025-07-01 11:51:00.639+08
272	100	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	269	\N	\N	\N	2025-07-01 11:51:00.64+08	2025-07-01 11:51:00.64+08
273	101	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	270	\N	\N	\N	2025-07-01 11:51:00.642+08	2025-07-01 11:51:00.642+08
274	102	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	271	\N	\N	\N	2025-07-01 11:51:00.643+08	2025-07-01 11:51:00.643+08
275	103	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	272	\N	\N	\N	2025-07-01 11:51:00.644+08	2025-07-01 11:51:00.644+08
276	104	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	273	\N	\N	\N	2025-07-01 11:51:00.645+08	2025-07-01 11:51:00.645+08
277	105	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	274	\N	\N	\N	2025-07-01 11:51:00.646+08	2025-07-01 11:51:00.646+08
278	106	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	275	\N	\N	\N	2025-07-01 11:51:00.647+08	2025-07-01 11:51:00.647+08
279	107	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	276	\N	\N	\N	2025-07-01 11:51:00.648+08	2025-07-01 11:51:00.648+08
280	165	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	277	\N	\N	\N	2025-07-01 11:51:00.65+08	2025-07-01 11:51:00.65+08
281	166	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	278	\N	\N	\N	2025-07-01 11:51:00.651+08	2025-07-01 11:51:00.651+08
282	167	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	279	\N	\N	\N	2025-07-01 11:51:00.652+08	2025-07-01 11:51:00.652+08
283	168	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	280	\N	\N	\N	2025-07-01 11:51:00.653+08	2025-07-01 11:51:00.653+08
284	169	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	281	\N	\N	\N	2025-07-01 11:51:00.654+08	2025-07-01 11:51:00.654+08
285	184	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	282	\N	\N	\N	2025-07-01 11:51:00.656+08	2025-07-01 11:51:00.656+08
286	185	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	283	\N	\N	\N	2025-07-01 11:51:00.657+08	2025-07-01 11:51:00.657+08
287	186	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	284	\N	\N	\N	2025-07-01 11:51:00.658+08	2025-07-01 11:51:00.658+08
288	190	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	285	\N	\N	\N	2025-07-01 11:51:00.659+08	2025-07-01 11:51:00.659+08
289	191	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	286	\N	\N	\N	2025-07-01 11:51:00.66+08	2025-07-01 11:51:00.66+08
290	192	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	287	\N	\N	\N	2025-07-01 11:51:00.661+08	2025-07-01 11:51:00.661+08
291	193	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	288	\N	\N	\N	2025-07-01 11:51:00.663+08	2025-07-01 11:51:00.663+08
292	194	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	289	\N	\N	\N	2025-07-01 11:51:00.664+08	2025-07-01 11:51:00.664+08
293	195	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	290	\N	\N	\N	2025-07-01 11:51:00.665+08	2025-07-01 11:51:00.665+08
294	196	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	291	\N	\N	\N	2025-07-01 11:51:00.666+08	2025-07-01 11:51:00.666+08
295	197	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	292	\N	\N	\N	2025-07-01 11:51:00.667+08	2025-07-01 11:51:00.667+08
296	198	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	293	\N	\N	\N	2025-07-01 11:51:00.668+08	2025-07-01 11:51:00.668+08
297	199	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	294	\N	\N	\N	2025-07-01 11:51:00.669+08	2025-07-01 11:51:00.669+08
298	200	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	295	\N	\N	\N	2025-07-01 11:51:00.67+08	2025-07-01 11:51:00.67+08
299	201	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	296	\N	\N	\N	2025-07-01 11:51:00.673+08	2025-07-01 11:51:00.673+08
300	202	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	297	\N	\N	\N	2025-07-01 11:51:00.674+08	2025-07-01 11:51:00.674+08
301	203	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	298	\N	\N	\N	2025-07-01 11:51:00.675+08	2025-07-01 11:51:00.675+08
302	204	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	299	\N	\N	\N	2025-07-01 11:51:00.676+08	2025-07-01 11:51:00.676+08
303	205	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	300	\N	\N	\N	2025-07-01 11:51:00.677+08	2025-07-01 11:51:00.677+08
304	206	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	301	\N	\N	\N	2025-07-01 11:51:00.678+08	2025-07-01 11:51:00.678+08
305	244	ATM - PERMASALAHAN TEKNIS	Template for ATM - PERMASALAHAN TEKNIS requests	standard	f	t	t	302	\N	\N	\N	2025-07-01 11:51:00.68+08	2025-07-01 11:51:00.68+08
306	85	SMS BANKING - Pendaftaran User	Template for SMS BANKING - Pendaftaran User requests	standard	f	t	t	303	\N	\N	\N	2025-07-01 11:51:00.681+08	2025-07-01 11:51:00.681+08
307	86	SMS BANKING - Perubahan User	Template for SMS BANKING - Perubahan User requests	standard	f	t	t	304	\N	\N	\N	2025-07-01 11:51:00.682+08	2025-07-01 11:51:00.682+08
308	84	SMS BANKING - Mutasi User	Template for SMS BANKING - Mutasi User requests	standard	f	t	t	305	\N	\N	\N	2025-07-01 11:51:00.684+08	2025-07-01 11:51:00.684+08
322	88	BSG - Buka Blokir & Reset Password	BSG Template: BSG QRIS - Buka Blokir & Reset Password (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.605+08	2025-07-01 12:51:19.359+08
309	25	BSG - Perubahan Menu & Limit Transaksi	BSG Template: OLIBS - Perubahan Menu & Limit Transaksi (7 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.518+08	2025-07-01 12:51:19.27+08
310	20	BSG - Mutasi User Pegawai	BSG Template: OLIBS - Mutasi User Pegawai (9 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.538+08	2025-07-01 12:51:19.294+08
311	23	BSG - Pendaftaran User Baru	BSG Template: OLIBS - Pendaftaran User Baru (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.547+08	2025-07-01 12:51:19.304+08
312	21	BSG - Non Aktif User	BSG Template: OLIBS - Non Aktif User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.552+08	2025-07-01 12:51:19.31+08
313	22	BSG - Override Password	BSG Template: OLIBS - Override Password (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.557+08	2025-07-01 12:51:19.317+08
314	208	BSG - BSGTouch – Transfer Antar Bank	BSG Template: KLAIM - BSGTouch – Transfer Antar Bank (6 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.562+08	2025-07-01 12:51:19.322+08
315	208	BSG - BSGTouch, BSGQRIS – Klaim Gagal Transaksi	BSG Template: KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi (6 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.569+08	2025-07-01 12:51:19.327+08
316	158	BSG - Buka Blokir dan Reset Password	BSG Template: XCARD - Buka Blokir dan Reset Password (5 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.574+08	2025-07-01 12:51:19.331+08
317	161	BSG - Pendaftaran User Baru	BSG Template: XCARD - Pendaftaran User Baru (7 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.579+08	2025-07-01 12:51:19.335+08
318	169	BSG - Perubahan User	BSG Template: TellerApp/Reporting - Perubahan User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.586+08	2025-07-01 12:51:19.34+08
319	168	BSG - Pendaftaran User	BSG Template: TellerApp/Reporting - Pendaftaran User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.59+08	2025-07-01 12:51:19.344+08
320	91	BSG - Pendaftaran User	BSG Template: BSG QRIS - Pendaftaran User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.595+08	2025-07-01 12:51:19.35+08
331	84	BSG - Mutasi User	BSG Template: SMS BANKING - Mutasi User (6 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.651+08	2025-07-01 12:51:19.395+08
323	69	BSG - Pendaftaran User	BSG Template: BSGTouch - Pendaftaran User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.61+08	2025-07-01 12:51:19.364+08
324	73	BSG - Perubahan User	BSG Template: BSGTouch - Perubahan User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.614+08	2025-07-01 12:51:19.369+08
325	72	BSG - Perpanjang Masa Berlaku	BSG Template: BSGTouch - Perpanjang Masa Berlaku (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.617+08	2025-07-01 12:51:19.375+08
326	68	BSG - Mutasi User	BSG Template: BSGTouch - Mutasi User (6 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.621+08	2025-07-01 12:51:19.38+08
327	104	BSG - PERMASALAHAN TEKNIS	BSG Template: ATM - PERMASALAHAN TEKNIS (7 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.627+08	2025-07-01 12:51:19.384+08
328	85	BSG - Pendaftaran User	BSG Template: SMS BANKING - Pendaftaran User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.633+08	2025-07-01 12:51:19.387+08
329	86	BSG - Perubahan User	BSG Template: SMS BANKING - Perubahan User (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.638+08	2025-07-01 12:51:19.39+08
321	92	BSG - Perpanjang Masa Berlaku	BSG Template: SMS BANKING - Perpanjang Masa Berlaku (4 fields)	standard	f	t	t	1	\N	\N	\N	2025-07-01 12:49:28.601+08	2025-07-01 12:51:19.392+08
355	82	BSGDirect - User Management	Digital channel service: BSGDirect - User Management	standard	f	t	t	15	30	human_error	request	2025-07-02 16:02:51.553+08	2025-07-02 16:02:51.553+08
356	80	BSGDirect - Error Aplikasi	Digital channel service: BSGDirect - Error Aplikasi	standard	f	f	t	13	30	system_error	problem	2025-07-02 16:02:51.565+08	2025-07-02 16:02:51.565+08
357	81	BSGDirect - Error Transaksi	Digital channel service: BSGDirect - Error Transaksi	standard	f	f	t	14	30	system_error	problem	2025-07-02 16:02:51.567+08	2025-07-02 16:02:51.567+08
358	7	BSGDirect Support	BSGDirect application support	standard	f	t	t	0	30	human_error	request	2025-07-02 16:02:51.568+08	2025-07-02 16:02:51.568+08
359	151	OBOX - Error Aplikasi	Corporate IT service: OBOX - Error Aplikasi	standard	f	f	t	37	60	system_error	problem	2025-07-02 16:05:02.308+08	2025-07-02 16:05:02.308+08
360	26	Kasda Online - Error Approval Maker	KASDA service request: Kasda Online - Error Approval Maker	government	t	t	t	17	60	system_error	problem	2025-07-02 16:05:02.312+08	2025-07-02 16:05:02.312+08
361	27	Kasda Online - Error Approval Transaksi	KASDA service request: Kasda Online - Error Approval Transaksi	government	t	t	t	18	60	system_error	problem	2025-07-02 16:05:02.313+08	2025-07-02 16:05:02.313+08
362	149	MIS - Error MIS	Corporate IT service: MIS - Error MIS	standard	f	f	t	35	60	system_error	problem	2025-07-02 16:05:02.314+08	2025-07-02 16:05:02.314+08
363	11	OLIBs - Buka Blokir	OLIBS service request: OLIBs - Buka Blokir	standard	f	f	t	2	45	undetermined	request	2025-07-02 16:05:02.315+08	2025-07-02 16:05:02.315+08
364	135	ARS73 - Error Aplikasi	Corporate IT service: ARS73 - Error Aplikasi	standard	f	f	t	21	60	system_error	problem	2025-07-02 16:05:02.316+08	2025-07-02 16:05:02.316+08
365	17	OLIBs - Error User	OLIBS service request: OLIBs - Error User	standard	f	f	t	8	60	system_error	problem	2025-07-02 16:05:02.317+08	2025-07-02 16:05:02.317+08
366	142	Error - Rintis PaymentProd	Corporate IT service: Error - Rintis PaymentProd	standard	f	f	t	28	60	system_error	problem	2025-07-02 16:05:02.317+08	2025-07-02 16:05:02.317+08
367	89	BSG QRIS - Error Transaksi/Aplikasi	Digital channel service: BSG QRIS - Error Transaksi/Aplikasi	standard	f	f	t	22	60	system_error	problem	2025-07-02 16:05:02.318+08	2025-07-02 16:05:02.318+08
368	33	Kasda Online - Gagal Pembayaran	KASDA service request: Kasda Online - Gagal Pembayaran	government	t	t	t	24	60	system_error	problem	2025-07-02 16:05:02.319+08	2025-07-02 16:05:02.319+08
369	31	Kasda Online - Error Permintaan Token Transaksi	KASDA service request: Kasda Online - Error Permintaan Token Transaksi	government	t	t	t	22	60	system_error	problem	2025-07-02 16:05:02.32+08	2025-07-02 16:05:02.32+08
370	34	Kasda Online - Gagal Transfer	KASDA service request: Kasda Online - Gagal Transfer	government	t	t	t	25	60	system_error	problem	2025-07-02 16:05:02.32+08	2025-07-02 16:05:02.32+08
371	12	OLIBs - Error Deposito	OLIBS service request: OLIBs - Error Deposito	standard	f	f	t	3	60	system_error	problem	2025-07-02 16:05:02.321+08	2025-07-02 16:05:02.321+08
372	10	OLIBs - BE Error	OLIBS service request: OLIBs - BE Error	standard	f	f	t	1	60	system_error	problem	2025-07-02 16:05:02.321+08	2025-07-02 16:05:02.321+08
373	18	OLIBs - FE Error	OLIBS service request: OLIBs - FE Error	standard	f	f	t	9	60	system_error	problem	2025-07-02 16:05:02.322+08	2025-07-02 16:05:02.322+08
374	143	Error Aplikasi	Corporate IT service: Error Aplikasi	standard	f	f	t	29	60	system_error	problem	2025-07-02 16:05:02.323+08	2025-07-02 16:05:02.323+08
375	64	Switching - Error Transaksi	Specialized financial system service: Switching - Error Transaksi	standard	f	f	t	55	60	system_error	problem	2025-07-02 16:05:02.323+08	2025-07-02 16:05:02.323+08
376	47	BSG sprint TNP - Error	Specialized financial system service: BSG sprint TNP - Error	standard	f	f	t	38	60	system_error	problem	2025-07-02 16:05:02.324+08	2025-07-02 16:05:02.324+08
377	83	SMS Banking - Error	Digital channel service: SMS Banking - Error	standard	f	f	t	16	60	system_error	problem	2025-07-02 16:05:02.325+08	2025-07-02 16:05:02.325+08
378	15	OLIBs - Error PRK	OLIBS service request: OLIBs - Error PRK	standard	f	f	t	6	60	system_error	problem	2025-07-02 16:05:02.326+08	2025-07-02 16:05:02.326+08
379	140	E-Dapem - Error Transaksi	Corporate IT service: E-Dapem - Error Transaksi	standard	f	f	t	26	60	system_error	problem	2025-07-02 16:05:02.326+08	2025-07-02 16:05:02.326+08
380	56	SIKP - Error Aplikasi	Specialized financial system service: SIKP - Error Aplikasi	standard	f	f	t	47	60	system_error	problem	2025-07-02 16:05:02.327+08	2025-07-02 16:05:02.327+08
381	13	OLIBs - Error Giro	OLIBS service request: OLIBs - Error Giro	standard	f	f	t	4	60	system_error	problem	2025-07-02 16:05:02.328+08	2025-07-02 16:05:02.328+08
382	152	Payroll - Error Proses	Corporate IT service: Payroll - Error Proses	standard	f	f	t	38	60	system_error	problem	2025-07-02 16:05:02.328+08	2025-07-02 16:05:02.328+08
383	19	OLIBs - Gagal Close Operasional	OLIBS service request: OLIBs - Gagal Close Operasional	standard	f	f	t	10	60	system_error	problem	2025-07-02 16:05:02.329+08	2025-07-02 16:05:02.329+08
384	52	PSAK 71 - Error Aplikasi	Specialized financial system service: PSAK 71 - Error Aplikasi	standard	f	f	t	43	60	system_error	problem	2025-07-02 16:05:02.33+08	2025-07-02 16:05:02.33+08
385	37	Antasena - Error Proses Aplikasi	Specialized financial system service: Antasena - Error Proses Aplikasi	standard	f	f	t	28	60	system_error	problem	2025-07-02 16:05:02.331+08	2025-07-02 16:05:02.331+08
386	32	Kasda Online - Error Tarik Data SP2D (Kasda FMIS)	KASDA service request: Kasda Online - Error Tarik Data SP2D (Kasda FMIS)	government	t	t	t	23	60	system_error	problem	2025-07-02 16:05:02.332+08	2025-07-02 16:05:02.332+08
387	164	XLink - Error	Corporate IT service: XLink - Error	standard	f	f	t	50	60	system_error	problem	2025-07-02 16:05:02.332+08	2025-07-02 16:05:02.332+08
388	55	SIKP - Error	Specialized financial system service: SIKP - Error	standard	f	f	t	46	60	system_error	problem	2025-07-02 16:05:02.333+08	2025-07-02 16:05:02.333+08
389	8	KASDA Account Management	KASDA user account and access management	government	t	t	t	0	45	undetermined	request	2025-07-02 16:05:02.334+08	2025-07-02 16:05:02.334+08
390	48	BSGbrocade - Error	Specialized financial system service: BSGbrocade - Error	standard	f	f	t	39	60	system_error	problem	2025-07-02 16:05:02.335+08	2025-07-02 16:05:02.335+08
391	28	Kasda Online - Error Cek Transaksi/Saldo Rekening	KASDA service request: Kasda Online - Error Cek Transaksi/Saldo Rekening	government	t	t	t	19	60	system_error	problem	2025-07-02 16:05:02.336+08	2025-07-02 16:05:02.336+08
392	30	Kasda Online - Error Login	KASDA service request: Kasda Online - Error Login	government	t	t	t	21	60	system_error	problem	2025-07-02 16:05:02.336+08	2025-07-02 16:05:02.336+08
393	50	Finnet - Error	Specialized financial system service: Finnet - Error	standard	f	f	t	41	60	system_error	problem	2025-07-02 16:05:02.337+08	2025-07-02 16:05:02.337+08
394	51	MPN - Error Transaksi	Specialized financial system service: MPN - Error Transaksi	standard	f	f	t	42	60	system_error	problem	2025-07-02 16:05:02.338+08	2025-07-02 16:05:02.338+08
395	42	BI RTGS - Error Aplikasi	Specialized financial system service: BI RTGS - Error Aplikasi	standard	f	f	t	33	60	system_error	problem	2025-07-02 16:05:02.338+08	2025-07-02 16:05:02.338+08
396	6	OLIBS Support	OLIBS system support and troubleshooting	standard	f	t	t	0	45	undetermined	request	2025-07-02 16:05:02.339+08	2025-07-02 16:05:02.339+08
397	29	Kasda Online - Error Lainnya	KASDA service request: Kasda Online - Error Lainnya	government	t	t	t	20	60	system_error	problem	2025-07-02 16:05:02.34+08	2025-07-02 16:05:02.34+08
398	41	BI Fast - Error	Specialized financial system service: BI Fast - Error	standard	f	f	t	32	60	system_error	problem	2025-07-02 16:05:02.341+08	2025-07-02 16:05:02.341+08
399	141	Error - Error Middleware	Corporate IT service: Error - Error Middleware	standard	f	f	t	27	60	system_error	problem	2025-07-02 16:05:02.341+08	2025-07-02 16:05:02.341+08
400	16	OLIBs - Error Tabungan	OLIBS service request: OLIBs - Error Tabungan	standard	f	f	t	7	60	system_error	problem	2025-07-02 16:05:02.342+08	2025-07-02 16:05:02.342+08
401	36	Kasda Online - User Management	KASDA service request: Kasda Online - User Management	government	t	t	t	27	30	human_error	request	2025-07-02 16:05:02.343+08	2025-07-02 16:05:02.343+08
402	53	Report Viewer 724 - Error	Specialized financial system service: Report Viewer 724 - Error	standard	f	f	t	44	60	system_error	problem	2025-07-02 16:05:02.344+08	2025-07-02 16:05:02.344+08
403	58	SKNBI - Error Aplikasi	Specialized financial system service: SKNBI - Error Aplikasi	standard	f	f	t	49	60	system_error	problem	2025-07-02 16:05:02.344+08	2025-07-02 16:05:02.344+08
404	111	Error Pinpad	Hardware service: Error Pinpad	standard	f	f	t	18	60	system_error	problem	2025-07-02 16:05:02.345+08	2025-07-02 16:05:02.345+08
405	49	Error GoAML - Error Proses	Specialized financial system service: Error GoAML - Error Proses	standard	f	f	t	40	60	system_error	problem	2025-07-02 16:05:02.346+08	2025-07-02 16:05:02.346+08
406	14	OLIBs - Error Kredit	OLIBS service request: OLIBs - Error Kredit	standard	f	f	t	5	60	system_error	problem	2025-07-02 16:05:02.346+08	2025-07-02 16:05:02.346+08
407	147	HRMS - User Error	Corporate IT service: HRMS - User Error	standard	f	f	t	33	60	system_error	problem	2025-07-02 16:05:02.347+08	2025-07-02 16:05:02.347+08
408	35	Kasda Online BUD - Error	KASDA service request: Kasda Online BUD - Error	government	t	t	t	26	60	system_error	problem	2025-07-02 16:05:02.349+08	2025-07-02 16:05:02.349+08
409	150	Ms. Office 365 - Error	Corporate IT service: Ms. Office 365 - Error	standard	f	f	t	36	60	system_error	problem	2025-07-02 16:05:02.349+08	2025-07-02 16:05:02.349+08
410	63	SLIK - Error	Specialized financial system service: SLIK - Error	standard	f	f	t	54	60	system_error	problem	2025-07-02 16:05:02.35+08	2025-07-02 16:05:02.35+08
\.


--
-- Data for Name: sla_policies; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.sla_policies (id, name, description, service_catalog_id, service_item_id, department_id, priority, is_kasda_specific, response_time_minutes, resolution_time_minutes, business_hours_only, escalation_matrix, notification_rules, is_active, effective_from, effective_to, created_at, updated_at) FROM stdin;
2	Critical IT Issues	SLA for critical IT infrastructure issues	\N	\N	5	urgent	f	30	240	t	{"levels": [{"level": 1, "timeMinutes": 60, "assignToRole": "technician"}, {"level": 2, "timeMinutes": 120, "assignToRole": "manager"}]}	{"onCreated": true, "onEscalated": true, "beforeBreach": 30}	t	2025-07-01 13:18:46.953+08	\N	2025-07-01 13:18:46.953+08	2025-07-01 13:18:46.953+08
3	High Priority Support	SLA for high priority business support issues	\N	\N	6	high	f	60	480	t	{"levels": [{"level": 1, "timeMinutes": 120, "assignToRole": "technician"}, {"level": 2, "timeMinutes": 240, "assignToRole": "manager"}]}	{"onCreated": true, "onEscalated": true, "beforeBreach": 60}	t	2025-07-01 13:18:46.958+08	\N	2025-07-01 13:18:46.958+08	2025-07-01 13:18:46.958+08
4	Standard Business Hours	Default SLA for medium priority issues	\N	\N	\N	medium	f	120	1440	t	{"levels": [{"level": 1, "timeMinutes": 480, "assignToRole": "technician"}, {"level": 2, "timeMinutes": 960, "assignToRole": "manager"}]}	{"onCreated": false, "onEscalated": true, "beforeBreach": 120}	t	2025-07-01 13:18:46.959+08	\N	2025-07-01 13:18:46.959+08	2025-07-01 13:18:46.959+08
5	24/7 Critical Infrastructure	SLA for critical infrastructure - no business hours restriction	\N	\N	\N	urgent	f	15	120	f	{"levels": [{"level": 1, "timeMinutes": 30, "assignToRole": "technician"}, {"level": 2, "timeMinutes": 60, "assignToRole": "manager"}]}	{"onCreated": true, "onEscalated": true, "beforeBreach": 15}	t	2025-07-01 13:18:46.961+08	\N	2025-07-01 13:18:46.961+08	2025-07-01 13:18:46.961+08
\.


--
-- Data for Name: sub_categories; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.sub_categories (id, name, category_id) FROM stdin;
3	System Access	10
1	Desktop Issues	8
2	Login Issues	9
\.


--
-- Data for Name: template_categories; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.template_categories (id, name, name_indonesian, description, parent_id, department_id, icon, color, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: template_metadata; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.template_metadata (id, template_id, service_template_id, category_id, name, name_indonesian, description, business_process, complexity, estimated_time, popularity_score, usage_count, tags, search_keywords, search_keywords_id, is_public, is_active, department_id, created_by, approved_by, approved_at, version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: template_usage_logs; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.template_usage_logs (id, template_id, service_template_id, user_id, department_id, ticket_id, usage_type, session_id, ip_address, user_agent, completion_time, created_at) FROM stdin;
\.


--
-- Data for Name: ticket_assignment_logs; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_assignment_logs (id, ticket_id, assigned_to_user_id, assignment_rule_id, assignment_method, assignment_reason, assigned_by_user_id, previous_assignee_id, created_at) FROM stdin;
1	1	26	\N	manual	Test workflow assignment	24	\N	2025-07-01 17:05:06.391+08
\.


--
-- Data for Name: ticket_attachments; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_attachments (id, ticket_id, file_name, file_path, file_size, file_type, uploaded_by_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_classification_audit; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_classification_audit (id, ticket_id, changed_by, field_changed, old_value, new_value, reason, ip_address, user_agent, session_id, created_at) FROM stdin;
\.


--
-- Data for Name: ticket_comments; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_comments (id, ticket_id, author_id, content, comment_type, is_internal, is_system_generated, parent_comment_id, mentions, attachments, edited_at, edited_by, is_deleted, deleted_at, deleted_by, created_at, updated_at) FROM stdin;
1	1	26	Started investigating the issue. Will provide updates shortly.	comment	f	f	\N	\N	\N	\N	\N	f	\N	\N	2025-07-01 17:05:06.405+08	2025-07-01 17:05:06.405+08
2	1	26	Issue has been resolved. Applied the recommended solution and verified functionality.	resolution	f	f	\N	\N	\N	\N	\N	f	\N	\N	2025-07-01 17:05:06.423+08	2025-07-01 17:05:06.423+08
3	2	26	Technician started working on this ticket	status_change	f	f	\N	\N	\N	\N	\N	f	\N	\N	2025-07-01 17:26:27.261+08	2025-07-01 17:26:27.261+08
4	2	26	I've investigated the network connectivity issue. The problem was caused by a configuration error on the core banking network switch. I've corrected the configuration and restored network connectivity. All systems are now operational and tested.	comment	f	f	\N	{}	\N	\N	\N	f	\N	\N	2025-07-01 17:26:49.617+08	2025-07-01 17:26:49.617+08
5	2	26	✅ RESOLVED: Network connectivity issue has been fully resolved.\n\nRoot Cause: Configuration error on core banking network switch\nSolution Applied: Corrected switch configuration settings\nVerification: All banking systems are operational and connectivity tested\nImpact: Zero downtime - issue resolved within SLA\n\nNetwork infrastructure is stable and monitoring shows normal operations.	status_change	f	f	\N	\N	\N	\N	\N	f	\N	\N	2025-07-01 17:27:18.492+08	2025-07-01 17:27:18.492+08
6	2	23	hgg	status_change	f	f	\N	\N	\N	\N	\N	f	\N	\N	2025-07-02 13:53:06.468+08	2025-07-02 13:53:06.468+08
\.


--
-- Data for Name: ticket_custom_field_values; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_custom_field_values (id, ticket_id, field_definition_id, value) FROM stdin;
\.


--
-- Data for Name: ticket_service_field_values; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_service_field_values (id, ticket_id, field_definition_id, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_templates; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.ticket_templates (id, name, item_id, description) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.tickets (id, title, description, status, priority, created_by_user_id, assigned_to_user_id, created_at, updated_at, resolved_at, sla_due_date, item_id, template_id, manager_comments, business_comments, business_impact, confirmed_issue_category, confirmed_root_cause, government_entity_id, is_classification_locked, is_kasda_ticket, request_type, requires_business_approval, service_catalog_id, service_item_id, service_template_id, tech_categorized_at, tech_categorized_by, tech_issue_category, tech_override_reason, tech_root_cause, user_categorized_at, user_categorized_ip, user_issue_category, user_root_cause) FROM stdin;
1	Test SLA Workflow - 2025-07-01	This is a test ticket to validate the complete SLA workflow from creation to closure.	closed	high	30	26	2025-07-01 17:05:06.314+08	2025-07-01 17:05:06.425+08	2025-07-01 17:05:06.423+08	2025-07-02 17:00:00+08	\N	\N	\N	\N	medium	\N	\N	\N	f	f	service_request	f	4	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	URGENT: Network Connectivity - Core Banking Systems Down	Network and internet connectivity issues	closed	medium	28	26	2025-07-01 17:08:39.19+08	2025-07-02 13:53:06.448+08	2025-07-01 17:27:18.484+08	2025-07-02 01:08:39.179+08	\N	\N	Approved - Critical network issue affecting core banking operations. High priority for immediate technician assignment.	\N	medium	problem	system_error	\N	f	f	incident	t	4	4	\N	\N	\N	\N	\N	\N	2025-07-01 17:08:39.188+08	\N	problem	system_error
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.units (id, code, name, display_name, unit_type, parent_id, department_id, is_active, sort_order, metadata, address, phone, fax, region, province, created_at, updated_at) FROM stdin;
6	UTAMA	Kantor Cabang Utama	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	Manado Metro	Sulawesi Utara	2025-07-01 11:40:17.817+08	2025-07-02 10:28:13.71+08
7	JAKARTA	Kantor Cabang JAKARTA	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	DKI Jakarta	DKI Jakarta	2025-07-01 11:40:17.82+08	2025-07-02 10:28:13.71+08
8	GORONTALO	Kantor Cabang GORONTALO	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	Gorontalo Metro	Gorontalo	2025-07-01 11:40:17.821+08	2025-07-02 10:28:13.71+08
9	KOTAMOBAGU	Kantor Cabang KOTAMOBAGU	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	Bolaang Mongondow	Sulawesi Utara	2025-07-01 11:40:17.822+08	2025-07-02 10:28:13.71+08
10	BITUNG	Kantor Cabang BITUNG	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	North Coast	Sulawesi Utara	2025-07-01 11:40:17.823+08	2025-07-02 10:28:13.71+08
11	AIRMADIDI	Kantor Cabang AIRMADIDI	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	Minahasa	Sulawesi Utara	2025-07-01 11:40:17.824+08	2025-07-02 10:28:13.71+08
12	TOMOHON	Kantor Cabang TOMOHON	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	Minahasa	Sulawesi Utara	2025-07-01 11:40:17.825+08	2025-07-02 10:28:13.71+08
13	TONDANO	Kantor Cabang TONDANO	\N	CABANG	\N	6	t	0	{"marketSize": "Large", "businessTier": "Tier 1-Strategic", "businessDistrict": "Financial District"}	\N	\N	\N	Minahasa	Sulawesi Utara	2025-07-01 11:40:17.826+08	2025-07-02 10:28:13.71+08
14	KELAPA_GADING	Kantor Cabang Pembantu KELAPA GADING	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Manado Metro	Sulawesi Utara	2025-07-01 11:40:17.827+08	2025-07-02 10:28:13.71+08
15	TUMINTING	Kantor Cabang Pembantu TUMINTING	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Manado Metro	Sulawesi Utara	2025-07-01 11:40:17.827+08	2025-07-02 10:28:13.71+08
16	WENANG	Kantor Cabang Pembantu WENANG	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Manado Metro	Sulawesi Utara	2025-07-01 11:40:17.828+08	2025-07-02 10:28:13.71+08
17	WANEA	Kantor Cabang Pembantu WANEA	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Manado Metro	Sulawesi Utara	2025-07-01 11:40:17.829+08	2025-07-02 10:28:13.71+08
18	MALALAYANG	Kantor Cabang Pembantu MALALAYANG	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Manado Metro	Sulawesi Utara	2025-07-01 11:40:17.83+08	2025-07-02 10:28:13.71+08
19	POIGAR	Kantor Cabang Pembantu POIGAR	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Bolaang Mongondow	Sulawesi Utara	2025-07-01 11:40:17.831+08	2025-07-02 10:28:13.71+08
20	BOLMONG_SELATAN	Kantor Cabang Pembantu BOLMONG SELATAN	\N	CAPEM	\N	6	t	0	{"marketSize": "Medium", "businessTier": "Tier 2-Important", "businessDistrict": "Commercial Hub"}	\N	\N	\N	Bolaang Mongondow	Sulawesi Utara	2025-07-01 11:40:17.832+08	2025-07-02 10:28:13.71+08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: yanrypangouw
--

COPY public.users (id, username, password_hash, email, role, created_at, updated_at, manager_id, current_workload, department_id, experience_level, is_available, is_business_reviewer, is_kasda_user, name, primary_skill, secondary_skills, unit_id, workload_capacity) FROM stdin;
23	admin	$2b$10$/LgngSJLTrnMCq5i3XuVWeDK0.vgXZaWViipXOEuyCiYzok7IR8Hu	admin@bsg.co.id	admin	2025-07-01 11:40:17.952+08	2025-07-01 11:40:17.952+08	\N	0	5	\N	t	f	f	System Administrator	\N	\N	\N	50
26	it.technician	$2b$10$otrMN5Cpttf2cQ/ksb1sW.vrXU0LCZMMrj7rxRs7VeqzJI76ODdj6	it.technician@bsg.co.id	technician	2025-07-01 11:40:18.129+08	2025-07-01 11:40:18.129+08	\N	0	5	senior	t	f	f	IT Support Technician	network_infrastructure	Windows Server, Cisco Networking, VMware	\N	15
27	banking.tech	$2b$10$mcJdp.RPt3zP9/IKZgHy/O2mUHyzaRQI2J.Mw6enfDNvlhPshJ5pO	banking.tech@bsg.co.id	technician	2025-07-01 11:40:18.184+08	2025-07-01 11:40:18.184+08	\N	0	6	expert	t	f	f	Banking Systems Technician	banking_systems	OLIBS, BSGDirect, Core Banking, Payment Systems	\N	12
29	kasda.user	$2b$10$JKk9m0pwrmdm./GQLwIif.6zrwn/ESfqBOKilOgtiGMT5f4ls.8du	kasda.user@bsg.co.id	requester	2025-07-01 11:40:18.297+08	2025-07-01 11:40:18.297+08	\N	0	6	\N	t	f	t	KASDA User Pemerintah	\N	\N	\N	10
30	test.requester.support	$2b$10$rKz8QQg7gD4M8Xv2L5nJ7uGjK3mP9wF2eR8tY6qA1sB4nC7vX2zL9	test.requester@bsg.co.id	requester	2025-07-01 17:04:48.401+08	2025-07-01 17:04:48.401+08	\N	0	6	\N	t	f	f	Test Support Requester	\N	\N	6	10
24	utama.manager	$2b$10$dQmYrsJPKEcSEbN2PS54U.XO3g7EVABu6q0TsNFwnHL1GKRpcLX02	utama.manager@bsg.co.id	manager	2025-07-01 11:40:18.015+08	2025-07-02 10:28:13.725+08	\N	0	6	\N	t	t	f	Manager Kantor Cabang Utama	\N	\N	6	20
25	gorontalo.manager	$2b$10$rreF63nZ7DKhXelGrP8NAuUk75SgkLh7mUn8O1c.wq3mcnYK94a6K	gorontalo.manager@bsg.co.id	manager	2025-07-01 11:40:18.074+08	2025-07-02 10:28:13.725+08	\N	0	6	\N	t	t	f	Manager Kantor Cabang Gorontalo	\N	\N	8	20
28	utama.user	$2b$10$sLJbIKj1ITq0pcCf3xQmO.usDLMI1XCDx38wilHhvT4GUu3EokQIO	utama.user@bsg.co.id	requester	2025-07-01 11:40:18.239+08	2025-07-02 10:28:13.725+08	24	0	6	\N	t	f	f	Staff Kantor Cabang Utama	\N	\N	6	10
\.


--
-- Name: api_token_usage_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.api_token_usage_logs_id_seq', 1, false);


--
-- Name: api_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.api_tokens_id_seq', 1, false);


--
-- Name: auto_assignment_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.auto_assignment_rules_id_seq', 1, false);


--
-- Name: bsg_field_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_field_options_id_seq', 121, true);


--
-- Name: bsg_field_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_field_types_id_seq', 7, true);


--
-- Name: bsg_global_field_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_global_field_definitions_id_seq', 1, false);


--
-- Name: bsg_master_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_master_data_id_seq', 6, true);


--
-- Name: bsg_template_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_template_categories_id_seq', 3, true);


--
-- Name: bsg_template_fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_template_fields_id_seq', 119, true);


--
-- Name: bsg_template_usage_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_template_usage_logs_id_seq', 1, false);


--
-- Name: bsg_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_templates_id_seq', 24, true);


--
-- Name: bsg_ticket_field_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.bsg_ticket_field_values_id_seq', 1, false);


--
-- Name: business_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.business_approvals_id_seq', 2, true);


--
-- Name: business_hours_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.business_hours_config_id_seq', 12, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.categories_id_seq', 10, true);


--
-- Name: comment_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.comment_notifications_id_seq', 1, true);


--
-- Name: custom_field_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.custom_field_definitions_id_seq', 1, false);


--
-- Name: department_sla_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.department_sla_policies_id_seq', 4, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.departments_id_seq', 7, true);


--
-- Name: escalation_instances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.escalation_instances_id_seq', 1, false);


--
-- Name: field_type_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.field_type_definitions_id_seq', 1, false);


--
-- Name: government_entities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.government_entities_id_seq', 3, true);


--
-- Name: holiday_calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.holiday_calendar_id_seq', 13, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.items_id_seq', 3, true);


--
-- Name: kasda_user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.kasda_user_profiles_id_seq', 1, false);


--
-- Name: master_data_entities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.master_data_entities_id_seq', 39, true);


--
-- Name: service_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.service_catalog_id_seq', 13, true);


--
-- Name: service_field_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.service_field_definitions_id_seq', 733, true);


--
-- Name: service_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.service_items_id_seq', 248, true);


--
-- Name: service_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.service_templates_id_seq', 410, true);


--
-- Name: sla_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.sla_policies_id_seq', 6, true);


--
-- Name: sub_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.sub_categories_id_seq', 3, true);


--
-- Name: template_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.template_categories_id_seq', 1, false);


--
-- Name: template_metadata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.template_metadata_id_seq', 1, false);


--
-- Name: template_usage_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.template_usage_logs_id_seq', 1, false);


--
-- Name: ticket_assignment_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_assignment_logs_id_seq', 1, true);


--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_attachments_id_seq', 1, false);


--
-- Name: ticket_classification_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_classification_audit_id_seq', 1, false);


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_comments_id_seq', 6, true);


--
-- Name: ticket_custom_field_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_custom_field_values_id_seq', 1, false);


--
-- Name: ticket_service_field_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_service_field_values_id_seq', 1, false);


--
-- Name: ticket_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.ticket_templates_id_seq', 1, false);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.tickets_id_seq', 2, true);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.units_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yanrypangouw
--

SELECT pg_catalog.setval('public.users_id_seq', 30, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: api_token_usage_logs api_token_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.api_token_usage_logs
    ADD CONSTRAINT api_token_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (id);


--
-- Name: auto_assignment_rules auto_assignment_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.auto_assignment_rules
    ADD CONSTRAINT auto_assignment_rules_pkey PRIMARY KEY (id);


--
-- Name: bsg_field_options bsg_field_options_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_field_options
    ADD CONSTRAINT bsg_field_options_pkey PRIMARY KEY (id);


--
-- Name: bsg_field_types bsg_field_types_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_field_types
    ADD CONSTRAINT bsg_field_types_pkey PRIMARY KEY (id);


--
-- Name: bsg_global_field_definitions bsg_global_field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_global_field_definitions
    ADD CONSTRAINT bsg_global_field_definitions_pkey PRIMARY KEY (id);


--
-- Name: bsg_master_data bsg_master_data_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_master_data
    ADD CONSTRAINT bsg_master_data_pkey PRIMARY KEY (id);


--
-- Name: bsg_template_categories bsg_template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_categories
    ADD CONSTRAINT bsg_template_categories_pkey PRIMARY KEY (id);


--
-- Name: bsg_template_fields bsg_template_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_fields
    ADD CONSTRAINT bsg_template_fields_pkey PRIMARY KEY (id);


--
-- Name: bsg_template_usage_logs bsg_template_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_usage_logs
    ADD CONSTRAINT bsg_template_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: bsg_templates bsg_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_templates
    ADD CONSTRAINT bsg_templates_pkey PRIMARY KEY (id);


--
-- Name: bsg_ticket_field_values bsg_ticket_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_ticket_field_values
    ADD CONSTRAINT bsg_ticket_field_values_pkey PRIMARY KEY (id);


--
-- Name: business_approvals business_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_approvals
    ADD CONSTRAINT business_approvals_pkey PRIMARY KEY (id);


--
-- Name: business_hours_config business_hours_config_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_hours_config
    ADD CONSTRAINT business_hours_config_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comment_notifications comment_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.comment_notifications
    ADD CONSTRAINT comment_notifications_pkey PRIMARY KEY (id);


--
-- Name: custom_field_definitions custom_field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.custom_field_definitions
    ADD CONSTRAINT custom_field_definitions_pkey PRIMARY KEY (id);


--
-- Name: department_sla_policies department_sla_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.department_sla_policies
    ADD CONSTRAINT department_sla_policies_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: escalation_instances escalation_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.escalation_instances
    ADD CONSTRAINT escalation_instances_pkey PRIMARY KEY (id);


--
-- Name: field_type_definitions field_type_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.field_type_definitions
    ADD CONSTRAINT field_type_definitions_pkey PRIMARY KEY (id);


--
-- Name: government_entities government_entities_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.government_entities
    ADD CONSTRAINT government_entities_pkey PRIMARY KEY (id);


--
-- Name: holiday_calendar holiday_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.holiday_calendar
    ADD CONSTRAINT holiday_calendar_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: kasda_user_profiles kasda_user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.kasda_user_profiles
    ADD CONSTRAINT kasda_user_profiles_pkey PRIMARY KEY (id);


--
-- Name: master_data_entities master_data_entities_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.master_data_entities
    ADD CONSTRAINT master_data_entities_pkey PRIMARY KEY (id);


--
-- Name: service_catalog service_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_catalog
    ADD CONSTRAINT service_catalog_pkey PRIMARY KEY (id);


--
-- Name: service_field_definitions service_field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_field_definitions
    ADD CONSTRAINT service_field_definitions_pkey PRIMARY KEY (id);


--
-- Name: service_items service_items_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_items
    ADD CONSTRAINT service_items_pkey PRIMARY KEY (id);


--
-- Name: service_templates service_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_templates
    ADD CONSTRAINT service_templates_pkey PRIMARY KEY (id);


--
-- Name: sla_policies sla_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sla_policies
    ADD CONSTRAINT sla_policies_pkey PRIMARY KEY (id);


--
-- Name: sub_categories sub_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_pkey PRIMARY KEY (id);


--
-- Name: template_categories template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_pkey PRIMARY KEY (id);


--
-- Name: template_metadata template_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_pkey PRIMARY KEY (id);


--
-- Name: template_usage_logs template_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs
    ADD CONSTRAINT template_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: ticket_assignment_logs ticket_assignment_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs
    ADD CONSTRAINT ticket_assignment_logs_pkey PRIMARY KEY (id);


--
-- Name: ticket_attachments ticket_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id);


--
-- Name: ticket_classification_audit ticket_classification_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_classification_audit
    ADD CONSTRAINT ticket_classification_audit_pkey PRIMARY KEY (id);


--
-- Name: ticket_comments ticket_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_pkey PRIMARY KEY (id);


--
-- Name: ticket_custom_field_values ticket_custom_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_custom_field_values
    ADD CONSTRAINT ticket_custom_field_values_pkey PRIMARY KEY (id);


--
-- Name: ticket_service_field_values ticket_service_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_service_field_values
    ADD CONSTRAINT ticket_service_field_values_pkey PRIMARY KEY (id);


--
-- Name: ticket_templates ticket_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_templates
    ADD CONSTRAINT ticket_templates_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: api_token_usage_logs_token_id_created_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX api_token_usage_logs_token_id_created_at_idx ON public.api_token_usage_logs USING btree (token_id, created_at);


--
-- Name: api_tokens_is_active_expires_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX api_tokens_is_active_expires_at_idx ON public.api_tokens USING btree (is_active, expires_at);


--
-- Name: api_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX api_tokens_token_hash_idx ON public.api_tokens USING btree (token_hash);


--
-- Name: api_tokens_token_hash_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX api_tokens_token_hash_key ON public.api_tokens USING btree (token_hash);


--
-- Name: bsg_field_types_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX bsg_field_types_name_key ON public.bsg_field_types USING btree (name);


--
-- Name: bsg_global_field_definitions_field_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX bsg_global_field_definitions_field_name_key ON public.bsg_global_field_definitions USING btree (field_name);


--
-- Name: bsg_master_data_data_type_is_active_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_master_data_data_type_is_active_idx ON public.bsg_master_data USING btree (data_type, is_active);


--
-- Name: bsg_master_data_parent_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_master_data_parent_id_idx ON public.bsg_master_data USING btree (parent_id);


--
-- Name: bsg_template_categories_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX bsg_template_categories_name_key ON public.bsg_template_categories USING btree (name);


--
-- Name: bsg_template_fields_template_id_field_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX bsg_template_fields_template_id_field_name_key ON public.bsg_template_fields USING btree (template_id, field_name);


--
-- Name: bsg_template_fields_template_id_sort_order_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_template_fields_template_id_sort_order_idx ON public.bsg_template_fields USING btree (template_id, sort_order);


--
-- Name: bsg_template_usage_logs_created_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_template_usage_logs_created_at_idx ON public.bsg_template_usage_logs USING btree (created_at);


--
-- Name: bsg_template_usage_logs_template_id_action_type_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_template_usage_logs_template_id_action_type_idx ON public.bsg_template_usage_logs USING btree (template_id, action_type);


--
-- Name: bsg_template_usage_logs_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_template_usage_logs_user_id_created_at_idx ON public.bsg_template_usage_logs USING btree (user_id, created_at);


--
-- Name: bsg_templates_category_id_is_active_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_templates_category_id_is_active_idx ON public.bsg_templates USING btree (category_id, is_active);


--
-- Name: bsg_templates_category_id_template_number_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX bsg_templates_category_id_template_number_key ON public.bsg_templates USING btree (category_id, template_number);


--
-- Name: bsg_ticket_field_values_ticket_id_field_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX bsg_ticket_field_values_ticket_id_field_id_key ON public.bsg_ticket_field_values USING btree (ticket_id, field_id);


--
-- Name: bsg_ticket_field_values_ticket_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX bsg_ticket_field_values_ticket_id_idx ON public.bsg_ticket_field_values USING btree (ticket_id);


--
-- Name: business_approvals_ticket_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX business_approvals_ticket_id_key ON public.business_approvals USING btree (ticket_id);


--
-- Name: business_hours_config_department_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX business_hours_config_department_id_idx ON public.business_hours_config USING btree (department_id);


--
-- Name: business_hours_config_department_id_unit_id_day_of_week_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX business_hours_config_department_id_unit_id_day_of_week_key ON public.business_hours_config USING btree (department_id, unit_id, day_of_week);


--
-- Name: business_hours_config_unit_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX business_hours_config_unit_id_idx ON public.business_hours_config USING btree (unit_id);


--
-- Name: categories_department_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX categories_department_id_name_key ON public.categories USING btree (department_id, name);


--
-- Name: comment_notifications_comment_id_recipient_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX comment_notifications_comment_id_recipient_id_key ON public.comment_notifications USING btree (comment_id, recipient_id);


--
-- Name: comment_notifications_recipient_id_is_read_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX comment_notifications_recipient_id_is_read_idx ON public.comment_notifications USING btree (recipient_id, is_read);


--
-- Name: custom_field_definitions_template_id_field_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX custom_field_definitions_template_id_field_name_key ON public.custom_field_definitions USING btree (template_id, field_name);


--
-- Name: department_sla_policies_department_id_service_type_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX department_sla_policies_department_id_service_type_key ON public.department_sla_policies USING btree (department_id, service_type);


--
-- Name: departments_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name);


--
-- Name: escalation_instances_sla_policy_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX escalation_instances_sla_policy_id_idx ON public.escalation_instances USING btree (sla_policy_id);


--
-- Name: escalation_instances_status_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX escalation_instances_status_idx ON public.escalation_instances USING btree (status);


--
-- Name: escalation_instances_ticket_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX escalation_instances_ticket_id_idx ON public.escalation_instances USING btree (ticket_id);


--
-- Name: escalation_instances_triggered_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX escalation_instances_triggered_at_idx ON public.escalation_instances USING btree (triggered_at);


--
-- Name: field_type_definitions_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX field_type_definitions_name_key ON public.field_type_definitions USING btree (name);


--
-- Name: holiday_calendar_date_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX holiday_calendar_date_idx ON public.holiday_calendar USING btree (date);


--
-- Name: holiday_calendar_department_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX holiday_calendar_department_id_idx ON public.holiday_calendar USING btree (department_id);


--
-- Name: holiday_calendar_name_date_department_id_unit_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX holiday_calendar_name_date_department_id_unit_id_key ON public.holiday_calendar USING btree (name, date, department_id, unit_id);


--
-- Name: holiday_calendar_unit_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX holiday_calendar_unit_id_idx ON public.holiday_calendar USING btree (unit_id);


--
-- Name: idx_classification_audit_date; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX idx_classification_audit_date ON public.ticket_classification_audit USING btree (created_at);


--
-- Name: idx_classification_audit_ticket; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX idx_classification_audit_ticket ON public.ticket_classification_audit USING btree (ticket_id);


--
-- Name: idx_classification_audit_user; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX idx_classification_audit_user ON public.ticket_classification_audit USING btree (changed_by);


--
-- Name: idx_global_fields_category; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX idx_global_fields_category ON public.bsg_global_field_definitions USING btree (field_category);


--
-- Name: idx_global_fields_name; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX idx_global_fields_name ON public.bsg_global_field_definitions USING btree (field_name);


--
-- Name: idx_ticket_attachments_ticket_id; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX idx_ticket_attachments_ticket_id ON public.ticket_attachments USING btree (ticket_id);


--
-- Name: items_sub_category_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX items_sub_category_id_name_key ON public.items USING btree (sub_category_id, name);


--
-- Name: kasda_user_profiles_user_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX kasda_user_profiles_user_id_key ON public.kasda_user_profiles USING btree (user_id);


--
-- Name: master_data_entities_parent_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX master_data_entities_parent_id_idx ON public.master_data_entities USING btree (parent_id);


--
-- Name: master_data_entities_type_code_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX master_data_entities_type_code_key ON public.master_data_entities USING btree (type, code);


--
-- Name: master_data_entities_type_is_active_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX master_data_entities_type_is_active_idx ON public.master_data_entities USING btree (type, is_active);


--
-- Name: service_catalog_department_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX service_catalog_department_id_name_key ON public.service_catalog USING btree (department_id, name);


--
-- Name: service_field_definitions_service_item_id_field_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX service_field_definitions_service_item_id_field_name_key ON public.service_field_definitions USING btree (service_item_id, field_name);


--
-- Name: service_field_definitions_service_template_id_field_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX service_field_definitions_service_template_id_field_name_key ON public.service_field_definitions USING btree (service_template_id, field_name);


--
-- Name: service_items_service_catalog_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX service_items_service_catalog_id_name_key ON public.service_items USING btree (service_catalog_id, name);


--
-- Name: service_templates_service_item_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX service_templates_service_item_id_name_key ON public.service_templates USING btree (service_item_id, name);


--
-- Name: sla_policies_department_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX sla_policies_department_id_idx ON public.sla_policies USING btree (department_id);


--
-- Name: sla_policies_effective_from_effective_to_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX sla_policies_effective_from_effective_to_idx ON public.sla_policies USING btree (effective_from, effective_to);


--
-- Name: sla_policies_priority_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX sla_policies_priority_idx ON public.sla_policies USING btree (priority);


--
-- Name: sla_policies_service_catalog_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX sla_policies_service_catalog_id_idx ON public.sla_policies USING btree (service_catalog_id);


--
-- Name: sla_policies_service_item_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX sla_policies_service_item_id_idx ON public.sla_policies USING btree (service_item_id);


--
-- Name: sub_categories_category_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX sub_categories_category_id_name_key ON public.sub_categories USING btree (category_id, name);


--
-- Name: template_categories_department_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_categories_department_id_idx ON public.template_categories USING btree (department_id);


--
-- Name: template_categories_name_parent_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX template_categories_name_parent_id_key ON public.template_categories USING btree (name, parent_id);


--
-- Name: template_metadata_category_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_metadata_category_id_idx ON public.template_metadata USING btree (category_id);


--
-- Name: template_metadata_department_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_metadata_department_id_idx ON public.template_metadata USING btree (department_id);


--
-- Name: template_metadata_is_active_is_public_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_metadata_is_active_is_public_idx ON public.template_metadata USING btree (is_active, is_public);


--
-- Name: template_metadata_popularity_score_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_metadata_popularity_score_idx ON public.template_metadata USING btree (popularity_score);


--
-- Name: template_metadata_service_template_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX template_metadata_service_template_id_key ON public.template_metadata USING btree (service_template_id);


--
-- Name: template_metadata_template_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX template_metadata_template_id_key ON public.template_metadata USING btree (template_id);


--
-- Name: template_usage_logs_created_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_usage_logs_created_at_idx ON public.template_usage_logs USING btree (created_at);


--
-- Name: template_usage_logs_service_template_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_usage_logs_service_template_id_idx ON public.template_usage_logs USING btree (service_template_id);


--
-- Name: template_usage_logs_template_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_usage_logs_template_id_idx ON public.template_usage_logs USING btree (template_id);


--
-- Name: template_usage_logs_user_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX template_usage_logs_user_id_idx ON public.template_usage_logs USING btree (user_id);


--
-- Name: ticket_assignment_logs_assigned_to_user_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_assignment_logs_assigned_to_user_id_idx ON public.ticket_assignment_logs USING btree (assigned_to_user_id);


--
-- Name: ticket_assignment_logs_created_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_assignment_logs_created_at_idx ON public.ticket_assignment_logs USING btree (created_at);


--
-- Name: ticket_assignment_logs_ticket_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_assignment_logs_ticket_id_idx ON public.ticket_assignment_logs USING btree (ticket_id);


--
-- Name: ticket_comments_author_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_comments_author_id_idx ON public.ticket_comments USING btree (author_id);


--
-- Name: ticket_comments_created_at_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_comments_created_at_idx ON public.ticket_comments USING btree (created_at);


--
-- Name: ticket_comments_parent_comment_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_comments_parent_comment_id_idx ON public.ticket_comments USING btree (parent_comment_id);


--
-- Name: ticket_comments_ticket_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX ticket_comments_ticket_id_idx ON public.ticket_comments USING btree (ticket_id);


--
-- Name: ticket_custom_field_values_ticket_id_field_definition_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX ticket_custom_field_values_ticket_id_field_definition_id_key ON public.ticket_custom_field_values USING btree (ticket_id, field_definition_id);


--
-- Name: ticket_service_field_values_ticket_id_field_definition_id_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX ticket_service_field_values_ticket_id_field_definition_id_key ON public.ticket_service_field_values USING btree (ticket_id, field_definition_id);


--
-- Name: ticket_templates_item_id_name_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX ticket_templates_item_id_name_key ON public.ticket_templates USING btree (item_id, name);


--
-- Name: units_code_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX units_code_key ON public.units USING btree (code);


--
-- Name: units_department_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX units_department_id_idx ON public.units USING btree (department_id);


--
-- Name: units_parent_id_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX units_parent_id_idx ON public.units USING btree (parent_id);


--
-- Name: units_unit_type_is_active_idx; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE INDEX units_unit_type_is_active_idx ON public.units USING btree (unit_type, is_active);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: yanrypangouw
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: api_token_usage_logs api_token_usage_logs_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.api_token_usage_logs
    ADD CONSTRAINT api_token_usage_logs_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.api_tokens(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: api_tokens api_tokens_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: auto_assignment_rules auto_assignment_rules_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.auto_assignment_rules
    ADD CONSTRAINT auto_assignment_rules_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: auto_assignment_rules auto_assignment_rules_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.auto_assignment_rules
    ADD CONSTRAINT auto_assignment_rules_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.ticket_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bsg_field_options bsg_field_options_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_field_options
    ADD CONSTRAINT bsg_field_options_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.bsg_template_fields(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bsg_master_data bsg_master_data_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_master_data
    ADD CONSTRAINT bsg_master_data_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.bsg_master_data(id);


--
-- Name: bsg_template_fields bsg_template_fields_field_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_fields
    ADD CONSTRAINT bsg_template_fields_field_type_id_fkey FOREIGN KEY (field_type_id) REFERENCES public.bsg_field_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bsg_template_fields bsg_template_fields_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_fields
    ADD CONSTRAINT bsg_template_fields_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.bsg_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bsg_template_usage_logs bsg_template_usage_logs_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_usage_logs
    ADD CONSTRAINT bsg_template_usage_logs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bsg_template_usage_logs bsg_template_usage_logs_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_usage_logs
    ADD CONSTRAINT bsg_template_usage_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.bsg_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bsg_template_usage_logs bsg_template_usage_logs_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_usage_logs
    ADD CONSTRAINT bsg_template_usage_logs_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bsg_template_usage_logs bsg_template_usage_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_template_usage_logs
    ADD CONSTRAINT bsg_template_usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bsg_templates bsg_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_templates
    ADD CONSTRAINT bsg_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.bsg_template_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bsg_ticket_field_values bsg_ticket_field_values_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_ticket_field_values
    ADD CONSTRAINT bsg_ticket_field_values_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.bsg_template_fields(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bsg_ticket_field_values bsg_ticket_field_values_master_data_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_ticket_field_values
    ADD CONSTRAINT bsg_ticket_field_values_master_data_id_fkey FOREIGN KEY (master_data_id) REFERENCES public.bsg_master_data(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bsg_ticket_field_values bsg_ticket_field_values_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.bsg_ticket_field_values
    ADD CONSTRAINT bsg_ticket_field_values_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_approvals business_approvals_business_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_approvals
    ADD CONSTRAINT business_approvals_business_reviewer_id_fkey FOREIGN KEY (business_reviewer_id) REFERENCES public.users(id);


--
-- Name: business_approvals business_approvals_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_approvals
    ADD CONSTRAINT business_approvals_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: business_hours_config business_hours_config_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_hours_config
    ADD CONSTRAINT business_hours_config_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: business_hours_config business_hours_config_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.business_hours_config
    ADD CONSTRAINT business_hours_config_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE;


--
-- Name: categories categories_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: comment_notifications comment_notifications_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.comment_notifications
    ADD CONSTRAINT comment_notifications_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.ticket_comments(id) ON DELETE CASCADE;


--
-- Name: comment_notifications comment_notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.comment_notifications
    ADD CONSTRAINT comment_notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: custom_field_definitions custom_field_definitions_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.custom_field_definitions
    ADD CONSTRAINT custom_field_definitions_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.ticket_templates(id) ON DELETE CASCADE;


--
-- Name: department_sla_policies department_sla_policies_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.department_sla_policies
    ADD CONSTRAINT department_sla_policies_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: escalation_instances escalation_instances_sla_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.escalation_instances
    ADD CONSTRAINT escalation_instances_sla_policy_id_fkey FOREIGN KEY (sla_policy_id) REFERENCES public.sla_policies(id) ON DELETE CASCADE;


--
-- Name: escalation_instances escalation_instances_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.escalation_instances
    ADD CONSTRAINT escalation_instances_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: holiday_calendar holiday_calendar_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.holiday_calendar
    ADD CONSTRAINT holiday_calendar_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: holiday_calendar holiday_calendar_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.holiday_calendar
    ADD CONSTRAINT holiday_calendar_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE;


--
-- Name: items items_sub_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_sub_category_id_fkey FOREIGN KEY (sub_category_id) REFERENCES public.sub_categories(id) ON DELETE CASCADE;


--
-- Name: kasda_user_profiles kasda_user_profiles_government_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.kasda_user_profiles
    ADD CONSTRAINT kasda_user_profiles_government_entity_id_fkey FOREIGN KEY (government_entity_id) REFERENCES public.government_entities(id);


--
-- Name: kasda_user_profiles kasda_user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.kasda_user_profiles
    ADD CONSTRAINT kasda_user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: master_data_entities master_data_entities_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.master_data_entities
    ADD CONSTRAINT master_data_entities_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: master_data_entities master_data_entities_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.master_data_entities
    ADD CONSTRAINT master_data_entities_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.master_data_entities(id);


--
-- Name: service_catalog service_catalog_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_catalog
    ADD CONSTRAINT service_catalog_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: service_catalog service_catalog_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_catalog
    ADD CONSTRAINT service_catalog_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.service_catalog(id);


--
-- Name: service_field_definitions service_field_definitions_service_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_field_definitions
    ADD CONSTRAINT service_field_definitions_service_item_id_fkey FOREIGN KEY (service_item_id) REFERENCES public.service_items(id) ON DELETE CASCADE;


--
-- Name: service_field_definitions service_field_definitions_service_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_field_definitions
    ADD CONSTRAINT service_field_definitions_service_template_id_fkey FOREIGN KEY (service_template_id) REFERENCES public.service_templates(id) ON DELETE CASCADE;


--
-- Name: service_items service_items_service_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_items
    ADD CONSTRAINT service_items_service_catalog_id_fkey FOREIGN KEY (service_catalog_id) REFERENCES public.service_catalog(id) ON DELETE CASCADE;


--
-- Name: service_templates service_templates_service_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.service_templates
    ADD CONSTRAINT service_templates_service_item_id_fkey FOREIGN KEY (service_item_id) REFERENCES public.service_items(id) ON DELETE CASCADE;


--
-- Name: sla_policies sla_policies_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sla_policies
    ADD CONSTRAINT sla_policies_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: sla_policies sla_policies_service_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sla_policies
    ADD CONSTRAINT sla_policies_service_catalog_id_fkey FOREIGN KEY (service_catalog_id) REFERENCES public.service_catalog(id) ON DELETE CASCADE;


--
-- Name: sla_policies sla_policies_service_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sla_policies
    ADD CONSTRAINT sla_policies_service_item_id_fkey FOREIGN KEY (service_item_id) REFERENCES public.service_items(id) ON DELETE CASCADE;


--
-- Name: sub_categories sub_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: template_categories template_categories_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: template_categories template_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_categories
    ADD CONSTRAINT template_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.template_categories(id);


--
-- Name: template_metadata template_metadata_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: template_metadata template_metadata_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.template_categories(id);


--
-- Name: template_metadata template_metadata_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: template_metadata template_metadata_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: template_metadata template_metadata_service_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_service_template_id_fkey FOREIGN KEY (service_template_id) REFERENCES public.service_templates(id);


--
-- Name: template_metadata template_metadata_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_metadata
    ADD CONSTRAINT template_metadata_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.ticket_templates(id);


--
-- Name: template_usage_logs template_usage_logs_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs
    ADD CONSTRAINT template_usage_logs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: template_usage_logs template_usage_logs_service_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs
    ADD CONSTRAINT template_usage_logs_service_template_id_fkey FOREIGN KEY (service_template_id) REFERENCES public.service_templates(id);


--
-- Name: template_usage_logs template_usage_logs_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs
    ADD CONSTRAINT template_usage_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.ticket_templates(id);


--
-- Name: template_usage_logs template_usage_logs_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs
    ADD CONSTRAINT template_usage_logs_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: template_usage_logs template_usage_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.template_usage_logs
    ADD CONSTRAINT template_usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: ticket_assignment_logs ticket_assignment_logs_assigned_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs
    ADD CONSTRAINT ticket_assignment_logs_assigned_by_user_id_fkey FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignment_logs ticket_assignment_logs_assigned_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs
    ADD CONSTRAINT ticket_assignment_logs_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignment_logs ticket_assignment_logs_assignment_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs
    ADD CONSTRAINT ticket_assignment_logs_assignment_rule_id_fkey FOREIGN KEY (assignment_rule_id) REFERENCES public.auto_assignment_rules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignment_logs ticket_assignment_logs_previous_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs
    ADD CONSTRAINT ticket_assignment_logs_previous_assignee_id_fkey FOREIGN KEY (previous_assignee_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignment_logs ticket_assignment_logs_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_assignment_logs
    ADD CONSTRAINT ticket_assignment_logs_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_attachments ticket_attachments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_attachments ticket_attachments_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ticket_classification_audit ticket_classification_audit_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_classification_audit
    ADD CONSTRAINT ticket_classification_audit_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: ticket_classification_audit ticket_classification_audit_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_classification_audit
    ADD CONSTRAINT ticket_classification_audit_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_comments ticket_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: ticket_comments ticket_comments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ticket_comments ticket_comments_edited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_edited_by_fkey FOREIGN KEY (edited_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ticket_comments ticket_comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.ticket_comments(id);


--
-- Name: ticket_comments ticket_comments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_custom_field_values ticket_custom_field_values_field_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_custom_field_values
    ADD CONSTRAINT ticket_custom_field_values_field_definition_id_fkey FOREIGN KEY (field_definition_id) REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE;


--
-- Name: ticket_custom_field_values ticket_custom_field_values_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_custom_field_values
    ADD CONSTRAINT ticket_custom_field_values_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_service_field_values ticket_service_field_values_field_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_service_field_values
    ADD CONSTRAINT ticket_service_field_values_field_definition_id_fkey FOREIGN KEY (field_definition_id) REFERENCES public.service_field_definitions(id) ON DELETE CASCADE;


--
-- Name: ticket_service_field_values ticket_service_field_values_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_service_field_values
    ADD CONSTRAINT ticket_service_field_values_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_templates ticket_templates_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.ticket_templates
    ADD CONSTRAINT ticket_templates_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_assigned_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: tickets tickets_government_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_government_entity_id_fkey FOREIGN KEY (government_entity_id) REFERENCES public.government_entities(id);


--
-- Name: tickets tickets_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: tickets tickets_service_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_service_catalog_id_fkey FOREIGN KEY (service_catalog_id) REFERENCES public.service_catalog(id);


--
-- Name: tickets tickets_service_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_service_item_id_fkey FOREIGN KEY (service_item_id) REFERENCES public.service_items(id);


--
-- Name: tickets tickets_service_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_service_template_id_fkey FOREIGN KEY (service_template_id) REFERENCES public.service_templates(id);


--
-- Name: tickets tickets_tech_categorized_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_tech_categorized_by_fkey FOREIGN KEY (tech_categorized_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.ticket_templates(id);


--
-- Name: units units_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: units units_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.units(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: users users_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yanrypangouw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: yanrypangouw
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

