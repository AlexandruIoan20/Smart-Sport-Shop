CREATE OR REPLACE PROCEDURE complete_user_profile(
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
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_budget_min IS NOT NULL AND p_budget_max IS NOT NULL
       AND p_budget_max < p_budget_min THEN
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
    ON CONFLICT (user_id) DO UPDATE SET
        occupation            = EXCLUDED.occupation,
        goal                  = EXCLUDED.goal,
        preferred_environment = EXCLUDED.preferred_environment,
        daily_schedule        = EXCLUDED.daily_schedule,
        free_hours_week       = EXCLUDED.free_hours_week,
        activity_level        = EXCLUDED.activity_level,
        effort_tolerance      = EXCLUDED.effort_tolerance,
        prefers_team          = EXCLUDED.prefers_team,
        medical_notes         = EXCLUDED.medical_notes,
        budget_min            = EXCLUDED.budget_min,
        budget_max            = EXCLUDED.budget_max,
        updated_at            = now();
END;
$$;