CREATE TYPE current_level_type AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);

CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_team_sport BOOLEAN NOT NULL DEFAULT false,
    is_outdoor BOOLEAN NOT NULL DEFAULT true,
    effort_level INT NOT NULL CHECK (effort_level BETWEEN 1 AND 5),
    min_budget NUMERIC(10, 2),
    image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE user_sport_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    current_level current_level_type NOT NULL DEFAULT 'BEGINNER',
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    last_updated TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, sport_id)
);

CREATE TABLE sport_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    criteria_key VARCHAR(50) NOT NULL,
    criteria_value VARCHAR(50) NOT NULL,
    weight NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    UNIQUE (sport_id, criteria_key, criteria_value)
);