CREATE TYPE questionnaire_status_type AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'ABANDONED',
    'EXPIRED',
    'RECOMPUTED'
);

CREATE TABLE questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP NOT NULL DEFAULT now(),
    status questionnaire_status_type NOT NULL DEFAULT 'COMPLETED',
    computed_level VARCHAR(20)
);

CREATE TABLE questionnaire_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_key VARCHAR(100) NOT NULL,
    answer_value VARCHAR(255) NOT NULL,
    UNIQUE (questionnaire_id, question_key)
);

CREATE TABLE recommendation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    user_level_at_time VARCHAR(20) NOT NULL
);

CREATE TABLE recommendation_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES recommendation_sessions(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id),
    compatibility_score NUMERIC(5,2) NOT NULL,
    rank INT NOT NULL,
    UNIQUE (session_id, sport_id)
);

CREATE TABLE recommendation_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES recommendation_sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    sport_id UUID NOT NULL REFERENCES sports(id),
    reason VARCHAR(255),
    UNIQUE (session_id, product_id)
);