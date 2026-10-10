package com.lawtan.repository;

import com.lawtan.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Long id);
}
