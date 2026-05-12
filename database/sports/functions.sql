CREATE OR REPLACE FUNCTION get_all_sports()
RETURNS TABLE (
    sport_id         UUID,
    name             VARCHAR,
    description      TEXT,
    is_team_sport    BOOLEAN,
    is_outdoor       BOOLEAN,
    effort_level     INT,
    min_budget       NUMERIC,
    image_url        VARCHAR,
    is_active        BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS sport_id,
        s.name,
        s.description,
        s.is_team_sport,
        s.is_outdoor,
        s.effort_level,
        s.min_budget,
        s.image_url,
        s.is_active
    FROM sports s
    WHERE s.is_active = true
    ORDER BY s.name ASC;
END;
$$ LANGUAGE plpgsql;