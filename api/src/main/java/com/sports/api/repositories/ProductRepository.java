package com.sports.api.repositories;

import com.sports.api.dto.CategoryResponseDTO;
import com.sports.api.dto.ProductResponseDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

@Repository
public class ProductRepository {
    private final JdbcTemplate jdbcTemplate;

    public ProductRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CategoryResponseDTO> getAllCategories() {
        String statement = "SELECT * FROM get_all_categories()";

        return jdbcTemplate.query(statement, (rs, rowNum) -> new CategoryResponseDTO(
                rs.getObject("category_id", UUID.class),
                rs.getString("name"),
                rs.getObject("parent_id", UUID.class),
                rs.getString("description")
        ));
    }

    public List<ProductResponseDTO> getProductsByCategory(UUID categoryId) {
        String statement = "SELECT * FROM get_products_by_category(?::uuid)";

        return jdbcTemplate.query(statement, (rs, rowNum) -> toDTO(rs), categoryId);
    }

    public List<ProductResponseDTO> getProductsByName(String name) {
        String statement = "SELECT * FROM get_products_by_name(?)";
        return jdbcTemplate.query(statement, (rs, rowNum) -> toDTO(rs), name);
    }

    public ProductResponseDTO getProductById(UUID productId) {
        String statement = "SELECT * FROM get_product_details(?::uuid)";
        return jdbcTemplate.query(statement, rs -> {
            if (rs.next()) {
                return toDTO(rs);
            }
            return null;
        }, productId);
    }

    public List<ProductResponseDTO> getProductsBySport(UUID sportId) {
        String statement = "SELECT * FROM get_products_by_sport(?::uuid)";
        return jdbcTemplate.query(statement, (rs, rowNum) -> toDTO(rs), sportId);
    }

    public List<ProductResponseDTO> getProductsByBrand(String brand) {
        String statement = "SELECT * FROM get_products_by_brand(?)";
        return jdbcTemplate.query(statement, (rs, rowNum) -> toDTO(rs), brand);
    }

    private ProductResponseDTO toDTO(ResultSet rs) throws SQLException {
        return new ProductResponseDTO(
                rs.getObject("product_id", UUID.class),
                rs.getString("name"),
                rs.getString("description"),
                rs.getBigDecimal("price"),
                rs.getString("category_name"),
                rs.getString("sport_name"),
                rs.getString("target_level"),
                rs.getString("brand"),
                rs.getString("image_url"),
                rs.getObject("stock_quantity", Integer.class),
                rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null
        );
    }
}
