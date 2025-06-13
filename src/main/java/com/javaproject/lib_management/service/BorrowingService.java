package com.javaproject.lib_management.service;

import com.javaproject.lib_management.model.Book;
import com.javaproject.lib_management.model.Borrowing;
import com.javaproject.lib_management.model.User;
import com.javaproject.lib_management.repository.BookRepository;
import com.javaproject.lib_management.repository.BorrowingRepository;
import com.javaproject.lib_management.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowingService {
    private final BorrowingRepository borrowingRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    
    private static final int DEFAULT_LOAN_DAYS = 14;
    private static final double DAILY_FINE_RATE = 0.50;

    public List<Borrowing> getAllBorrowings() {
        return borrowingRepository.findAll();
    }

    public Borrowing getBorrowingById(Long id) {
        return borrowingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Borrowing record not found with id: " + id));
    }

    public List<Borrowing> getBorrowingsByUserId(Long userId) {
        return borrowingRepository.findByUserId(userId);
    }

    public List<Borrowing> getOverdueBooks() {
        return borrowingRepository.findOverdueBooks();
    }

    @Transactional
    public Borrowing borrowBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new EntityNotFoundException("Book not found with id: " + bookId));
        
        // Check if user has reached the borrowing limit (e.g., 5 books)
        long activeLoans = borrowingRepository.countActiveLoans(userId);
        if (activeLoans >= 5) {
            throw new IllegalStateException("User has reached the maximum borrowing limit");
        }
        
        // Check if book is available
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("Book is not available for borrowing");
        }
        
        // Update book availability
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        
        // Create borrowing record
        Borrowing borrowing = new Borrowing();
        borrowing.setUser(user);
        borrowing.setBook(book);
        borrowing.setBorrowDate(LocalDate.now());
        borrowing.setDueDate(LocalDate.now().plusDays(DEFAULT_LOAN_DAYS));
        borrowing.setIsReturned(false);
        
        return borrowingRepository.save(borrowing);
    }

    @Transactional
    public Borrowing returnBook(Long borrowingId) {
        Borrowing borrowing = getBorrowingById(borrowingId);
        
        // Check if book is already returned
        if (borrowing.getIsReturned()) {
            throw new IllegalStateException("Book is already returned");
        }
        
        // Update borrowing record
        borrowing.setReturnDate(LocalDate.now());
        borrowing.setIsReturned(true);
        
        // Calculate fine if returned late
        if (borrowing.getReturnDate().isAfter(borrowing.getDueDate())) {
            long daysLate = java.time.temporal.ChronoUnit.DAYS.between(
                borrowing.getDueDate(), borrowing.getReturnDate());
            double fine = daysLate * DAILY_FINE_RATE;
            borrowing.setFine(fine);
        }
        
        // Update book availability
        Book book = borrowing.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        
        return borrowingRepository.save(borrowing);
    }

    public double calculateFine(Long borrowingId) {
        Borrowing borrowing = getBorrowingById(borrowingId);
        
        if (borrowing.getIsReturned()) {
            return borrowing.getFine();
        } else {
            // For unreturned books, calculate fine as of today
            LocalDate today = LocalDate.now();
            if (today.isAfter(borrowing.getDueDate())) {
                long daysLate = java.time.temporal.ChronoUnit.DAYS.between(
                    borrowing.getDueDate(), today);
                return daysLate * DAILY_FINE_RATE;
            }
        }
        
        return 0.0;
    }
}
