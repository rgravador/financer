-- =====================================================
-- Seed Loan Types Data
-- =====================================================
-- This script adds sample loan type TEMPLATES for each tenant
-- These serve as defaults/suggestions that can be overridden when creating loans
-- =====================================================

-- Insert sample loan types for each tenant
-- =====================================================

DO $$
DECLARE
    tenant_record RECORD;
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID for created_by
    SELECT id INTO admin_user_id 
    FROM users_profile 
    WHERE role = 'admin' 
    LIMIT 1;

    -- If no admin user exists, use the first tenant_admin
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id 
        FROM users_profile 
        WHERE role = 'tenant_admin' 
        LIMIT 1;
    END IF;

    -- For each tenant, create sample loan types
    FOR tenant_record IN SELECT id, name FROM tenants WHERE is_active = true
    LOOP
        -- Personal Loan
        INSERT INTO loan_types (
            tenant_id,
            name,
            description,
            min_amount,
            max_amount,
            min_tenure_months,
            max_tenure_months,
            interest_rate,
            payment_frequencies,
            is_active,
            created_by
        ) VALUES (
            tenant_record.id,
            'Personal Loan',
            'General purpose personal loans for individual borrowers with flexible terms and competitive rates.',
            5000.00,
            500000.00,
            6,
            36,
            12.50,
            ARRAY['monthly', 'bi-monthly']::payment_frequency[],
            true,
            admin_user_id
        );

        -- Business Loan
        INSERT INTO loan_types (
            tenant_id,
            name,
            description,
            min_amount,
            max_amount,
            min_tenure_months,
            max_tenure_months,
            interest_rate,
            payment_frequencies,
            is_active,
            created_by
        ) VALUES (
            tenant_record.id,
            'Business Loan',
            'Capital loans for small and medium enterprises to fund business operations, equipment, or expansion.',
            25000.00,
            2000000.00,
            12,
            60,
            15.00,
            ARRAY['monthly']::payment_frequency[],
            true,
            admin_user_id
        );

        -- Quick Cash Loan
        INSERT INTO loan_types (
            tenant_id,
            name,
            description,
            min_amount,
            max_amount,
            min_tenure_months,
            max_tenure_months,
            interest_rate,
            payment_frequencies,
            is_active,
            created_by
        ) VALUES (
            tenant_record.id,
            'Quick Cash',
            'Fast approval short-term loans for emergency expenses with higher interest rates.',
            1000.00,
            50000.00,
            1,
            6,
            25.00,
            ARRAY['weekly', 'bi-monthly', 'monthly']::payment_frequency[],
            true,
            admin_user_id
        );

        -- Mortgage Loan
        INSERT INTO loan_types (
            tenant_id,
            name,
            description,
            min_amount,
            max_amount,
            min_tenure_months,
            max_tenure_months,
            interest_rate,
            payment_frequencies,
            is_active,
            created_by
        ) VALUES (
            tenant_record.id,
            'Home Mortgage',
            'Long-term real estate financing for home purchases with property as collateral.',
            500000.00,
            10000000.00,
            60,
            300,
            8.75,
            ARRAY['monthly']::payment_frequency[],
            true,
            admin_user_id
        );

        -- Auto Loan
        INSERT INTO loan_types (
            tenant_id,
            name,
            description,
            min_amount,
            max_amount,
            min_tenure_months,
            max_tenure_months,
            interest_rate,
            payment_frequencies,
            is_active,
            created_by
        ) VALUES (
            tenant_record.id,
            'Auto Loan',
            'Vehicle financing for cars, motorcycles, and other automotive purchases.',
            100000.00,
            3000000.00,
            12,
            84,
            10.50,
            ARRAY['monthly', 'bi-monthly']::payment_frequency[],
            true,
            admin_user_id
        );

        -- Student Loan (inactive example)
        INSERT INTO loan_types (
            tenant_id,
            name,
            description,
            min_amount,
            max_amount,
            min_tenure_months,
            max_tenure_months,
            interest_rate,
            payment_frequencies,
            is_active,
            created_by
        ) VALUES (
            tenant_record.id,
            'Education Loan',
            'Educational financing for tuition, books, and school-related expenses. Currently suspended.',
            10000.00,
            1000000.00,
            6,
            120,
            6.00,
            ARRAY['monthly']::payment_frequency[],
            false, -- This one is inactive
            admin_user_id
        );

        -- Log the creation
        INSERT INTO transactions (
            type,
            user_id,
            details
        ) VALUES (
            'create_loan_type',
            admin_user_id,
            jsonb_build_object(
                'action', 'seed_data',
                'tenant_id', tenant_record.id,
                'tenant_name', tenant_record.name,
                'loan_types_created', 6,
                'timestamp', NOW()
            )
        );

    END LOOP;

    -- Output success message
    RAISE NOTICE 'Successfully seeded loan types for all active tenants';

END $$;