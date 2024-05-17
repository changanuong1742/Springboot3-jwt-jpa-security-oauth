package com.pos.app.controllers;

import com.pos.app.services.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/permission")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @PreAuthorize("hasAuthority('View role')")
    @GetMapping
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }
}
