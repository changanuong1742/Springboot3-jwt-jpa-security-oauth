package com.pos.app.controllers;

import com.pos.app.dto.request.ProductRequest;
import com.pos.app.models.Product;
import com.pos.app.services.ProductService;
import io.minio.errors.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PreAuthorize("hasAuthority('Create product')")
    @PostMapping
    public ResponseEntity<?> save(@ModelAttribute @Valid ProductRequest productRequest) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(productService.save(productRequest));
    }

    @PreAuthorize("hasAuthority('Update product')")
    @PutMapping
    public ResponseEntity<?> update(@ModelAttribute @Valid ProductRequest productRequest) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(productService.update(productRequest));
    }

    @PreAuthorize("hasAuthority('Delete product')")
    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(productService.delete(id));
    }

    @PreAuthorize("hasAuthority('View product')")
    @GetMapping("{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.get(id));
    }

    @PreAuthorize("hasAuthority('View product')")
    @GetMapping
    public ResponseEntity<Page<Product>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<Product> productsPage = productService.list(keyword, page, size);
        return ResponseEntity.ok(productsPage);
    }

}
