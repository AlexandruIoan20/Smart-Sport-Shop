package com.sports.api.repositories;

import com.sports.api.dto.CartItemDTO;
import com.sports.api.dto.OrderCartDTO;
import com.sports.api.dto.OrderHistoryDTO;
import com.sports.api.dto.OrderItemDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class OrderRepository {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public OrderRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
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

    public List<OrderHistoryDTO> getOrderHistory(UUID userId) {
        String sql = "SELECT * FROM get_user_order_history(?::uuid)";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String itemsJson = rs.getString("items");
            List<OrderItemDTO> items = parseItems(itemsJson);

            return new OrderHistoryDTO(
                    UUID.fromString(rs.getString("order_id")),
                    rs.getString("status"),
                    rs.getBigDecimal("total_amount"),
                    rs.getString("shipping_address"),
                    rs.getTimestamp("created_at").toLocalDateTime(),
                    rs.getTimestamp("updated_at").toLocalDateTime(),
                    rs.getString("session_id") != null
                            ? UUID.fromString(rs.getString("session_id"))
                            : null,
                    rs.getLong("item_count"),
                    items
            );
        }, userId);
    }

    private List<OrderItemDTO> parseItems(String json) {
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(
                    json,
                    objectMapper.getTypeFactory()
                            .constructCollectionType(List.class, OrderItemDTO.class)
            );
        } catch (Exception e) {
            return List.of();
        }
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