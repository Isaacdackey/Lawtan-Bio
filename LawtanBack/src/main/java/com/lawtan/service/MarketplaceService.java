package com.lawtan.service;

import com.lawtan.dto.MarketplaceOrderDTO;
import com.lawtan.dto.MarketplaceOrderRequest;
import com.lawtan.dto.MarketplaceProductDTO;
import com.lawtan.model.MarketplaceOrderStatus;
import com.lawtan.model.ProductType;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MarketplaceService {
    Page<MarketplaceProductDTO> getProducts(String search, ProductType category, int page, int size);
    List<ProductType> getCategories();
    MarketplaceOrderDTO createOrder(MarketplaceOrderRequest request);
    Page<MarketplaceOrderDTO> getOrders(MarketplaceOrderStatus status, int page, int size);
    MarketplaceOrderDTO getOrder(Long id);
    MarketplaceOrderDTO updateOrderStatus(Long id, MarketplaceOrderStatus status);
}