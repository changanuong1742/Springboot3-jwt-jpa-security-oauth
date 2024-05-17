package com.pos.app.services;

import com.pos.app.dto.response.ResponseData;
import com.pos.app.models.Image;
import com.pos.app.repositories.ImageRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class ImageService {

    @Value("${minio.bucketName}")
    private String bucketName;
    private final MinioClient minioClient;
    @Value("${minio.url}")
    private String minioUrl;
    private ImageRepository imageRepository;

    public ResponseEntity<?> save(MultipartFile file) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        ResponseData responseData = new ResponseData();

        if (file != null) {
            long currentTime = Instant.now().toEpochMilli();

            InputStream inputStream = file.getInputStream();
            Map<String, Object> dataMap = new HashMap<>();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(currentTime + "-" + file.getOriginalFilename())
                    .stream(inputStream, inputStream.available(), -1)
                    .build());
            String url = currentTime + "-" + file.getOriginalFilename();
            dataMap.put("data", url);
            return new ResponseEntity<>(dataMap, HttpStatus.OK);

        }

        responseData.setMessage("Not file upload");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }
}
