package com.javaproject.lib_management.controller;

import com.javaproject.lib_management.model.Subscription;
import com.javaproject.lib_management.model.SubscriptionTier;
import com.javaproject.lib_management.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubscriptionController {
    
    @Autowired
    private SubscriptionService subscriptionService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Subscription> getUserSubscription(@PathVariable Long userId) {
        try {
            Subscription subscription = subscriptionService.getSubscriptionByUserId(userId);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<Subscription> createSubscription(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            SubscriptionTier tier = SubscriptionTier.valueOf(request.get("tier").toString());
            
            Subscription subscription = subscriptionService.createSubscription(userId, tier);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/upgrade")
    public ResponseEntity<Subscription> upgradeSubscription(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            SubscriptionTier tier = SubscriptionTier.valueOf(request.get("tier").toString());
            
            Subscription subscription = subscriptionService.upgradeSubscription(userId, tier);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/renew/{userId}")
    public ResponseEntity<Subscription> renewSubscription(@PathVariable Long userId) {
        try {
            Subscription subscription = subscriptionService.renewSubscription(userId);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/cancel/{userId}")
    public ResponseEntity<String> cancelSubscription(@PathVariable Long userId) {
        try {
            subscriptionService.cancelSubscription(userId);
            return ResponseEntity.ok("Subscription cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cancel subscription: " + e.getMessage());
        }
    }
    
    @PutMapping("/reactivate/{userId}")
    public ResponseEntity<String> reactivateSubscription(@PathVariable Long userId) {
        try {
            subscriptionService.reactivateSubscription(userId);
            return ResponseEntity.ok("Subscription reactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reactivate subscription: " + e.getMessage());
        }
    }
    
    @GetMapping("/tiers")
    public ResponseEntity<SubscriptionTier[]> getSubscriptionTiers() {
        return ResponseEntity.ok(SubscriptionTier.values());
    }
    
    @GetMapping("/tier-info/{tier}")
    public ResponseEntity<Map<String, Object>> getTierInfo(@PathVariable String tier) {
        try {
            SubscriptionTier subscriptionTier = SubscriptionTier.valueOf(tier.toUpperCase());
            Map<String, Object> tierInfo = Map.of(
                "name", subscriptionTier.getDisplayName(),
                "price", subscriptionTier.getPrice(),
                "physicalBookLimit", subscriptionTier.getPhysicalBookLimit(),
                "digitalBookLimit", subscriptionTier.isUnlimitedDigital() ? "Unlimited" : subscriptionTier.getDigitalBookLimit(),
                "description", subscriptionTier.getDescription(),
                "benefits", subscriptionTier.getBenefits()
            );
            return ResponseEntity.ok(tierInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping("/check-borrow-eligibility/{userId}")
    public ResponseEntity<Map<String, Boolean>> checkBorrowEligibility(@PathVariable Long userId, 
                                                                      @RequestParam String bookType) {
        try {
            boolean canBorrow;
            if ("physical".equalsIgnoreCase(bookType)) {
                canBorrow = subscriptionService.canUserBorrowPhysicalBook(userId);
            } else if ("digital".equalsIgnoreCase(bookType)) {
                canBorrow = subscriptionService.canUserBorrowDigitalBook(userId);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", true));
            }
            
            return ResponseEntity.ok(Map.of("canBorrow", canBorrow));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", true));
        }
    }
    
    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        List<Subscription> subscriptions = subscriptionService.getAllSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Subscription>> getActiveSubscriptions() {
        List<Subscription> subscriptions = subscriptionService.getActiveSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }
    
    @GetMapping("/expired")
    public ResponseEntity<List<Subscription>> getExpiredSubscriptions() {
        List<Subscription> subscriptions = subscriptionService.getExpiredSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }
    
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<Subscription>> getSubscriptionsExpiringSoon(@RequestParam(defaultValue = "7") int days) {
        List<Subscription> subscriptions = subscriptionService.getSubscriptionsExpiringWithinDays(days);
        return ResponseEntity.ok(subscriptions);
    }
    
    @PostMapping("/process-expired")
    public ResponseEntity<String> processExpiredSubscriptions() {
        try {
            subscriptionService.processExpiredSubscriptions();
            return ResponseEntity.ok("Expired subscriptions processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to process expired subscriptions: " + e.getMessage());
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSubscriptionStats() {
        Map<String, Object> stats = Map.of(
            "free", subscriptionService.getActiveSubscriptionCountByTier(SubscriptionTier.FREE),
            "monthly", subscriptionService.getActiveSubscriptionCountByTier(SubscriptionTier.MONTHLY),
            "annual", subscriptionService.getActiveSubscriptionCountByTier(SubscriptionTier.ANNUAL)
        );
        return ResponseEntity.ok(stats);
    }
}
