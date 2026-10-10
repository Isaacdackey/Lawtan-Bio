package com.lawtan.service;

import com.lawtan.dto.ProductStockDTO;

import java.util.List;

public interface ProductStockService {
    List<ProductStockDTO> getAllAvailableStocks();
    ProductStockDTO getStockById(Long id);
    ProductStockDTO createOrUpdateStock(ProductStockDTO dto);
    void deleteStock(Long id);
}
