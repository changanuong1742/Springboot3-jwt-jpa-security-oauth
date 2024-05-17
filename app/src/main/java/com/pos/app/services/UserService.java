package com.pos.app.services;

import com.pos.app.dto.request.ChangePasswordRequest;
import com.pos.app.dto.request.UserRequest;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.dto.response.ResponseMessage;
import com.pos.app.models.Image;
import com.pos.app.models.Role;
import com.pos.app.models.User;
import com.pos.app.models.VerificationCode;
import com.pos.app.repositories.ImageRepository;
import com.pos.app.repositories.RoleRepository;
import com.pos.app.repositories.UserRepository;
import com.pos.app.repositories.VerificationCodeRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ImageRepository imageRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    ResponseData responseData = new ResponseData();
    @Value("${minio.url}")
    private String minioUrl;
    ModelMapper modelMapper = new ModelMapper();
    @Value("${minio.bucketName}")
    private String bucketName;
    private final MinioClient minioClient;

    public ResponseEntity<?> getUser(Integer id) {
        ResponseData responseData = new ResponseData();

        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            Map<String, Object> dataMap = new HashMap<>();
            dataMap.put("user_id", user.getId());
            dataMap.put("firstname", user.getFirstname());
            dataMap.put("lastname", user.getLastname());
            dataMap.put("email", user.getEmail());
            if (user.getAvatar() != null) {
                dataMap.put("avatar", "/" + user.getAvatar());
            } else {
                dataMap.put("avatar", null);
            }
            dataMap.put("roles", user.getRoles());
            responseData.setData(dataMap);
            responseData.setMessage("Success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }
        responseData.setMessage("Not found");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    private VerificationCode getFirstRecordLastByUser(Integer id) {
        return verificationCodeRepository.findLastFirstByUser(id);
    }

    private boolean isTimeOutCode(Integer id) {
        Instant currentInstant = Instant.now();
        Duration duration = Duration.between(verificationCodeRepository.findLastFirstByUser(id).getCreated_at(), currentInstant);

        if (duration.toMinutes() > 10) {
            return true;
        }
        return false;
    }

    public ResponseEntity<?> updateProfile(UserRequest request) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        String emailLogged = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<User> optionalUser = userRepository.findByEmail(emailLogged);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                responseData.setMessage("Email is already in use");
                return new ResponseEntity<>(responseData, HttpStatus.CONFLICT);
            } else if (!user.getEmail().equals(request.getEmail()) && request.getCodeVerification() == null) {
                responseData.setMessage("Request authentication code");
                return new ResponseEntity<>(responseData, HttpStatus.CONFLICT);
            } else if (!Objects.equals(request.getEmail(), user.getEmail())) {
                if (!Objects.equals(request.getCodeVerification(), getFirstRecordLastByUser(user.getId()).getCode())) {
                    responseData.setMessage("Incorrect code");
                    return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
                } else if (isTimeOutCode(user.getId()) && !user.getEmail().equals(request.getEmail())) {
                    responseData.setMessage("The verification code time has passed");
                    return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
                }
            }


            // Sửa thông tin người dùng
            user.setEmail(request.getEmail());
            user.setFirstname(request.getFirstname());
            user.setLastname(request.getLastname());

            // Nếu có ảnh mới được cung cấp, thực hiện việc lưu ảnh mới và cập nhật thông tin ảnh
            if (request.getFile() != null) {
                String originalFilename = Instant.now().toEpochMilli() + "-" + request.getFile().getOriginalFilename();
                InputStream inputStream = request.getFile().getInputStream();

                if (!originalFilename.equals(user.getAvatar())) {
                    if (user.getAvatar() != null && request.getFile() != null) {
                        RemoveObjectArgs args = RemoveObjectArgs.builder().bucket(bucketName).object(user.getAvatar()).build();
                        minioClient.removeObject(args);
                    }
                    minioClient.putObject(PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(originalFilename)
                            .stream(inputStream, inputStream.available(), -1)
                            .build());
                    user.setAvatar(originalFilename);

                }
            }

            // Lưu thông tin người dùng đã cập nhật
            userRepository.save(user);
            responseData.setMessage("Success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } else {
            responseData.setMessage("Error");
            return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<?> ChangePassword(ChangePasswordRequest request) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        String emailLogged = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<User> optionalUser = userRepository.findByEmail(emailLogged);
        ResponseMessage responseMessage = new ResponseMessage();

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (!passwordEncoder.matches(request.getPasswordOld(), user.getPassword())) {
                responseData.setMessage("The old password is incorrect!");
                return new ResponseEntity<>(responseMessage, HttpStatus.NOT_FOUND);
            }

            responseData.setMessage("Password changed successfully");
            user.setPassword(passwordEncoder.encode(request.getPasswordNew()));
            userRepository.save(user);

        }
        return new ResponseEntity<>(responseMessage, HttpStatus.OK);
    }

    public Page<User> getAll(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size));
    }

    public ResponseEntity<?> create(UserRequest request) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        ResponseData responseData = new ResponseData();

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) {
            responseData.setMessage("User already exists");
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("email", "The email already exists");
            responseData.setErrors(errorMap);
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
        var user = User.builder().email(request.getEmail()).firstname(request.getFirstname())
                .lastname(request.getLastname()).password(passwordEncoder.encode(request.getPassword()))
                .build();

        if (request.getRoles() != null) {
            List<Role> roles = new ArrayList<>();
            for (Integer roleId : request.getRoles()) {
                Optional<Role> optionalRole = roleRepository.findById(roleId);
                optionalRole.ifPresent(roles::add); // Nếu tồn tại vai trò, thêm vào danh sách
            }
            user.setRoles(roles);
        }
        if (request.getFile() != null) {
            String originalFilename = Instant.now().toEpochMilli() + "-" + request.getFile().getOriginalFilename();
            InputStream inputStream = request.getFile().getInputStream();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(originalFilename)
                    .stream(inputStream, inputStream.available(), -1)
                    .build());
            user.setAvatar(originalFilename);
        }

        userRepository.save(user);
        responseData.setMessage("Create user success");
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    public ResponseEntity<?> update(UserRequest request) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        ResponseData responseData = new ResponseData();

        Optional<User> optionalUser = userRepository.findById(request.getId());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                responseData.setMessage("User already exists");
                Map<String, Object> errorMap = new HashMap<>();
                errorMap.put("email", "The email already exists");
                responseData.setErrors(errorMap);
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            if (request.getRoles() != null) {
                user.getRoles().clear();
                List<Role> roles = new ArrayList<>();
                for (Integer roleId : request.getRoles()) {
                    Optional<Role> optionalRole = roleRepository.findById(roleId);
                    optionalRole.ifPresent(roles::add); // Nếu tồn tại vai trò, thêm vào danh sách
                }
                user.setRoles(roles);
            }

            if (request.getFile() != null) {
                String originalFilename = Instant.now().toEpochMilli() + "-" + request.getFile().getOriginalFilename();
                InputStream inputStream = request.getFile().getInputStream();

                if (!originalFilename.equals(user.getAvatar())) {
                    if (user.getAvatar() != null && request.getFile() != null) {
                        RemoveObjectArgs args = RemoveObjectArgs.builder().bucket(bucketName).object(user.getAvatar()).build();
                        minioClient.removeObject(args);
                    }
                    minioClient.putObject(PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(originalFilename)
                            .stream(inputStream, inputStream.available(), -1)
                            .build());
                    user.setAvatar(originalFilename);

                }
            }

            user.setLastname(request.getLastname());
            user.setFirstname(request.getFirstname());
            user.setEmail(request.getEmail());
            userRepository.save(user);

            responseData.setMessage("Update user success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }

        responseData.setMessage("Update user fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }


    public ResponseEntity<?> delete(Integer id) {
        ResponseData responseData = new ResponseData();
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            userRepository.delete(user);
            responseData.setMessage("Delete user success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        }
        responseData.setMessage("Delete user fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }
}
