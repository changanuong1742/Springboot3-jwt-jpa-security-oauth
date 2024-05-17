package com.pos.app.controllers;

import com.pos.app.dto.request.ChangePasswordRequest;
import com.pos.app.dto.request.UserRequest;
import com.pos.app.models.User;
import com.pos.app.services.UserService;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(userService.getUser(id));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PreAuthorize("hasAuthority('Update user')")
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @ModelAttribute UserRequest request
    ) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PreAuthorize("hasAuthority('Update user')")
    @PutMapping("/change-password")
    public ResponseEntity<?> changedPassword(
            @ModelAttribute ChangePasswordRequest request
    ) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(userService.ChangePassword(request));
    }

    @PreAuthorize("hasAuthority('View user')")
    @GetMapping
    public ResponseEntity<Page<User>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<User> userPage = userService.getAll(page, size);
        return ResponseEntity.ok(userPage);
    }

    @PreAuthorize("hasAuthority('Create user')")
    @PostMapping
    public ResponseEntity<?> createUser(@ModelAttribute UserRequest request) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(userService.create(request));
    }

    @PreAuthorize("hasAuthority('Update user')")
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@ModelAttribute UserRequest request) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return ResponseEntity.ok(userService.update(request));
    }

    @PreAuthorize("hasAuthority('Delete user')")
    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.delete(id));
    }
}
