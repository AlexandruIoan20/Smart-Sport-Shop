package com.sports.api.controllers;

import com.sports.api.dto.CreateOrderRequestDTO;
import com.sports.api.dto.OrderCartDTO;
import com.sports.api.dto.UpdateQuantityRequestDTO;
import com.sports.api.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{orderId}/items/{productId}")
    public ResponseEntity<Boolean> removeItemFromOrder(
            @PathVariable UUID orderId,
            @PathVariable UUID productId) {

        Boolean success = orderService.removeItemFromOrder(orderId, productId);
        return ResponseEntity.ok(success);
    }
}