CREATE OR REPLACE FUNCTION calculate_sport_scores(p_questionnaire_id UUID)
RETURNS TABLE (
    sport_id            UUID,
    sport_name          VARCHAR,
    compatibility_score NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_goal               VARCHAR(50);
    v_environment        VARCHAR(50);
    v_activity_level     VARCHAR(50);
    v_daily_schedule     VARCHAR(50);
    v_effort_tolerance   VARCHAR(50);
    v_prefers_team       VARCHAR(10);
BEGIN
    SELECT answer_value INTO v_goal
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'goal';

    SELECT answer_value INTO v_environment
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'preferred_environment';

    SELECT answer_value INTO v_activity_level
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'activity_level';

    SELECT answer_value INTO v_daily_schedule
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'daily_schedule';

    SELECT answer_value INTO v_effort_tolerance
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'effort_tolerance';

    SELECT answer_value INTO v_prefers_team
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'prefers_team';

    IF v_goal IS NULL OR v_environment IS NULL OR v_activity_level IS NULL THEN
        RAISE EXCEPTION 'QUESTIONNAIRE_INCOMPLETE: Lipsesc raspunsuri obligatorii'
            USING ERRCODE = 'P0101';
    END IF;

    RETURN QUERY
    SELECT
        s.id AS sport_id,
        s.name AS sport_name,
        ROUND(
            SUM(sc.weight) *
            CASE
                WHEN v_prefers_team = 'true'  AND s.is_team_sport = true  THEN 1.2
                WHEN v_prefers_team = 'false' AND s.is_team_sport = false THEN 1.2
                WHEN v_prefers_team IS NOT NULL THEN 0.8
                ELSE 1.0
            END
        , 2) AS compatibility_score
    FROM sports s
    JOIN sport_criteria sc ON sc.sport_id = s.id
    WHERE s.is_active = true
      AND (
          (sc.criteria_key = 'goal'             AND sc.criteria_value = v_goal)
       OR (sc.criteria_key = 'environment'      AND sc.criteria_value = v_environment)
       OR (sc.criteria_key = 'activity_level'   AND sc.criteria_value = v_activity_level)
       OR (sc.criteria_key = 'daily_schedule'   AND sc.criteria_value = v_daily_schedule)
       OR (sc.criteria_key = 'effort_tolerance' AND sc.criteria_value = v_effort_tolerance)
      )
    GROUP BY s.id, s.name, s.is_team_sport
    ORDER BY compatibility_score DESC;
END;
$$;

CREATE OR REPLACE FUNCTION evaluate_user_level(p_questionnaire_id UUID)
RETURNS current_level_type
LANGUAGE plpgsql
AS $$
DECLARE
    v_activity_level  VARCHAR(50);
    v_effort          VARCHAR(50);
    v_free_hours      INT;
    v_score           INT := 0;
BEGIN
    SELECT answer_value INTO v_activity_level
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'activity_level';

    SELECT answer_value INTO v_effort
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'effort_tolerance';

    SELECT answer_value::INT INTO v_free_hours
        FROM questionnaire_answers
        WHERE questionnaire_id = p_questionnaire_id AND question_key = 'free_hours_week';

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
$$;

CREATE OR REPLACE FUNCTION submit_questionnaire(
    p_user_id UUID,
    p_answers  JSONB
)
RETURNS UUID 
LANGUAGE plpgsql
AS $$
DECLARE
    v_questionnaire_id  UUID;
    v_session_id        UUID;
    v_computed_level    current_level_type;
    v_answer_key        TEXT;
    v_answer_value      TEXT;
    v_rank              INT := 1;
    v_sport             RECORD;
BEGIN
    INSERT INTO questionnaires (user_id, status)
    VALUES (p_user_id, 'COMPLETED')
    RETURNING id INTO v_questionnaire_id;

    FOR v_answer_key, v_answer_value IN
        SELECT key, value::TEXT FROM jsonb_each_text(p_answers)
    LOOP
        INSERT INTO questionnaire_answers (questionnaire_id, question_key, answer_value)
        VALUES (v_questionnaire_id, v_answer_key, v_answer_value);
    END LOOP;

    v_computed_level := evaluate_user_level(v_questionnaire_id);

    UPDATE questionnaires
    SET computed_level = v_computed_level
    WHERE id = v_questionnaire_id;

    UPDATE user_profiles
    SET current_level = v_computed_level, updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO recommendation_sessions (user_id, questionnaire_id, user_level_at_time)
    VALUES (p_user_id, v_questionnaire_id, v_computed_level::TEXT)
    RETURNING id INTO v_session_id;

    FOR v_sport IN
        SELECT sport_id, compatibility_score
        FROM calculate_sport_scores(v_questionnaire_id)
        LIMIT 5
    LOOP
        INSERT INTO recommendation_sports (session_id, sport_id, compatibility_score, rank)
        VALUES (v_session_id, v_sport.sport_id, v_sport.compatibility_score, v_rank);
        v_rank := v_rank + 1;
    END LOOP;

    RETURN v_session_id;
END;
$$;