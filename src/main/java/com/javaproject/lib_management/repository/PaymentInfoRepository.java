package com.javaproject.lib_management.repository;

import com.javaproject.lib_management.model.PaymentInfo;
import com.javaproject.lib_management.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, Long> {
    
    Optional<PaymentInfo> findByUserId(Long userId);
    
    List<PaymentInfo> findByPaymentMethod(PaymentMethod paymentMethod);
    
    List<PaymentInfo> findByIsActiveTrue();
    
    List<PaymentInfo> findByIsActiveFalse();
    
    @Query("SELECT p FROM PaymentInfo p WHERE p.paymentMethod = :method AND p.isActive = true")
    List<PaymentInfo> findActiveByPaymentMethod(@Param("method") PaymentMethod method);
    
    @Query("SELECT p FROM PaymentInfo p WHERE p.cardExpYear < :year OR (p.cardExpYear = :year AND p.cardExpMonth < :month)")
    List<PaymentInfo> findExpiredCards(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT p FROM PaymentInfo p WHERE p.cardExpYear = :year AND p.cardExpMonth = :month")
    List<PaymentInfo> findCardsExpiringInMonth(@Param("year") int year, @Param("month") int month);
    
    boolean existsByUserId(Long userId);
    
    @Query("SELECT COUNT(p) FROM PaymentInfo p WHERE p.paymentMethod = :method AND p.isActive = true")
    long countActiveByPaymentMethod(@Param("method") PaymentMethod method);
}
