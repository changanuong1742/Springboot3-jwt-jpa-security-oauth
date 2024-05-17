package com.pos.app.repositories;

import com.pos.app.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(String name);
    Optional<Role> findFirstByName(String name);
    Boolean existsByName(String name);
    List<Role> findAllByName(String name);
}
