package com.javaproject.lib_management.repository;

import com.javaproject.lib_management.model.Reservation;
import com.javaproject.lib_management.model.User;
import com.javaproject.lib_management.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    // Find active reservations for a user
    List<Reservation> findByUserAndIsActiveTrueOrderByReservationDateAsc(User user);
    
    // Find active reservations for a book (ordered by queue position)
    List<Reservation> findByBookAndIsActiveTrueOrderByQueuePositionAsc(Book book);
    
    // Find reservations by user ID
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.isActive = true")
    List<Reservation> findActiveReservationsByUserId(@Param("userId") Long userId);
    
    // Find expired reservations
    @Query("SELECT r FROM Reservation r WHERE r.expiryDate < :currentDate AND r.isActive = true")
    List<Reservation> findExpiredReservations(@Param("currentDate") LocalDate currentDate);
    
    // Check if user already has reservation for this book
    Optional<Reservation> findByUserAndBookAndIsActiveTrue(User user, Book book);
    
    // Count active reservations for a book
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.book.id = :bookId AND r.isActive = true")
    long countActiveReservationsForBook(@Param("bookId") Long bookId);
    
    // Find next reservation in queue for a book
    @Query("SELECT r FROM Reservation r WHERE r.book.id = :bookId AND r.isActive = true AND r.status = 'WAITING' ORDER BY r.queuePosition ASC LIMIT 1")
    Optional<Reservation> findNextInQueue(@Param("bookId") Long bookId);
    
    // Update queue positions when a reservation is cancelled/fulfilled
    @Modifying
    @Query("UPDATE Reservation r SET r.queuePosition = r.queuePosition - 1 WHERE r.book.id = :bookId AND r.queuePosition > :cancelledPosition AND r.isActive = true")
    void updateQueuePositions(@Param("bookId") Long bookId, @Param("cancelledPosition") Integer cancelledPosition);
    
    // Find reservations ready for pickup
    @Query("SELECT r FROM Reservation r WHERE r.status = 'AVAILABLE' AND r.isActive = true")
    List<Reservation> findReservationsReadyForPickup();
}
