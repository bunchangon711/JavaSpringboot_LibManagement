package com.javaproject.lib_management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Author is required")
    private String author;
    
    @NotBlank(message = "ISBN is required")
    @Column(unique = true)
    private String isbn;
    
    @NotNull(message = "Publication date is required")
    private LocalDate publicationDate;
    
    private String publisher;
    
    private String category;
      @NotNull(message = "Total copies is required")
    private Integer totalCopies;
    
    @NotNull(message = "Available copies is required")
    private Integer availableCopies;
    
    // Image URL for book cover (optional)
    private String imageUrl;
}
