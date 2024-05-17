package com.pos.app.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pos.app.models.Image;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ProductResponse {
    private Integer id;
    private String name;
    private Float price;
    private List<Image> images;
    private String content;
}
