package com.sports.api.repositories;

import com.sports.api.dto.CartItemDTO;
import com.sports.api.dto.OrderCartDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class OrderRepository {
    private final JdbcTemplate jdbcTemplate;

    public OrderRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UUID createPendingOrder(UUID userId, String shippingAddress) {
        String sql = "SELECT create_pending_order(?::uuid, ?::text)";

        return jdbcTemplate.queryForObject(
                sql,
                UUID.class,
                userId,
                shippingAddress
        );
    }

    public Boolean addItemToOrder(UUID userId, UUID productId) {
        String sql = "SELECT add_item_to_order(?::uuid, ?::uuid)";

        return jdbcTemplate.queryForObject(
                sql,
                Boolean.class,
                userId,
                productId
        );
    }

    public Boolean removeItemFromOrder(UUID orderId, UUID productId) {
        String sql = "SELECT remove_item_from_order(?::uuid, ?::uuid)";

        return jdbcTemplate.queryForObject(
                sql,
                Boolean.class,
                orderId,
                productId
        );
    }

    public Boolean updateItemQuantity(UUID orderId, UUID productId, Integer newQuantity) {
        String sql = "SELECT update_item_quantity_in_order(?::uuid, ?::uuid, ?::integer)";

        return jdbcTemplate.queryForObject(
                sql,
                Boolean.class,
                orderId,
                productId,
                newQuantity
        );
    }

    public OrderCartDTO getPendingOrderWithItems(UUID userId) {
        String sql = "SELECT * FROM get_pending_order_with_items(?::uuid)";

        return jdbcTemplate.query(sql, rs -> {
            UUID orderId = null;
            String status = null;
            BigDecimal totalAmount = null;
            String shippingAddress = null;
            List<CartItemDTO> items = new ArrayList<>();

            while (rs.next()) {
                if (orderId == null) {
                    orderId = (UUID) rs.getObject("order_id");
                    status = rs.getString("order_status");
                    totalAmount = rs.getBigDecimal("total_amount");
                    shippingAddress = rs.getString("shipping_address");
                }

                UUID productId = (UUID) rs.getObject("product_id");

                if (productId != null) {
                    items.add(new CartItemDTO(
                            productId,
                            rs.getString("product_name"),
                            rs.getString("brand"),
                            rs.getString("image_url"),
                            rs.getInt("quantity_in_cart"),
                            rs.getBigDecimal("unit_price"),
                            rs.getInt("stock_available")
                    ));
                }
            }

            if (orderId == null) {
                return null;
            }

            return new OrderCartDTO(
                    orderId,
                    status,
                    totalAmount,
                    shippingAddress,
                    items
            );
        }, userId);
    }

    public Boolean confirmOrder(UUID orderId, UUID userId) {
        String sql = "SELECT confirm_order(?::uuid, ?::uuid)";

        return jdbcTemplate.queryForObject(
                sql,
                Boolean.class,
                orderId,
                userId
        );
    }

    public Boolean cancelOrder(UUID orderId, UUID userId) {
        String sql = "SELECT cancel_order(?::uuid, ?::uuid)";

        return jdbcTemplate.queryForObject(
                sql,
                Boolean.class,
                orderId,
                userId
        );
    }
}