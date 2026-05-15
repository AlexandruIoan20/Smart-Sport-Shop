CREATE TYPE daily_schedule_type AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'FLEXIBLE',
    'STUDENT',
    'RETIRED'
);

CREATE TYPE activity_level_type AS ENUM (
    'SEDENTARY',
    'LIGHT',
    'MODERATE',
    'ACTIVE',
    'VERY_ACTIVE'
);

CREATE TYPE goal_type AS ENUM (
    'WEIGHT_LOSS', 
    'MUSCLE_GAIN', 
    'CARDIO', 
    'STRESS_RELIEF', 
    'FLEXIBILITY'
);

CREATE TYPE environment_type AS ENUM (
    'INDOOR', 
    'OUTDOOR', 
    'BOTH'
);

CREATE TYPE effort_tolerance_type AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    address       TEXT, 
    birth_date    DATE         NOT NULL,
    phone         VARCHAR(20),
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE user_profiles (
    id                    UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    occupation            VARCHAR(100),         
    goal                  goal_type             NOT NULL,
    preferred_environment environment_type      NOT NULL,
    daily_schedule        daily_schedule_type   NOT NULL,
    free_hours_week       INT                   NOT NULL CHECK (free_hours_week BETWEEN 0 AND 168),
    activity_level        activity_level_type   NOT NULL, 
    effort_tolerance      effort_tolerance_type NOT NULL, 
    prefers_team          BOOLEAN               NOT NULL,
    medical_notes         TEXT,
    budget_min            NUMERIC(10, 2)        NOT NULL CHECK (budget_min >= 0),
    budget_max            NUMERIC(10, 2)        NOT NULL CHECK (budget_max >= 0),
    updated_at            TIMESTAMP             NOT NULL DEFAULT now(),

    CONSTRAINT budget_range_valid CHECK (
        budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min
    )
);