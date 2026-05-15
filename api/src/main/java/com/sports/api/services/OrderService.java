package com.sports.api.services;

import com.sports.api.dto.OrderCartDTO;
import com.sports.api.repositories.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public UUID createPendingOrder(UUID userId, String shippingAddress) {
        if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
            throw new IllegalArgumentException("Adresa de livrare este obligatorie.");
        }
        return orderRepository.createPendingOrder(userId, shippingAddress);
    }

    public Boolean addItemToOrder(UUID userId, UUID productId) {
        return orderRepository.addItemToOrder(userId, productId);
    }

    public Boolean removeItemFromOrder(UUID orderId, UUID productId) {
        return orderRepository.removeItemFromOrder(orderId, productId);
    }

    public Boolean updateItemQuantity(UUID orderId, UUID productId, Integer newQuantity) {
        if (newQuantity == null || newQuantity <= 0) {
            throw new IllegalArgumentException("Cantitatea trebuie să fie cel puțin 1.");
        }
        return orderRepository.updateItemQuantity(orderId, productId, newQuantity);
    }

    public OrderCartDTO getPendingOrderWithItems(UUID userId) {
        return orderRepository.getPendingOrderWithItems(userId);
    }

    public Boolean confirmOrder(UUID orderId, UUID userId) {
        return orderRepository.confirmOrder(orderId, userId);
    }

    public Boolean cancelOrder(UUID orderId, UUID userId) {
        return orderRepository.cancelOrder(orderId, userId);
    }
}