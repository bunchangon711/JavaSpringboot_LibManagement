package com.javaproject.lib_management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @NotNull
    private LocalDate reservationDate = LocalDate.now();
    
    @NotNull
    private LocalDate expiryDate; // How long the reservation is valid
    
    private LocalDate notificationDate; // When user was notified book is available
    
    private Boolean isActive = true;
    
    private Integer queuePosition; // Position in waiting list
    
    @Enumerated(EnumType.STRING)
    private ReservationStatus status = ReservationStatus.WAITING;
    
    public enum ReservationStatus {
        WAITING,     // Waiting for book to become available
        AVAILABLE,   // Book is available for pickup
        FULFILLED,   // User picked up the book
        EXPIRED,     // Reservation expired
        CANCELLED    // User cancelled reservation
    }
    
    @PrePersist
    private void setExpiryDate() {
        if (expiryDate == null) {
            expiryDate = LocalDate.now().plusDays(7); // 7 days to pick up once available
        }
    }
}
