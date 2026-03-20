package com.cura.resident;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResidentNoteRepository extends JpaRepository<ResidentNote, Long> {
    List<ResidentNote> findByResidentIdOrderByCreatedAtDesc(Long residentId);
}