CREATE OR REPLACE FUNCTION trg_generate_recommendations_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM generate_recommendations(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_generate_recommendations
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trg_generate_recommendations_fn();