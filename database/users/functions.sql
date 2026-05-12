CREATE OR REPLACE FUNCTION register_user(
    p_username      VARCHAR,
    p_email         VARCHAR,
    p_password_hash VARCHAR,
    p_first_name    VARCHAR,
    p_last_name     VARCHAR,
    p_birth_date    DATE
) RETURNS UUID AS $$
DECLARE
    v_new_user_id UUID;
BEGIN
    INSERT INTO users (username, email, password_hash, first_name, last_name, birth_date)
    VALUES (p_username, p_email, p_password_hash, p_first_name, p_last_name, p_birth_date)
    RETURNING id INTO v_new_user_id;

    RETURN v_new_user_id;

EXCEPTION
    WHEN unique_violation THEN
        IF SQLERRM LIKE '%users_email_key%' THEN
            RAISE EXCEPTION 'EMAIL_ALREADY_EXISTS';
        ELSIF SQLERRM LIKE '%users_username_key%' THEN
            RAISE EXCEPTION 'USERNAME_ALREADY_EXISTS';
        ELSE
            RAISE; 
        END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_for_login(p_email VARCHAR)
RETURNS TABLE (
    id            UUID,
    password_hash VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.password_hash FROM users u WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS TABLE (
    occupation            VARCHAR,
    goal                  goal_type,
    preferred_environment environment_type,
    daily_schedule        daily_schedule_type,
    free_hours_week       INT,
    activity_level        activity_level_type,
    effort_tolerance      effort_tolerance_type,
    prefers_team          BOOLEAN,
    medical_notes         TEXT,
    budget_min            NUMERIC,
    budget_max            NUMERIC,
    updated_at            TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.occupation,
        up.goal,
        up.preferred_environment,
        up.daily_schedule,
        up.free_hours_week,
        up.activity_level,
        up.effort_tolerance,
        up.prefers_team,
        up.medical_notes,
        up.budget_min,
        up.budget_max,
        up.updated_at
    FROM user_profiles up
    WHERE up.user_id = p_user_id
    ORDER BY up.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION complete_user_profile(
    p_user_id               UUID,
    p_occupation            VARCHAR,
    p_goal                  goal_type,
    p_preferred_environment environment_type,
    p_daily_schedule        daily_schedule_type,
    p_free_hours_week       INT,
    p_activity_level        activity_level_type,
    p_effort_tolerance      effort_tolerance_type,
    p_prefers_team          BOOLEAN,
    p_medical_notes         TEXT,
    p_budget_min            NUMERIC,
    p_budget_max            NUMERIC
) RETURNS UUID AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    IF p_goal IS NULL THEN
        RAISE EXCEPTION 'GOAL_REQUIRED'
            USING ERRCODE = 'P0103';
    END IF;

    IF p_preferred_environment IS NULL THEN
        RAISE EXCEPTION 'ENVIRONMENT_REQUIRED'
            USING ERRCODE = 'P0104';
    END IF;

    IF p_activity_level IS NULL THEN
        RAISE EXCEPTION 'ACTIVITY_LEVEL_REQUIRED'
            USING ERRCODE = 'P0105';
    END IF;

    IF p_effort_tolerance IS NULL THEN
        RAISE EXCEPTION 'EFFORT_TOLERANCE_REQUIRED'
            USING ERRCODE = 'P0106';
    END IF;

    IF p_prefers_team IS NULL THEN
        RAISE EXCEPTION 'PREFERS_TEAM_REQUIRED'
            USING ERRCODE = 'P0107';
    END IF;

    IF p_daily_schedule IS NULL THEN
        RAISE EXCEPTION 'DAILY_SCHEDULE_REQUIRED'
            USING ERRCODE = 'P0108';
    END IF;

    IF p_free_hours_week IS NULL THEN
        RAISE EXCEPTION 'FREE_HOURS_REQUIRED'
            USING ERRCODE = 'P0109';
    END IF;

    IF p_budget_min IS NULL OR p_budget_max IS NULL THEN
        RAISE EXCEPTION 'BUDGET_REQUIRED'
            USING ERRCODE = 'P0110';
    END IF;

    IF p_budget_max < p_budget_min THEN
        RAISE EXCEPTION 'BUDGET_INVALID: budget_max < budget_min'
            USING ERRCODE = 'P0100';
    END IF;

    INSERT INTO user_profiles (
        user_id, occupation, goal, preferred_environment,
        daily_schedule, free_hours_week, activity_level,
        effort_tolerance, prefers_team, medical_notes,
        budget_min, budget_max, updated_at
    )
    VALUES (
        p_user_id, p_occupation, p_goal, p_preferred_environment,
        p_daily_schedule, p_free_hours_week, p_activity_level,
        p_effort_tolerance, p_prefers_team, p_medical_notes,
        p_budget_min, p_budget_max, now()
    )
    RETURNING id INTO v_profile_id;

    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql;