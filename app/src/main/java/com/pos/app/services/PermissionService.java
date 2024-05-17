package com.pos.app.services;

import com.pos.app.dto.response.ResponseData;
import com.pos.app.models.Permission;
import com.pos.app.repositories.PermissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public ResponseEntity<?> getAllPermissions() {
        ResponseData responseData = new ResponseData();
        responseData.setData(permissionRepository.findAll());
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
