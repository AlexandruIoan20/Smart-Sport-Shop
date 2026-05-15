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

CREATE OR REPLACE FUNCTION get_all_products_admin()
RETURNS TABLE (
    product_id    UUID,
    name          VARCHAR,
    description   TEXT,
    price         NUMERIC,
    category_id   UUID,
    category_name VARCHAR,
    sport_id      UUID,
    sport_name    VARCHAR,
    target_level  VARCHAR,
    brand         VARCHAR,
    image_url     VARCHAR,
    is_active     BOOLEAN,
    created_at    TIMESTAMP,
    stock_qty     INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id            AS product_id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        c.name          AS category_name,
        p.sport_id,
        s.name          AS sport_name,
        p.target_level,
        p.brand,
        p.image_url,
        p.is_active,
        p.created_at,
        COALESCE(st.quantity, 0) AS stock_qty
    FROM products p
    JOIN categories c  ON c.id = p.category_id
    LEFT JOIN sports s ON s.id = p.sport_id
    LEFT JOIN stock st ON st.product_id = p.id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
 

 
CREATE OR REPLACE FUNCTION create_product(
    p_name        VARCHAR,
    p_description TEXT,
    p_price       NUMERIC,
    p_category_id UUID,
    p_sport_id    UUID,
    p_target_level VARCHAR,
    p_brand       VARCHAR,
    p_image_url   VARCHAR,
    p_stock_qty   INT
) RETURNS UUID AS $$
DECLARE
    v_product_id UUID;
BEGIN
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'PRODUCT_NAME_REQUIRED' USING ERRCODE = 'P0301';
    END IF;
 
    IF p_price IS NULL OR p_price < 0 THEN
        RAISE EXCEPTION 'PRODUCT_PRICE_INVALID' USING ERRCODE = 'P0302';
    END IF;
 
    IF p_category_id IS NULL THEN
        RAISE EXCEPTION 'PRODUCT_CATEGORY_REQUIRED' USING ERRCODE = 'P0303';
    END IF;
 
    INSERT INTO products (
        name, description, price, category_id, sport_id,
        target_level, brand, image_url, is_active
    )
    VALUES (
        TRIM(p_name), p_description, p_price, p_category_id, p_sport_id,
        COALESCE(p_target_level, 'BEGINNER'), p_brand, p_image_url, true
    )
    RETURNING id INTO v_product_id;
 
    INSERT INTO stock (product_id, quantity)
    VALUES (v_product_id, COALESCE(p_stock_qty, 0));
 
    RETURN v_product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product(
    p_product_id  UUID,
    p_name        VARCHAR,
    p_description TEXT,
    p_price       NUMERIC,
    p_category_id UUID,
    p_sport_id    UUID,
    p_target_level VARCHAR,
    p_brand       VARCHAR,
    p_image_url   VARCHAR,
    p_is_active   BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE products SET
        name          = TRIM(p_name),
        description   = p_description,
        price         = p_price,
        category_id   = p_category_id,
        sport_id      = p_sport_id,
        target_level  = p_target_level,
        brand         = p_brand,
        image_url     = p_image_url,
        is_active     = p_is_active
    WHERE id = p_product_id;
 
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
 
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_product(p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Soft delete — nu stergem fizic ca sa nu rupem istoricul comenzilor
    UPDATE products SET is_active = false WHERE id = p_product_id;
 
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
 
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
 

 CREATE OR REPLACE FUNCTION update_stock(
    p_product_id UUID,
    p_quantity   INT
) RETURNS BOOLEAN AS $$
BEGIN
    IF p_quantity < 0 THEN
        RAISE EXCEPTION 'STOCK_QUANTITY_INVALID' USING ERRCODE = 'P0304';
    END IF;
 
    INSERT INTO stock (product_id, quantity, last_updated)
    VALUES (p_product_id, p_quantity, now())
    ON CONFLICT (product_id) DO UPDATE
        SET quantity     = EXCLUDED.quantity,
            last_updated = now();
 
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
 