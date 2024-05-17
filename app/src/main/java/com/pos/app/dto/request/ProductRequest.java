package com.pos.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
public class ProductRequest {
    private Integer id;
    @NotNull(message = "Product name cannot null")
    @NotBlank(message = "Product name cannot blank")
    private String name;
    private Float price;
    private MultipartFile[] files;
    private String content;
}
