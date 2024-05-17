package com.pos.app.controllers;

import com.pos.app.dto.request.RoleRequest;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.models.Role;
import com.pos.app.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/role")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PreAuthorize("hasAuthority('View role')")
    @GetMapping
    public ResponseEntity<Page<Role>> getRoles(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "5") int size) {
        Page<Role> rolePage = roleService.list(page, size);
        return ResponseEntity.ok(rolePage);
    }

    @PreAuthorize("hasAuthority('View role')")
    @GetMapping("{id}")
    public ResponseEntity<?> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(roleService.getDetails(id));
    }

    @PreAuthorize("hasAuthority('Create role')")
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody RoleRequest request) {
        return ResponseEntity.ok(roleService.create(request));
    }

    @PreAuthorize("hasAuthority('Update role')")
    @PutMapping
    public ResponseEntity<?> updateRole(@RequestBody RoleRequest request) {
        return ResponseEntity.ok(roleService.update(request));
    }

    @PreAuthorize("hasAuthority('Delete role')")
    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Integer id) {
        return ResponseEntity.ok(roleService.delete(id));
    }
}
