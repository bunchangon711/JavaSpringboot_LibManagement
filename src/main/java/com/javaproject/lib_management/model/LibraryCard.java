package com.javaproject.lib_management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "library_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @Column(unique = true)
    private String cardNumber; // Format: LIB-YYYY-XXXX
    
    @NotNull
    private LocalDate issueDate = LocalDate.now();
    
    @NotNull
    private LocalDate expiryDate;
    
    private Boolean isActive = true;
    
    private Integer maxBooksAllowed = 5; // Default borrowing limit
    
    private Double outstandingFines = 0.0;
    
    // Method to check if card is valid
    @Transient
    public boolean isValid() {
        return isActive && expiryDate.isAfter(LocalDate.now()) && outstandingFines < 50.0;
    }
    
    // Method to generate card number
    @PrePersist
    private void generateCardNumber() {
        if (cardNumber == null) {
            int year = LocalDate.now().getYear();
            // Generate a random 4-digit number
            int random = (int) (Math.random() * 9000) + 1000;
            cardNumber = "LIB-" + year + "-" + random;
        }
    }
}
