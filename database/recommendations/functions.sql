CREATE OR REPLACE FUNCTION evaluate_user_level(p_profile_id UUID)
RETURNS current_level_type AS $$
DECLARE
    v_activity_level activity_level_type;
    v_effort effort_tolerance_type;
    v_free_hours INT;
    v_score INT := 0;
BEGIN
    SELECT activity_level, effort_tolerance, free_hours_week
    INTO v_activity_level, v_effort, v_free_hours
    FROM user_profiles
    WHERE id = p_profile_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PROFILE_NOT_FOUND'
            USING ERRCODE = 'P0101';
    END IF;

    v_score := v_score + CASE v_activity_level
        WHEN 'SEDENTARY' THEN 0
        WHEN 'LIGHT' THEN 1
        WHEN 'MODERATE' THEN 2
        WHEN 'ACTIVE' THEN 3
        WHEN 'VERY_ACTIVE' THEN 4
        ELSE 0
    END;

    v_score := v_score + CASE v_effort
        WHEN 'LOW' THEN 0
        WHEN 'MEDIUM' THEN 2
        WHEN 'HIGH' THEN 4
        ELSE 0
    END;

    v_score := v_score + CASE
        WHEN v_free_hours >= 10 THEN 2
        WHEN v_free_hours >= 5 THEN 1
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
    sport_id UUID,
    sport_name VARCHAR,
    compatibility_score NUMERIC
) AS $$
DECLARE
    v_goal goal_type;
    v_environment environment_type;
    v_activity_level activity_level_type;
    v_daily_schedule daily_schedule_type;
    v_effort effort_tolerance_type;
    v_prefers_team BOOLEAN;
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
        s.id AS sport_id,
        s.name AS sport_name,
        ROUND(
            SUM(sc.weight) *
            CASE
                WHEN v_prefers_team = true  AND s.is_team_sport = true  THEN 1.2
                WHEN v_prefers_team = false AND s.is_team_sport = false THEN 1.2
                WHEN v_prefers_team IS NOT NULL THEN 0.8
                ELSE 1.0
            END
        , 2) AS compatibility_score
    FROM sports s
    JOIN sport_criteria sc ON sc.sport_id = s.id
    WHERE s.is_active = true
      AND (
          (sc.criteria_key = 'goal' AND sc.criteria_value = v_goal::TEXT)
       OR (sc.criteria_key = 'environment' AND sc.criteria_value = v_environment::TEXT)
       OR (sc.criteria_key = 'activity_level' AND sc.criteria_value = v_activity_level::TEXT)
       OR (sc.criteria_key = 'daily_schedule' AND sc.criteria_value = v_daily_schedule::TEXT)
       OR (sc.criteria_key = 'effort_tolerance' AND sc.criteria_value = v_effort::TEXT)
      )
    GROUP BY s.id, s.name, s.is_team_sport
    ORDER BY compatibility_score DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_product_recommendations(p_session_id UUID)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR,
    category_id UUID,
    category_name VARCHAR,
    sport_id UUID,
    sport_name VARCHAR,
    price NUMERIC,
    brand VARCHAR,
    image_url VARCHAR,
    target_level VARCHAR,
    reason VARCHAR
) AS $$
DECLARE
    v_user_id UUID;
    v_budget_min NUMERIC;
    v_budget_max NUMERIC;
    v_user_level current_level_type;
BEGIN
    SELECT rs.user_id, rs.user_level_at_time::current_level_type
    INTO v_user_id, v_user_level
    FROM recommendation_sessions rs
    WHERE rs.id = p_session_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SESSION_NOT_FOUND'
            USING ERRCODE = 'P0301';
    END IF;

    SELECT up.budget_min, up.budget_max
    INTO v_budget_min, v_budget_max
    FROM user_profiles up
    WHERE up.user_id = v_user_id
    ORDER BY up.updated_at DESC
    LIMIT 1;

    RETURN QUERY
    WITH
    recommended_sports AS (
        SELECT rsp.sport_id,
               rsp.compatibility_score,
               rsp.rank
        FROM recommendation_sports rsp
        WHERE rsp.session_id = p_session_id
    ),

    candidate_products AS (
        SELECT
            p.id AS product_id,
            p.name AS product_name,
            p.category_id,
            cat.name AS category_name,
            p.sport_id,
            s.name AS sport_name,
            p.price,
            p.brand,
            p.image_url,
            p.target_level,
            st.quantity AS stock_quantity,
            rec.compatibility_score AS sport_score,
            rec.rank AS sport_rank,

            (
                CASE p.target_level
                    WHEN v_user_level::TEXT THEN 40
                    WHEN CASE v_user_level
                            WHEN 'BEGINNER' THEN 'INTERMEDIATE'
                            WHEN 'INTERMEDIATE' THEN 'ADVANCED'
                            WHEN 'ADVANCED' THEN 'INTERMEDIATE'
                        END THEN 20
                    ELSE 0
                END

                + CASE
                    WHEN p.price BETWEEN v_budget_min AND v_budget_max THEN 30
                    WHEN p.price < v_budget_min THEN 10
                    WHEN p.price > v_budget_max AND p.price <= v_budget_max * 1.2 THEN 5
                    ELSE 0
                  END

                + CASE rec.rank
                    WHEN 1 THEN 20
                    WHEN 2 THEN 15
                    WHEN 3 THEN 10
                    WHEN 4 THEN 5
                    ELSE 3
                  END

                + CASE
                    WHEN st.quantity > 10 THEN 10
                    WHEN st.quantity > 0  THEN 5
                    ELSE 0
                  END
            ) AS product_score

        FROM products p
        JOIN categories cat ON cat.id = p.category_id
        JOIN sports s ON s.id = p.sport_id
        JOIN stock st  ON st.product_id = p.id
        JOIN recommended_sports rec ON rec.sport_id = p.sport_id
        WHERE p.is_active = true
          AND st.quantity > 0
          AND p.price <= v_budget_max * 1.2
    ),

    best_per_category AS (
        SELECT DISTINCT ON (cp.category_id)
            cp.product_id,
            cp.product_name,
            cp.category_id,
            cp.category_name,
            cp.sport_id,
            cp.sport_name,
            cp.price,
            cp.brand,
            cp.image_url,
            cp.target_level,
            cp.product_score,
            cp.sport_rank
        FROM   candidate_products cp
        ORDER BY
            cp.category_id,
            cp.product_score DESC,
            cp.price ASC
    )

    SELECT
        bpc.product_id,
        bpc.product_name,
        bpc.category_id,
        bpc.category_name,
        bpc.sport_id,
        bpc.sport_name,
        bpc.price,
        bpc.brand,
        bpc.image_url,
        bpc.target_level,

        (
            'Recomandat pentru ' || bpc.sport_name ||
            ' | Nivel: '         || bpc.target_level ||
            ' | Scor: '          || bpc.product_score::TEXT
        )::VARCHAR AS reason

    FROM   best_per_category bpc
    ORDER BY bpc.sport_rank ASC, bpc.product_score DESC;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_recommendations_by_session(p_session_id UUID)
