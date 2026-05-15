package com.sports.api.repositories;

import com.sports.api.dto.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class AdminRepository {

    private final JdbcTemplate jdbcTemplate;

    public AdminRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CategoryDTO> getAllCategories() {
        String sql = "SELECT * FROM get_all_categories()";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new CategoryDTO(
                UUID.fromString(rs.getString("category_id")),
                rs.getString("name"),
                rs.getString("description"),
                rs.getString("parent_id") != null ? UUID.fromString(rs.getString("parent_id")) : null
        ));
    }

    public List<AdminProductDTO> getAllProducts() {
        String sql = "SELECT * FROM get_all_products_admin()";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new AdminProductDTO(
                UUID.fromString(rs.getString("product_id")),
                rs.getString("name"),
                rs.getString("description"),
                rs.getBigDecimal("price"),
                UUID.fromString(rs.getString("category_id")),
                rs.getString("category_name"),
                rs.getString("sport_id") != null ? UUID.fromString(rs.getString("sport_id")) : null,
                rs.getString("sport_name"),
                rs.getString("target_level"),
                rs.getString("brand"),
                rs.getString("image_url"),
                rs.getBoolean("is_active"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getInt("stock_qty")
        ));
    }

    public UUID createProduct(CreateProductRequestDTO dto) {
        String sql = "SELECT create_product(?::varchar, ?::text, ?::numeric, ?::uuid, ?::uuid, ?::varchar, ?::varchar, ?::varchar, ?::int)";

        return jdbcTemplate.queryForObject(sql, UUID.class,
                dto.name(),
                dto.description(),
                dto.price(),
                dto.categoryId(),
                dto.sportId(),
                dto.targetLevel(),
                dto.brand(),
                dto.imageUrl(),
                dto.stockQty()
        );
    }

    public Boolean updateProduct(UUID productId, UpdateProductRequestDTO dto) {
        String sql = "SELECT update_product(?::uuid, ?::varchar, ?::text, ?::numeric, ?::uuid, ?::uuid, ?::varchar, ?::varchar, ?::varchar, ?::boolean)";

        return jdbcTemplate.queryForObject(sql, Boolean.class,
                productId,
                dto.name(),
                dto.description(),
                dto.price(),
                dto.categoryId(),
                dto.sportId(),
                dto.targetLevel(),
                dto.brand(),
                dto.imageUrl(),
                dto.isActive()
        );
    }

    public Boolean deleteProduct(UUID productId) {
        String sql = "SELECT delete_product(?::uuid)";
        return jdbcTemplate.queryForObject(sql, Boolean.class, productId);
    }

    public Boolean updateStock(UUID productId, Integer quantity) {
        String sql = "SELECT update_stock(?::uuid, ?::int)";
        return jdbcTemplate.queryForObject(sql, Boolean.class, productId, quantity);
    }
}