package com.javaproject.lib_management.repository;

import com.javaproject.lib_management.model.Borrowing;
import com.javaproject.lib_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {
    List<Borrowing> findByUserAndIsReturnedFalse(User user);
    List<Borrowing> findByDueDateBeforeAndIsReturnedFalse(LocalDate date);
    
    @Query("SELECT b FROM Borrowing b WHERE b.isReturned = false AND b.dueDate < CURRENT_DATE")
    List<Borrowing> findOverdueBooks();
    
    @Query("SELECT b FROM Borrowing b WHERE b.user.id = :userId")
    List<Borrowing> findByUserId(Long userId);
    
    @Query("SELECT COUNT(b) FROM Borrowing b WHERE b.user.id = :userId AND b.isReturned = false")
    long countActiveLoans(Long userId);
}
