package com.sports.api.controllers;

import com.sports.api.dto.CreateOrderRequestDTO;
import com.sports.api.dto.OrderCartDTO;
import com.sports.api.dto.OrderHistoryDTO;
import com.sports.api.dto.UpdateQuantityRequestDTO;
import com.sports.api.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/pending/{userId}")
    public ResponseEntity<OrderCartDTO> getPendingOrder(@PathVariable UUID userId) {
        OrderCartDTO cart = orderService.getPendingOrderWithItems(userId);
        if (cart == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/create/{userId}")
    public ResponseEntity<UUID> createPendingOrder(
            @PathVariable UUID userId,
            @RequestBody CreateOrderRequestDTO request) {

        UUID orderId = orderService.createPendingOrder(userId, request.shippingAddress());
        return ResponseEntity.ok(orderId);
    }

    @PostMapping("/users/{userId}/items/{productId}")
    public ResponseEntity<Boolean> addItemToOrder(
            @PathVariable UUID userId,
            @PathVariable UUID productId) {

        Boolean success = orderService.addItemToOrder(userId, productId);
        return ResponseEntity.ok(success);
    }

    @PutMapping("/{orderId}/items/{productId}")
    public ResponseEntity<Boolean> updateItemQuantity(
            @PathVariable UUID orderId,
            @PathVariable UUID productId,
            @RequestBody UpdateQuantityRequestDTO request) {

        Boolean success = orderService.updateItemQuantity(orderId, productId, request.quantity());
        return ResponseEntity.ok(success);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<OrderHistoryDTO>> getOrderHistory(@PathVariable UUID userId) {
        List<OrderHistoryDTO> history = orderService.getOrderHistory(userId);
        if (history.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/{orderId}/items/{productId}")
    public ResponseEntity<Boolean> removeItemFromOrder(
            @PathVariable UUID orderId,
            @PathVariable UUID productId) {

        Boolean success = orderService.removeItemFromOrder(orderId, productId);
        return ResponseEntity.ok(success);
    }

    @PostMapping("/{orderId}/confirm/{userId}")
    public ResponseEntity<Boolean> confirmOrder(
            @PathVariable UUID orderId,
            @PathVariable UUID userId) {

        Boolean success = orderService.confirmOrder(orderId, userId);

        if (Boolean.FALSE.equals(success)) {
            // Stoc insuficient, status greșit sau comandă negăsită
            return ResponseEntity.badRequest().body(false);
        }

        return ResponseEntity.ok(true);
    }

    @PostMapping("/{orderId}/cancel/{userId}")
    public ResponseEntity<Boolean> cancelOrder(
            @PathVariable UUID orderId,
            @PathVariable UUID userId) {

        Boolean success = orderService.cancelOrder(orderId, userId);

        if (Boolean.FALSE.equals(success)) {
            return ResponseEntity.badRequest().body(false);
        }

        return ResponseEntity.ok(true);
    }
}