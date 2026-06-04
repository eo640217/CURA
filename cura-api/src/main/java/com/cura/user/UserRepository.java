package com.cura.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByOrganizationIdAndUserNumber(Long orgId, String userNumber);
    boolean existsByOrganizationIdAndUserNumber(Long orgId, String userNumber);
    List<User> findByUsernameContainingIgnoreCaseOrderByUsernameAsc(String username);
    List<User> findAllByOrderByUsernameAsc();
    List<User> findByOrganizationIdOrderByUsernameAsc(Long orgId);
    List<User> findByOrganizationIdAndUsernameContainingIgnoreCaseOrderByUsernameAsc(Long orgId, String username);
}
