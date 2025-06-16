package com.javaproject.lib_management.service;

import com.javaproject.lib_management.model.Reservation;
import com.javaproject.lib_management.model.Book;
import com.javaproject.lib_management.model.User;
import com.javaproject.lib_management.repository.ReservationRepository;
import com.javaproject.lib_management.repository.BookRepository;
import com.javaproject.lib_management.repository.UserRepository;
import com.javaproject.lib_management.repository.BorrowingRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowingRepository borrowingRepository;
    
    private static final int MAX_RESERVATIONS_PER_USER = 5;
    private static final int PICKUP_DAYS = 3; // Days to pick up once available
    
    @Transactional
    public Reservation createReservation(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new EntityNotFoundException("Book not found with id: " + bookId));
        
        // Check if book is available (if so, user should borrow directly)
        if (book.getAvailableCopies() > 0) {
            throw new IllegalStateException("Book is currently available. Please check it out directly.");
        }
          // Check if user already has this book checked out
        boolean hasThisBookBorrowed = borrowingRepository.findByUserAndIsReturnedFalse(user)
            .stream()
            .anyMatch(borrowing -> borrowing.getBook().getId().equals(bookId));
        
        if (hasThisBookBorrowed) {
            throw new IllegalStateException("You already have this book checked out.");
        }
        
        // Check if user already has reservation for this book
        Optional<Reservation> existingReservation = reservationRepository.findByUserAndBookAndIsActiveTrue(user, book);
        if (existingReservation.isPresent()) {
            throw new IllegalStateException("You already have a reservation for this book.");
        }
        
        // Check user's reservation limit
        List<Reservation> userReservations = reservationRepository.findActiveReservationsByUserId(userId);
        if (userReservations.size() >= MAX_RESERVATIONS_PER_USER) {
            throw new IllegalStateException("You have reached the maximum number of reservations (" + MAX_RESERVATIONS_PER_USER + ").");
        }
        
        // Create new reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setReservationDate(LocalDate.now());
        reservation.setExpiryDate(LocalDate.now().plusDays(30)); // Reservation valid for 30 days
        reservation.setStatus(Reservation.ReservationStatus.WAITING);
        reservation.setIsActive(true);
        
        // Set queue position (last in line)
        long queueCount = reservationRepository.countActiveReservationsForBook(bookId);
        reservation.setQueuePosition((int) queueCount + 1);
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public void cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + reservationId));
        
        // Verify the reservation belongs to the user
        if (!reservation.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You can only cancel your own reservations.");
        }
        
        if (!reservation.getIsActive()) {
            throw new IllegalStateException("Reservation is already inactive.");
        }
        
        // Cancel the reservation
        reservation.setIsActive(false);
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        
        // Update queue positions for remaining reservations
        reservationRepository.updateQueuePositions(
            reservation.getBook().getId(), 
            reservation.getQueuePosition()
        );
    }
    
    @Transactional
    public void processReturnForReservations(Long bookId) {
        // When a book is returned, check if there are any waiting reservations
        Optional<Reservation> nextReservation = reservationRepository.findNextInQueue(bookId);
        
        if (nextReservation.isPresent()) {
            Reservation reservation = nextReservation.get();
            reservation.setStatus(Reservation.ReservationStatus.AVAILABLE);
            reservation.setNotificationDate(LocalDate.now());
            reservation.setExpiryDate(LocalDate.now().plusDays(PICKUP_DAYS)); // 3 days to pick up
            reservationRepository.save(reservation);
            
            // Here you could add notification logic (email, SMS, etc.)
            // For now, we'll just update the status
        }
    }
    
    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findActiveReservationsByUserId(userId);
    }
    
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
    
    public List<Reservation> getExpiredReservations() {
        return reservationRepository.findExpiredReservations(LocalDate.now());
    }
    
    @Transactional
    public void processExpiredReservations() {
        List<Reservation> expiredReservations = getExpiredReservations();
        
        for (Reservation reservation : expiredReservations) {
            reservation.setIsActive(false);
            reservation.setStatus(Reservation.ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);
            
            // Update queue positions
            reservationRepository.updateQueuePositions(
                reservation.getBook().getId(), 
                reservation.getQueuePosition()
            );
        }
    }
    
    @Transactional
    public void fulfillReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id: " + reservationId));
        
        if (reservation.getStatus() != Reservation.ReservationStatus.AVAILABLE) {
            throw new IllegalStateException("Reservation is not available for pickup.");
        }
        
        reservation.setIsActive(false);
        reservation.setStatus(Reservation.ReservationStatus.FULFILLED);
        reservationRepository.save(reservation);
    }
}
