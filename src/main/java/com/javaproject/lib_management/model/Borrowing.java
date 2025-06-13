package com.javaproject.lib_management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "borrowings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Borrowing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @NotNull(message = "Borrow date is required")
    private LocalDate borrowDate = LocalDate.now();
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    private LocalDate returnDate;
    
    private Double fine = 0.0;
    
    private Boolean isReturned = false;
    
    // Method to calculate fine
    @Transient
    public double calculateFine() {
        if (isReturned && returnDate.isAfter(dueDate)) {
            long daysLate = java.time.temporal.ChronoUnit.DAYS.between(dueDate, returnDate);
            return daysLate * 0.5; // $0.50 per day
        }
        return 0.0;
    }
}
