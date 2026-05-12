CREATE OR REPLACE FUNCTION evaluate_user_level(p_profile_id UUID)
RETURNS current_level_type AS $$
DECLARE
    v_activity_level  activity_level_type;
    v_effort          effort_tolerance_type;
    v_free_hours      INT;
    v_score           INT := 0;
BEGIN
    SELECT activity_level, effort_tolerance, free_hours_week
    INTO   v_activity_level, v_effort, v_free_hours
    FROM   user_profiles
    WHERE  id = p_profile_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0101';
    END IF;

    v_score := v_score + CASE v_activity_level
        WHEN 'SEDENTARY'   THEN 0
        WHEN 'LIGHT'       THEN 1
        WHEN 'MODERATE'    THEN 2
        WHEN 'ACTIVE'      THEN 3
        WHEN 'VERY_ACTIVE' THEN 4
        ELSE 0
    END;

    v_score := v_score + CASE v_effort
        WHEN 'LOW'    THEN 0
        WHEN 'MEDIUM' THEN 2
        WHEN 'HIGH'   THEN 4
        ELSE 0
    END;

    v_score := v_score + CASE
        WHEN v_free_hours >= 10 THEN 2
        WHEN v_free_hours >= 5  THEN 1
        ELSE 0
    END;

    RETURN CASE
        WHEN v_score >= 7 THEN 'ADVANCED'::current_level_type
        WHEN v_score >= 4 THEN 'INTERMEDIATE'::current_level_type
        ELSE 'BEGINNER'::current_level_type
    END;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION calculate_sport_scores(p_profile_id UUID)
RETURNS TABLE (
    sport_id            UUID,
    sport_name          VARCHAR,
    compatibility_score NUMERIC
) AS $$
DECLARE
    v_goal            goal_type;
    v_environment     environment_type;
    v_activity_level  activity_level_type;
    v_daily_schedule  daily_schedule_type;
    v_effort          effort_tolerance_type;
    v_prefers_team    BOOLEAN;
BEGIN
    SELECT
        goal, preferred_environment, activity_level,
        daily_schedule, effort_tolerance, prefers_team
    INTO
        v_goal, v_environment, v_activity_level,
        v_daily_schedule, v_effort, v_prefers_team
    FROM user_profiles
    WHERE id = p_profile_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0101';
    END IF;

    IF v_goal IS NULL OR v_environment IS NULL OR v_activity_level IS NULL THEN
        RAISE EXCEPTION 'PROFILE_INCOMPLETE: Lipsesc campuri obligatorii'
            USING ERRCODE = 'P0102';
    END IF;

    RETURN QUERY
    SELECT
        s.id          AS sport_id,
        s.name        AS sport_name,
        ROUND(
            SUM(sc.weight) *
            CASE
                WHEN v_prefers_team = true  AND s.is_team_sport = true  THEN 1.2
                WHEN v_prefers_team = false AND s.is_team_sport = false THEN 1.2
                WHEN v_prefers_team IS NOT NULL                         THEN 0.8
                ELSE 1.0
            END
        , 2) AS compatibility_score
    FROM sports s
    JOIN sport_criteria sc ON sc.sport_id = s.id
    WHERE s.is_active = true
      AND (
          (sc.criteria_key = 'goal'             AND sc.criteria_value = v_goal::TEXT)
       OR (sc.criteria_key = 'environment'      AND sc.criteria_value = v_environment::TEXT)
       OR (sc.criteria_key = 'activity_level'   AND sc.criteria_value = v_activity_level::TEXT)
       OR (sc.criteria_key = 'daily_schedule'   AND sc.criteria_value = v_daily_schedule::TEXT)
       OR (sc.criteria_key = 'effort_tolerance' AND sc.criteria_value = v_effort::TEXT)
      )
    GROUP BY s.id, s.name, s.is_team_sport
    ORDER BY compatibility_score DESC;
END;
$$ LANGUAGE plpgsql;