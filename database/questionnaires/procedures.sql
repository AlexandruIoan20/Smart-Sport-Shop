CREATE OR REPLACE FUNCTION generate_recommendations(p_profile_id UUID)
RETURNS UUID AS $$
DECLARE
    v_session_id        UUID;
    v_computed_level    current_level_type;
    v_user_id           UUID;
    v_rank              INT := 1;
    v_sport             RECORD;
BEGIN
    SELECT user_id INTO v_user_id
    FROM   user_profiles
    WHERE  id = p_profile_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0101';
    END IF;

    v_computed_level := evaluate_user_level(p_profile_id);

    INSERT INTO recommendation_sessions (user_id, profile_id, user_level_at_time)
    VALUES (v_user_id, p_profile_id, v_computed_level)
    RETURNING id INTO v_session_id;

    FOR v_sport IN
        SELECT sport_id, compatibility_score
        FROM   calculate_sport_scores(p_profile_id)
        LIMIT  5
    LOOP
        INSERT INTO recommendation_sports (session_id, sport_id, compatibility_score, rank)
        VALUES (v_session_id, v_sport.sport_id, v_sport.compatibility_score, v_rank);

        v_rank := v_rank + 1;
    END LOOP;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;