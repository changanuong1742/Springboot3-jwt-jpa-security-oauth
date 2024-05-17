package com.pos.app.seeder;

import com.pos.app.models.Permission;
import com.pos.app.models.Role;
import com.pos.app.models.User;
import com.pos.app.repositories.PermissionRepository;
import com.pos.app.repositories.RoleRepository;
import com.pos.app.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder {
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener
    public void seed(ContextRefreshedEvent event) {
        seedPermissionTable();
        seedRoleTable();
        addPermissionToRole();
        seedUsersTable();
        addRoleToUser();
    }

    private void seedPermissionTable() {
        List<String> groupPermissions = Arrays.asList("user", "role", "seat", "product", "order", "dashboard");
        List<String> permissions = Arrays.asList("View", "Create", "Update", "Delete");

        for (String groupPermission : groupPermissions) {
            for (String permission : permissions) {
                if (!permissionRepository.existsByName(permission + " " + groupPermission)) {
                    Permission permissionBuild = Permission.builder().name(permission + " " + groupPermission).build();
                    permissionRepository.save(permissionBuild);
                }
            }
        }
    }

    private void seedRoleTable() {

        if (!roleRepository.existsByName("Admin")) {
            Role role = Role.builder().name("Admin").build();
            roleRepository.save(role);
        }
    }

    private void addPermissionToRole() {
        Optional<Role> roleOptional = roleRepository.findFirstByName("Admin");
        if (roleOptional.isPresent()) {
            Role role = roleOptional.get();
            role.setPermissions(permissionRepository.findAll());
            roleRepository.save(role);
        }

    }

    private void seedUsersTable() {
        if (!userRepository.existsByEmail("admin@pos.com")) {
            User user = User.builder().lastname("Super").email("admin@pos.com").firstname("Admin").password(passwordEncoder.encode("admin@pos.com")).build();
            userRepository.save(user);
        }
    }
    private void addRoleToUser() {
        User user = userRepository.findFirstByEmail("admin@pos.com");
        Optional<Role> roleOptional = roleRepository.findFirstByName("Admin");

        if (roleOptional.isPresent()){
            Role role = roleOptional.get();
            if (user.getRoles() == null || !userHasRole(user, role)) {
                if (user.getRoles() == null) {
                    user.setRoles(new ArrayList<>()); // Initialize roles list if null
                }
                user.getRoles().add(role); // Add the role to the user's roles
                userRepository.save(user); // Save the user with the new role
            }
        }
    }

    private boolean userHasRole(User user, Role role) {
        if (user.getRoles() != null) {
            for (Role userRole : user.getRoles()) {
                if (userRole.getId() == role.getId()) {
                    return true;
                }
            }
        }
        return false;
    }
}

