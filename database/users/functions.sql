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

    INSERT INTO user_profiles (user_id) 
    VALUES (v_new_user_id);

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
    WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;