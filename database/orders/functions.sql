CREATE OR REPLACE FUNCTION create_pending_order (
    p_user_id UUID, 
    p_shipping_address TEXT
) RETURNS UUID AS $$
DECLARE
    v_new_order_id UUID; 
    v_recent_session_id UUID; 
BEGIN
  IF EXISTS (
        SELECT 1 
        FROM orders 
        WHERE user_id = p_user_id AND status = 'PENDING'
    ) THEN
        RAISE EXCEPTION 'USER_ALREADY_HAS_PENDING_ORDER'
            USING ERRCODE = 'P0201', 
                  HINT = 'Utilizatorul are deja o comandă în așteptare. Aceasta trebuie finalizată sau anulată.';
    END IF;

    SELECT id INTO v_recent_session_id
    FROM recommendation_sessions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    INSERT INTO orders (
        user_id, 
        session_id, 
        status, 
        total_amount, 
        shipping_address, 
        created_at, 
        updated_at
    )
    VALUES (
        p_user_id, 
        v_recent_session_id, 
        'PENDING', 
        0.00,
        p_shipping_address, 
        now(), 
        now()
    )
    RETURNING id INTO v_new_order_id;

    RETURN v_new_order_id;
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_item_to_order(
    p_user_id UUID,
    p_product_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_order_id UUID;
    v_product_price NUMERIC(10, 2);
    v_stock_qty INT;
BEGIN
    SELECT id INTO v_order_id FROM orders WHERE user_id = p_user_id AND status = 'PENDING';

    IF v_order_id IS NULL THEN
        v_order_id := create_pending_order(p_user_id, 'Adresa nesetata (se va completa la checkout)');
    END IF;

    SELECT price INTO v_product_price FROM products WHERE id = p_product_id AND is_active = true;
    IF v_product_price IS NULL THEN
        RAISE EXCEPTION 'PRODUCT_NOT_FOUND_OR_INACTIVE' USING ERRCODE = 'P0304';
    END IF;

    SELECT quantity INTO v_stock_qty FROM stock WHERE product_id = p_product_id FOR UPDATE;
    IF v_stock_qty < 1 THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING ERRCODE = 'P0306';
    END IF;

    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (v_order_id, p_product_id, 1, v_product_price)
    ON CONFLICT (order_id, product_id) 
    DO UPDATE SET quantity = order_items.quantity + 1;

    UPDATE stock SET quantity = quantity - 1, last_updated = now() WHERE product_id = p_product_id;
    UPDATE orders SET total_amount = total_amount + v_product_price, updated_at = now() WHERE id = v_order_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_item_from_order(
    p_order_id UUID,
    p_product_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_order_status order_status_type;
    v_current_qty INT;
    v_unit_price NUMERIC(10, 2);
BEGIN
    SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
    IF v_order_status != 'PENDING' THEN 
        RAISE EXCEPTION 'ORDER_NOT_PENDING' USING ERRCODE = 'P0402'; 
    END IF;

    PERFORM 1 FROM stock WHERE product_id = p_product_id FOR UPDATE;

    SELECT quantity, unit_price INTO v_current_qty, v_unit_price
    FROM order_items WHERE order_id = p_order_id AND product_id = p_product_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PRODUCT_NOT_IN_ORDER' USING ERRCODE = 'P0403';
    END IF;

    DELETE FROM order_items WHERE order_id = p_order_id AND product_id = p_product_id;

    UPDATE stock SET quantity = quantity + v_current_qty, last_updated = now() WHERE product_id = p_product_id;
    UPDATE orders SET total_amount = total_amount - (v_unit_price * v_current_qty), updated_at = now() WHERE id = p_order_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_item_quantity_in_order(
    p_order_id UUID,
    p_product_id UUID,
    p_new_quantity INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_order_status order_status_type;
    v_current_qty INT;
    v_unit_price NUMERIC(10, 2);
    v_stock_qty INT;
    v_diff INT;
BEGIN
    IF p_new_quantity <= 0 THEN
        RAISE EXCEPTION 'QUANTITY_MUST_BE_POSITIVE' USING ERRCODE = 'P0501';
    END IF;

    SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
    IF v_order_status != 'PENDING' THEN 
        RAISE EXCEPTION 'ORDER_NOT_PENDING' USING ERRCODE = 'P0502'; 
    END IF;

    SELECT quantity INTO v_stock_qty FROM stock WHERE product_id = p_product_id FOR UPDATE;

    SELECT quantity, unit_price INTO v_current_qty, v_unit_price
    FROM order_items WHERE order_id = p_order_id AND product_id = p_product_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PRODUCT_NOT_IN_ORDER' USING ERRCODE = 'P0503';
    END IF;

    v_diff := p_new_quantity - v_current_qty;

    IF v_diff > 0 THEN
        IF v_stock_qty < v_diff THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING ERRCODE = 'P0306';
        END IF;
        UPDATE stock SET quantity = quantity - v_diff, last_updated = now() WHERE product_id = p_product_id;
    ELSIF v_diff < 0 THEN
        UPDATE stock SET quantity = quantity - v_diff, last_updated = now() WHERE product_id = p_product_id;
    END IF;

    IF v_diff != 0 THEN
        UPDATE order_items SET quantity = p_new_quantity WHERE order_id = p_order_id AND product_id = p_product_id;
        UPDATE orders SET total_amount = total_amount + (v_unit_price * v_diff), updated_at = now() WHERE id = p_order_id;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pending_order_with_items(p_user_id UUID)
RETURNS TABLE (
    order_id UUID,
    order_status order_status_type,
    total_amount NUMERIC(10, 2),
    shipping_address TEXT,
    product_id UUID,
    product_name VARCHAR,
    brand VARCHAR,
    image_url VARCHAR,
    quantity_in_cart INT,
    unit_price NUMERIC(10, 2),
    stock_available INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.shipping_address,
        oi.product_id,
        p.name,
        p.brand,
        p.image_url,
        oi.quantity,
        oi.unit_price,
        s.quantity
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE o.user_id = p_user_id AND o.status = 'PENDING';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION confirm_order(
    p_order_id UUID,
    p_user_id  UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_status order_status_type;
BEGIN
    SELECT status
    INTO   v_status
    FROM   orders
    WHERE  id      = p_order_id
      AND  user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_status <> 'PENDING' THEN
        RETURN FALSE;
    END IF;

    UPDATE orders
    SET    status     = 'CONFIRMED',
           updated_at = now()
    WHERE  id = p_order_id;

    RETURN TRUE;
END;
$$;


CREATE OR REPLACE FUNCTION cancel_order(
    p_order_id UUID,
    p_user_id  UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_status order_status_type;
BEGIN
    SELECT status
    INTO   v_status
    FROM   orders
    WHERE  id      = p_order_id
      AND  user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_status NOT IN ('PENDING', 'CONFIRMED') THEN
        RETURN FALSE;
    END IF;

    UPDATE stock s
    SET    quantity     = s.quantity + oi.quantity,
           last_updated = now()
    FROM   order_items oi
    WHERE  oi.order_id   = p_order_id
      AND  oi.product_id = s.product_id;

    UPDATE orders
    SET    status     = 'CANCELLED',
           updated_at = now()
    WHERE  id = p_order_id;

    RETURN TRUE;
END;
$$;