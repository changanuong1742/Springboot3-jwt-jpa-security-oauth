package com.pos.app.repositories;

import com.pos.app.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    Boolean existsByName(String email);
}
