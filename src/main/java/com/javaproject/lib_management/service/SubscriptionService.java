package com.javaproject.lib_management.service;

import com.javaproject.lib_management.model.Subscription;
import com.javaproject.lib_management.model.SubscriptionTier;
import com.javaproject.lib_management.model.User;
import com.javaproject.lib_management.repository.SubscriptionRepository;
import com.javaproject.lib_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SubscriptionService {
    
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Subscription createSubscription(Long userId, SubscriptionTier tier) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Check if user already has a subscription
        Optional<Subscription> existingSubscription = subscriptionRepository.findByUserId(userId);
        if (existingSubscription.isPresent()) {
            throw new RuntimeException("User already has a subscription");
        }
        
        Subscription subscription = new Subscription(user, tier);
        return subscriptionRepository.save(subscription);
    }
    
    public Subscription getSubscriptionByUserId(Long userId) {
        Optional<Subscription> subscription = subscriptionRepository.findByUserId(userId);
        if (subscription.isEmpty()) {
            // Create a free subscription for users who don't have one
            return createSubscription(userId, SubscriptionTier.FREE);
        }
        return subscription.get();
    }
    
    public Subscription upgradeSubscription(Long userId, SubscriptionTier newTier) {
        Subscription subscription = getSubscriptionByUserId(userId);
        
        if (subscription.getTier() == newTier) {
            throw new RuntimeException("User already has this subscription tier");
        }
        
        subscription.setTier(newTier);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setIsActive(true);
        
        return subscriptionRepository.save(subscription);
    }
    
    public Subscription renewSubscription(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.renewSubscription();
        return subscriptionRepository.save(subscription);
    }
    
    public void cancelSubscription(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.setIsActive(false);
        subscriptionRepository.save(subscription);
    }
    
    public void reactivateSubscription(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        if (subscription.isExpired()) {
            subscription.renewSubscription();
        } else {
            subscription.setIsActive(true);
        }
        subscriptionRepository.save(subscription);
    }
    
    public boolean canUserBorrowPhysicalBook(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        return subscription.canBorrowPhysicalBook();
    }
    
    public boolean canUserBorrowDigitalBook(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        return subscription.canBorrowDigitalBook();
    }
    
    public void incrementPhysicalBorrowCount(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.incrementPhysicalBorrowCount();
        subscriptionRepository.save(subscription);
    }
    
    public void decrementPhysicalBorrowCount(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.decrementPhysicalBorrowCount();
        subscriptionRepository.save(subscription);
    }
    
    public void incrementDigitalBorrowCount(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.incrementDigitalBorrowCount();
        subscriptionRepository.save(subscription);
    }
    
    public void decrementDigitalBorrowCount(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.decrementDigitalBorrowCount();
        subscriptionRepository.save(subscription);
    }
    
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }
    
    public List<Subscription> getActiveSubscriptions() {
        return subscriptionRepository.findByIsActiveTrue();
    }
    
    public List<Subscription> getSubscriptionsByTier(SubscriptionTier tier) {
        return subscriptionRepository.findByTier(tier);
    }
    
    public List<Subscription> getExpiredSubscriptions() {
        return subscriptionRepository.findExpiredSubscriptions(LocalDateTime.now());
    }
    
    public List<Subscription> getSubscriptionsExpiringWithinDays(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime warningDate = now.plusDays(days);
        return subscriptionRepository.findSubscriptionsExpiringBetween(now, warningDate);
    }
    
    public void processExpiredSubscriptions() {
        List<Subscription> expiredSubscriptions = getExpiredSubscriptions();
        for (Subscription subscription : expiredSubscriptions) {
            if (subscription.getTier() != SubscriptionTier.FREE) {
                // Downgrade to free tier when subscription expires
                subscription.setTier(SubscriptionTier.FREE);
                subscription.setIsActive(true);
                subscription.setEndDate(null);
                subscription.resetMonthlyCounts();
                subscriptionRepository.save(subscription);
            }
        }
    }
    
    public void processAutoRenewals() {
        LocalDateTime renewalDate = LocalDateTime.now().plusDays(1);
        List<Subscription> subscriptionsForRenewal = subscriptionRepository.findSubscriptionsForAutoRenewal(renewalDate);
        
        for (Subscription subscription : subscriptionsForRenewal) {
            // In a real application, you would integrate with a payment processor here
            // For now, we'll just renew the subscription
            subscription.renewSubscription();
            subscriptionRepository.save(subscription);
        }
    }
    
    public long getActiveSubscriptionCountByTier(SubscriptionTier tier) {
        return subscriptionRepository.countActiveSubscriptionsByTier(tier);
    }
    
    public void resetMonthlyCountsForUser(Long userId) {
        Subscription subscription = getSubscriptionByUserId(userId);
        subscription.resetMonthlyCounts();
        subscriptionRepository.save(subscription);
    }
}
