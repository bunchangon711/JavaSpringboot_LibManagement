package com.javaproject.lib_management.service;

import com.javaproject.lib_management.model.Book;
import com.javaproject.lib_management.model.BookType;
import com.javaproject.lib_management.model.Borrowing;
import com.javaproject.lib_management.model.User;
import com.javaproject.lib_management.repository.BookRepository;
import com.javaproject.lib_management.repository.BorrowingRepository;
import com.javaproject.lib_management.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final SubscriptionService subscriptionService;
    
    private static final int DEFAULT_LOAN_DAYS = 14;
    private static final int RENEWAL_DAYS = 14;
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
    }    @Transactional
    public Borrowing borrowBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new EntityNotFoundException("Book not found with id: " + bookId));
        
        // Check subscription-based borrowing eligibility
        if (book.getBookType() == BookType.PHYSICAL) {
            if (!subscriptionService.canUserBorrowPhysicalBook(userId)) {
                throw new IllegalStateException("User's subscription does not allow borrowing physical books or limit reached");
            }
        } else if (book.getBookType() == BookType.DIGITAL) {
            if (!subscriptionService.canUserBorrowDigitalBook(userId)) {
                throw new IllegalStateException("User's subscription does not allow borrowing digital books or limit reached");
            }
        }
        
        // Check if book is available
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("Book is not available for borrowing");
        }
        
        // Update book availability
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        
        // Update subscription borrow counts
        if (book.getBookType() == BookType.PHYSICAL) {
            subscriptionService.incrementPhysicalBorrowCount(userId);
        } else {
            subscriptionService.incrementDigitalBorrowCount(userId);
        }
        
        // Create borrowing record
        Borrowing borrowing = new Borrowing();
        borrowing.setUser(user);
        borrowing.setBook(book);
        borrowing.setBorrowDate(LocalDate.now());
        
        // Use book's loan period or default
        int loanDays = book.getLoanPeriodDays() != null ? book.getLoanPeriodDays() : DEFAULT_LOAN_DAYS;
        borrowing.setDueDate(LocalDate.now().plusDays(loanDays));
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
        }        // Update book availability
        Book book = borrowing.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        
        // Update subscription borrow counts
        if (book.getBookType() == BookType.PHYSICAL) {
            subscriptionService.decrementPhysicalBorrowCount(borrowing.getUser().getId());
        } else {
            subscriptionService.decrementDigitalBorrowCount(borrowing.getUser().getId());
        }
        
        // TODO: Process any waiting reservations for this book
        // This will be implemented when ReservationService is integrated
        // reservationService.processReturnForReservations(book.getId());
        
        return borrowingRepository.save(borrowing);
    }

    @Transactional
    public Borrowing renewBorrowing(Long borrowingId, Long userId) {
        Borrowing borrowing = borrowingRepository.findById(borrowingId)
            .orElseThrow(() -> new EntityNotFoundException("Borrowing record not found with id: " + borrowingId));
        
        // Verify the borrowing belongs to the user
        if (!borrowing.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You can only renew your own borrowings.");
        }
        
        // Check if renewal is allowed
        if (!borrowing.canRenew()) {
            String reason = "";
            if (borrowing.getIsReturned()) {
                reason = "Book has already been returned.";
            } else if (borrowing.getRenewalCount() >= borrowing.getMaxRenewals()) {
                reason = "Maximum number of renewals (" + borrowing.getMaxRenewals() + ") has been reached.";
            } else if (LocalDate.now().isAfter(borrowing.getDueDate().plusDays(1))) {
                reason = "Book is overdue and cannot be renewed.";
            }
            throw new IllegalStateException("Cannot renew this borrowing. " + reason);
        }
        
        // Check if there are reservations waiting for this book
        // If there are, don't allow renewal
        // You'll need to inject ReservationService here or check directly
        
        // Perform the renewal
        borrowing.renew(RENEWAL_DAYS);
        
        return borrowingRepository.save(borrowing);
    }
    
    public boolean canRenewBorrowing(Long borrowingId, Long userId) {
        try {
            Borrowing borrowing = borrowingRepository.findById(borrowingId)
                .orElseThrow(() -> new EntityNotFoundException("Borrowing record not found with id: " + borrowingId));
            
            if (!borrowing.getUser().getId().equals(userId)) {
                return false;
            }
            
            return borrowing.canRenew();
        } catch (Exception e) {
            return false;
        }
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