RETURNS TABLE (
    session_id UUID,
    user_level VARCHAR,
    created_at TIMESTAMP,
    sport_id UUID,
    sport_name VARCHAR,
    sport_description   TEXT,
    compatibility_score NUMERIC,
    rank INT,
    is_team_sport BOOLEAN,
    is_outdoor BOOLEAN,
    effort_level INT,
    sport_image_url VARCHAR,
    product_id UUID,
    product_name VARCHAR,
    category_name VARCHAR,
    product_sport_name  VARCHAR,
    price NUMERIC,
    brand VARCHAR,
    product_image_url   VARCHAR,
    target_level VARCHAR,
    reason VARCHAR,
    stock_quantity INT
) AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM recommendation_sessions rs WHERE rs.id = p_session_id
    ) THEN
        RAISE EXCEPTION 'SESSION_NOT_FOUND'
            USING ERRCODE = 'P0301';
    END IF;

    RETURN QUERY
    SELECT
        rs.id AS session_id,
        rs.user_level_at_time::VARCHAR AS user_level,
        rs.created_at,
        s.id AS sport_id,
        s.name AS sport_name,
        s.description AS sport_description,
        rsp.compatibility_score,
        rsp.rank,
        s.is_team_sport,
        s.is_outdoor,
        s.effort_level,
        s.image_url AS sport_image_url,
        p.id AS product_id,
        p.name AS product_name,
        c.name AS category_name,
        ps.name AS product_sport_name,
        p.price,
        p.brand,
        p.image_url AS product_image_url,
        p.target_level,
        rpr.reason,
        st.quantity AS stock_quantity
    FROM recommendation_sessions rs
    JOIN recommendation_sports  rsp ON rsp.session_id  = rs.id
    JOIN sports s   ON s.id = rsp.sport_id
    LEFT JOIN recommendation_products rpr ON rpr.session_id = rs.id
    LEFT JOIN products p ON p.id = rpr.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN sports ps ON ps.id = p.sport_id
    LEFT JOIN stock st  ON st.product_id = p.id
    WHERE rs.id = p_session_id
    ORDER BY rsp.rank ASC, p.id ASC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_latest_session_by_user(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    SELECT id INTO v_session_id
    FROM recommendation_sessions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NO_RECOMMENDATIONS_FOUND'
            USING ERRCODE = 'P0302';
    END IF;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_recommendation_history(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    created_at TIMESTAMP,
    user_level_at_time  current_level_type,
    sports JSONB,
    products JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rs.id AS session_id,
        rs.created_at,
        rs.user_level_at_time,

        COALESCE(
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'sportId', sp.id,
                        'sportName', sp.name,
                        'sportDescription', sp.description,
                        'imageUrl', sp.image_url,
                        'isTeamSport', sp.is_team_sport,
                        'isOutdoor', sp.is_outdoor,
                        'effortLevel', sp.effort_level,
                        'compatibilityScore', rsp.compatibility_score,
                        'rank', rsp.rank
                    ) ORDER BY rsp.rank ASC
                )
                FROM recommendation_sports rsp
                JOIN sports sp ON sp.id = rsp.sport_id
                WHERE rsp.session_id = rs.id
            ),
            '[]'::JSONB
        ) AS sports,

        COALESCE(
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'productId', p.id,
                        'productName', p.name,
                        'imageUrl', p.image_url,
                        'price', p.price,
                        'brand', p.brand,
                        'reason', rp.reason,
                        'sportId', sp2.id,
                        'sportName', sp2.name
                    )
                )
                FROM recommendation_products rp
                JOIN products p  ON p.id  = rp.product_id
                JOIN sports sp2  ON sp2.id = rp.sport_id
                WHERE rp.session_id = rs.id
            ),
            '[]'::JSONB
        ) AS products

    FROM recommendation_sessions rs
    WHERE rs.user_id = p_user_id
    ORDER BY rs.created_at DESC;
END;
$$;