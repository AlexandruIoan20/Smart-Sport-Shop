CREATE OR REPLACE PROCEDURE complete_user_profile(
    p_user_id UUID,
    p_occupation VARCHAR,
    p_goal goal_type,
    p_preferred_environment environment_type,
    p_daily_schedule daily_schedule_type,
    p_free_hours_week INT,
    p_activity_level activity_level_type,
    p_budget_min NUMERIC,
    p_budget_max NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE user_profiles
    SET 
        occupation = p_occupation,
        goal = p_goal,
        preferred_environment = p_preferred_environment,
        daily_schedule = p_daily_schedule,
        free_hours_week = p_free_hours_week,
        activity_level = p_activity_level,
        budget_min = p_budget_min,
        budget_max = p_budget_max,
        updated_at = now()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_PROFILE_NOT_FOUND';
    END IF;
END;
$$;