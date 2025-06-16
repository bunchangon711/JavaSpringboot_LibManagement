package com.javaproject.lib_management.repository;

import com.javaproject.lib_management.model.Subscription;
import com.javaproject.lib_management.model.SubscriptionTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    Optional<Subscription> findByUserId(Long userId);
    
    List<Subscription> findByTier(SubscriptionTier tier);
    
    List<Subscription> findByIsActiveTrue();
    
    List<Subscription> findByIsActiveFalse();
    
    @Query("SELECT s FROM Subscription s WHERE s.endDate IS NOT NULL AND s.endDate < :now AND s.isActive = true")
    List<Subscription> findExpiredSubscriptions(@Param("now") LocalDateTime now);
    
    @Query("SELECT s FROM Subscription s WHERE s.endDate IS NOT NULL AND s.endDate BETWEEN :now AND :warningDate AND s.isActive = true")
    List<Subscription> findSubscriptionsExpiringBetween(@Param("now") LocalDateTime now, @Param("warningDate") LocalDateTime warningDate);
    
    @Query("SELECT s FROM Subscription s WHERE s.autoRenew = true AND s.endDate IS NOT NULL AND s.endDate <= :renewalDate")
    List<Subscription> findSubscriptionsForAutoRenewal(@Param("renewalDate") LocalDateTime renewalDate);
    
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.tier = :tier AND s.isActive = true")
    long countActiveSubscriptionsByTier(@Param("tier") SubscriptionTier tier);
    
    boolean existsByUserId(Long userId);
}
