package com.pos.app.services;

import com.pos.app.dto.request.ProductRequest;
import com.pos.app.dto.response.*;
import com.pos.app.models.Image;
import com.pos.app.models.OrderLine;
import com.pos.app.models.Product;
import com.pos.app.repositories.ImageRepository;
import com.pos.app.repositories.OrderLineRepository;
import com.pos.app.repositories.ProductRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final OrderLineRepository orderLineRepository;
    ModelMapper modelMapper = new ModelMapper();

    @Value("${minio.url}")
    private String minioUrl;
    @Value("${minio.bucketName}")
    private String bucketName;
    private final MinioClient minioClient;

    public ResponseEntity<?> save(ProductRequest request) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        ResponseData responseData = new ResponseData();

        Optional<Product> optionalProduct = productRepository.findByName(request.getName());

        if (optionalProduct.isPresent()) {
            responseData.setMessage("Create fail");
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("name", "The name already exists");
            responseData.setErrors(errorMap);
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }

        responseData.setMessage("Success");
        var product = Product.builder().name(request.getName()).price(request.getPrice()).content(request.getContent()).build();
        productRepository.save(product);

        if (request.getFiles() != null) {
            for (MultipartFile file : request.getFiles()) {
                String originalFilename = Instant.now().toEpochMilli() + "-" + file.getOriginalFilename();
                String[] filenameParts = originalFilename.split("\\.");
                String fileType = filenameParts[filenameParts.length - 1];

                InputStream inputStream = file.getInputStream();
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(originalFilename)
                        .stream(inputStream, inputStream.available(), -1)
                        .build());
                var image = Image.builder().type(fileType).fileName(originalFilename).modeName("Product").modelId(product.getId()).build();
                imageRepository.save(image);
            }
        }

        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    public ResponseEntity<?> update(ProductRequest request) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        Optional<Product> optionalProduct = productRepository.findById(request.getId());
        ResponseData responseData = new ResponseData();

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();

            // Kiểm tra nếu tên mới không trùng với tên hiện tại của seat hoặc trùng nhưng với chính nó
            if (!product.getName().equals(request.getName()) || product.getId().equals(request.getId())) {
                // Kiểm tra nếu tên mới trùng với tên của một seat khác
                Optional<Product> productWithName = productRepository.findByName(request.getName());
                if (productWithName.isPresent() && !productWithName.get().getId().equals(product.getId())) {
                    Map<String, Object> errorMap = new HashMap<>();
                    responseData.setMessage("The name already exists");
                    errorMap.put("name", "The name already exists");
                    return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
                }
            }

            product.setName(request.getName());
            product.setPrice(request.getPrice());
            product.setContent(request.getContent());

            // Xoa anh
            if (getImageDeleted(request) != null) {
                for (String image : getImageDeleted(request)) {
                    RemoveObjectArgs args = RemoveObjectArgs.builder().bucket(bucketName).object(image).build();
                    minioClient.removeObject(args);
                    Optional<Image> optionalImage = imageRepository.findByFileName(image);

                    if (optionalImage.isPresent()) {
                        Image imageExist = optionalImage.get();
                        imageRepository.deleteById(imageExist.getId());
                    }
                }
            }

            // Them anh
            if (request.getFiles() != null) {
                for (int i = 0; i < request.getFiles().length; i++) {
                    MultipartFile file = request.getFiles()[i];
                    Optional<Image> imageOptional = imageRepository.findByFileName(file.getOriginalFilename());
                    if (imageOptional.isPresent()) {
                        Image image = imageOptional.get();
                        image.setSequence(i);
                    } else {
                        String originalFilename = Instant.now().toEpochMilli() + "-" + file.getOriginalFilename();
                        String[] filenameParts = originalFilename.split("\\.");
                        String fileType = filenameParts[filenameParts.length - 1];
                        InputStream inputStream = file.getInputStream();
                        minioClient.putObject(PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(originalFilename)
                                .stream(inputStream, inputStream.available(), -1)
                                .build());
                        var image = Image.builder().type(fileType).fileName(originalFilename).modeName("Product").sequence(i).modelId(product.getId()).build();
                        imageRepository.save(image);
                    }


                }
            }


            productRepository.save(product);
            responseData.setMessage("Success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }
        responseData.setMessage("Fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    public HashSet<String> getImageDeleted(ProductRequest request) {
        // Lay fileName image da upload len
        List<String> imagesFileNameUploaded = new ArrayList<>();
        if (request.getFiles() != null) {
            for (int i = 0; i < request.getFiles().length; i++) {
                if (!request.getFiles()[i].isEmpty()) {
                    imagesFileNameUploaded.add(request.getFiles()[i].getOriginalFilename());
                }
            }
        } else {
            return null;
        }

        // Lay fileName image dang luu trong db
        List<Image> productImages = imageRepository.findByModelIdAndModeName(request.getId(), "Product");
        List<String> existingFileNames = new ArrayList<>();
        for (Image image : productImages) {
            existingFileNames.add(image.getFileName());
        }

        // Thêm tất cả các phần tử của mảng 1 vào HashSet
        HashSet<String> set = new HashSet<>(imagesFileNameUploaded);

        // Loại bỏ các phần tử của mảng 2 đã xuất hiện trong HashSet
        for (String element : existingFileNames) {
            if (set.contains(element)) {
                set.remove(element);
            } else {
                set.add(element);
            }
        }

        return set;
    }

    public List<String> getImageUploaded(ProductRequest request) {
        // Lay fileName image da upload len
        List<String> imagesFileNameUploaded = new ArrayList<>();
        for (int i = 0; i < request.getFiles().length; i++) {
            if (!request.getFiles()[i].isEmpty()) {
                imagesFileNameUploaded.add(request.getFiles()[i].getOriginalFilename());
            }
        }

        // Lay fileName image dang luu trong db
        List<Image> productImages = imageRepository.findByModelIdAndModeName(request.getId(), "Product");
        List<String> existingFileNames = new ArrayList<>();
        for (Image image : productImages) {
            existingFileNames.add(image.getFileName());
        }

        List<String> newFileNames = imagesFileNameUploaded.stream()
                .filter(fileName -> !existingFileNames.contains(fileName))
                .collect(Collectors.toList());


        return newFileNames;
    }

    public ResponseEntity<?> delete(Integer id) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        Optional<Product> optionalProduct = productRepository.findById(id);
        ResponseData responseData = new ResponseData();

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            List<OrderLine> orderLines = orderLineRepository.findAllByProduct(product);

            for (OrderLine orderLine : orderLines) {
                orderLine.setProduct(null);
            }

            productRepository.deleteById(id);
            List<Image> imagesProduct = imageRepository.findByModelIdAndModeName(id, "Product");

            if (imagesProduct != null) {
                for (Image image : imagesProduct) {
                    RemoveObjectArgs args = RemoveObjectArgs.builder().bucket(bucketName).object(image.getFileName()).build();
                    minioClient.removeObject(args);
                    Optional<Image> optionalImage = imageRepository.findByFileName(image.getFileName());

                    if (optionalImage.isPresent()) {
                        Image imageExist = optionalImage.get();
                        imageRepository.deleteById(imageExist.getId());
                    }
                }
            }

            responseData.setMessage("Deleted");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }
        responseData.setMessage("Seat not found");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> get(Integer id) {
        ResponseData responseData = new ResponseData();
        Optional<Product> optionalProduct = productRepository.findById(id);
        Map<String, Object> dataMap = new HashMap<>();
        if (optionalProduct.isPresent()) {
            var product = optionalProduct.get();
            ProductResponse productResponse = modelMapper.map(product, ProductResponse.class);
            List<Image> images = imageRepository.findByModelIdAndModeName(product.getId(), "Product");
            productResponse.setImages(images);
            dataMap.put("data", productResponse);
            return new ResponseEntity<>(dataMap, HttpStatus.OK);
        }

        responseData.setMessage("Product not found");
        return ResponseEntity.badRequest().body(responseData);
    }

    public Page<Product> list(String keyword, int page, int size) {
        Page<Product> products = productRepository.findByNameContaining(keyword, PageRequest.of(page, size));
        for (Product product : products) {
            product.setImages(imageRepository.findByModelIdAndModeName(product.getId(), "Product"));
        }
        return products;
    }

}
