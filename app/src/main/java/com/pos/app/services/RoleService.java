package com.pos.app.services;

import com.pos.app.dto.request.RoleRequest;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.models.Permission;
import com.pos.app.models.Product;
import com.pos.app.models.Role;
import com.pos.app.repositories.PermissionRepository;
import com.pos.app.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public Page<Role> list(int page, int size) {
        Page<Role> roles = roleRepository.findAll(PageRequest.of(page, size));
        return roles;
    }

    public ResponseEntity<?> getDetails(Integer id) {
        Optional<Role> optionalRole = roleRepository.findById(id);
        if (optionalRole.isPresent()) {
            ResponseData responseData = new ResponseData();
            responseData.setData(optionalRole.get());

            return ResponseEntity.ok(responseData);
        }
        return ResponseEntity.ok(null);
    }

    public ResponseEntity<?> create(RoleRequest request) {
        ResponseData responseData = new ResponseData();

        if (roleRepository.existsByName(request.getName())) {
            responseData.setMessage("Name already exists");
            Map<String, Object> errorDetail = new HashMap<>();
            errorDetail.put("name", "Name already exists");
            responseData.setErrors(errorDetail);
            return ResponseEntity.ok(responseData);
        }

        // Use a builder pattern to create a new Role object
        Role role = Role.builder()
                .name(request.getName())
                .build();

        if (request.getPermissionIds() != null){
            List<Permission> permissions = new ArrayList<>();
            for (Integer permissionId : request.getPermissionIds()) {
                Optional<Permission> optionalPermission = permissionRepository.findById(permissionId);
                optionalPermission.ifPresent(permissions::add); // Nếu tồn tại vai trò, thêm vào danh sách
            }
            role.setPermissions(permissions);
        }

        // Save the new Role to the repository
        roleRepository.save(role);

        responseData.setMessage("Role created successfully");
        responseData.setData(role);

        return ResponseEntity.ok(responseData);
    }

    public ResponseEntity<?> update(RoleRequest request) {
        if (request.getName() == null || request.getName().isEmpty()) {
            ResponseData responseData = new ResponseData();
            Map<String, Object> errorDetail = new HashMap<>();
            errorDetail.put("name", "Name is required");
            errorDetail.put("id", "Id not null");
            responseData.setErrors(errorDetail);
            responseData.setMessage("Form is required");
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
        ResponseData responseData = new ResponseData();

        Optional<Role> optionalRole = roleRepository.findById(request.getId());
        if (optionalRole.isPresent()) {
            Role role = optionalRole.get();

            if (!Objects.equals(request.getName(), role.getName()) && roleRepository.existsByName(request.getName())) {
                responseData.setMessage("Name already exists");
                Map<String, Object> errorDetail = new HashMap<>();
                errorDetail.put("name", "Name already exists");
                responseData.setErrors(errorDetail);
                return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
            }

            role.getPermissions().clear();
            if (request.getPermissionIds() != null){
                List<Permission> permissions = new ArrayList<>();
                for (Integer permissionId : request.getPermissionIds()) {
                    Optional<Permission> optionalPermission = permissionRepository.findById(permissionId);
                    optionalPermission.ifPresent(permissions::add); // Nếu tồn tại vai trò, thêm vào danh sách
                }
                role.setPermissions(permissions);
            }

            role.setName(request.getName());
            roleRepository.save(role);
            responseData.setMessage("Role created successfully");
            responseData.setData(role);
            return ResponseEntity.ok(responseData);

        }

        responseData.setMessage("Update fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<?> delete(Integer id) {
        ResponseData responseData = new ResponseData();
        Optional<Role> optionalRole = roleRepository.findById(id);
        if (optionalRole.isPresent()) {
            Role role = optionalRole.get();
            roleRepository.delete(role);
            responseData.setMessage("Role deleted successfully");
            responseData.setData(role);
            return ResponseEntity.ok(responseData);
        }
        responseData.setMessage("Delete fail");
        return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
    }


}
