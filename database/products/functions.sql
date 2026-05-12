CREATE OR REPLACE FUNCTION get_all_categories()
RETURNS TABLE (
    category_id  UUID,
    name         VARCHAR,
    parent_id    UUID,
    description  TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS category_id,
        c.name,
        c.parent_id,
        c.description
    FROM categories c
    ORDER BY c.name ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_products_by_category (p_category_id UUID)
RETURNS TABLE (
    product_id       UUID,
    name             VARCHAR,
    description      TEXT,
    price            NUMERIC,
    category_name    VARCHAR,
    sport_name       VARCHAR,
    target_level     VARCHAR,
    brand            VARCHAR,
    image_url        VARCHAR,
    stock_quantity   INT,
    created_at       TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id, 
        p.name, 
        p.description, 
        p.price, 
        c.name as category_name, 
        s.name as sport_name, 
        p.target_level, 
        p.brand, 
        p.image_url,
        COALESCE(st.quantity, 0) AS stock_quantity,
        p.created_at
    FROM products p 
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN stock st on p.id = st.product_id 
    WHERE p.category_id = p_category_id 
        AND p.is_active = true
    ORDER BY p.created_at DESC; 
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_products_by_name(p_search_term VARCHAR)
RETURNS TABLE (
    product_id       UUID,
    name             VARCHAR,
    description      TEXT,
    price            NUMERIC,
    category_name    VARCHAR,
    sport_name       VARCHAR,
    target_level     VARCHAR,
    brand            VARCHAR,
    image_url        VARCHAR,
    stock_quantity   INT,
    created_at       TIMESTAMP
) AS $$
BEGIN 
    RETURN QUERY 
    SELECT
        p.id AS product_id, 
        p.name, 
        p.description, 
        p.price, 
        c.name as category_name, 
        s.name as sport_name, 
        p.target_level, 
        p.brand, 
        p.image_url,
        COALESCE(st.quantity, 0) AS stock_quantity,
        p.created_at
    FROM products p 
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN stock st on p.id = st.product_id 
    WHERE p.name ILIKE '%' || p_search_term || '%' 
        AND p.is_active = true
    ORDER BY p.name ASC; 
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_products_by_sport(p_sport_id UUID)
RETURNS TABLE (
    product_id       UUID,
    name             VARCHAR,
    description      TEXT,
    price            NUMERIC,
    category_name    VARCHAR,
    sport_name       VARCHAR,
    target_level     VARCHAR,
    brand            VARCHAR,
    image_url        VARCHAR,
    stock_quantity   INT,
    created_at       TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id, 
        p.name, 
        p.description, 
        p.price, 
        c.name as category_name, 
        s.name as sport_name, 
        p.target_level, 
        p.brand, 
        p.image_url,
        COALESCE(st.quantity, 0) AS stock_quantity,
        p.created_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN stock st on p.id = st.product_id 
    WHERE p.sport_id = p_sport_id 
        AND p.is_active = true
    ORDER BY p.created_at DESC;
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_products_by_brand(p_brand VARCHAR)
RETURNS TABLE (
    product_id       UUID,
    name             VARCHAR,
    description      TEXT,
    price            NUMERIC,
    category_name    VARCHAR,
    sport_name       VARCHAR,
    target_level     VARCHAR,
    brand            VARCHAR,
    image_url        VARCHAR,
    stock_quantity   INT,
    created_at       TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        c.name AS category_name,
        s.name AS sport_name,
        p.target_level,
        p.brand,
        p.image_url,
        COALESCE(st.quantity, 0) AS stock_quantity,
        p.created_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN stock st ON p.id = st.product_id
    WHERE p.brand ILIKE p_brand 
      AND p.is_active = true
    ORDER BY p.name ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_details(p_product_id UUID)
RETURNS TABLE (
    product_id       UUID,
    name             VARCHAR,
    description      TEXT,
    price            NUMERIC,
    category_name    VARCHAR,
    sport_name       VARCHAR,
    target_level     VARCHAR,
    brand            VARCHAR,
    image_url        VARCHAR,
    stock_quantity   INT,
    created_at       TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        c.name AS category_name,
        s.name AS sport_name,
        p.target_level,
        p.brand,
        p.image_url,
        COALESCE(st.quantity, 0) AS stock_quantity,
        p.created_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN stock st ON p.id = st.product_id
    WHERE p.id = p_product_id 
      AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;