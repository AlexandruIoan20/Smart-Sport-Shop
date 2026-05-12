CREATE TABLE recommendation_sessions (  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES user_profiles(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    user_level_at_time current_level_type NOT NULL
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