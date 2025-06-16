package com.javaproject.lib_management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionTier tier = SubscriptionTier.FREE;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;
    
    @Column(name = "physical_books_borrowed", nullable = false)
    private Integer physicalBooksBorrowed = 0;
    
    @Column(name = "digital_books_borrowed", nullable = false)
    private Integer digitalBooksBorrowed = 0;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Subscription() {
        this.createdAt = LocalDateTime.now();
        this.startDate = LocalDateTime.now();
    }
    
    public Subscription(User user, SubscriptionTier tier) {
        this();
        this.user = user;
        this.tier = tier;
        setEndDateBasedOnTier();
    }
    
    // Business methods
    public void setEndDateBasedOnTier() {
        switch (this.tier) {
            case FREE:
                this.endDate = null; // Free tier doesn't expire
                break;
            case MONTHLY:
                this.endDate = this.startDate.plusMonths(1);
                break;
            case ANNUAL:
                this.endDate = this.startDate.plusYears(1);
                break;
        }
    }
    
    public boolean canBorrowPhysicalBook() {
        if (!isActive || (endDate != null && LocalDateTime.now().isAfter(endDate))) {
            return false;
        }
        
        return physicalBooksBorrowed < tier.getPhysicalBookLimit();
    }
    
    public boolean canBorrowDigitalBook() {
        if (!isActive || (endDate != null && LocalDateTime.now().isAfter(endDate))) {
            return false;
        }
        
        return digitalBooksBorrowed < tier.getDigitalBookLimit() || tier.getDigitalBookLimit() == -1;
    }
    
    public void incrementPhysicalBorrowCount() {
        this.physicalBooksBorrowed++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decrementPhysicalBorrowCount() {
        if (this.physicalBooksBorrowed > 0) {
            this.physicalBooksBorrowed--;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void incrementDigitalBorrowCount() {
        this.digitalBooksBorrowed++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void decrementDigitalBorrowCount() {
        if (this.digitalBooksBorrowed > 0) {
            this.digitalBooksBorrowed--;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public boolean isExpired() {
        return endDate != null && LocalDateTime.now().isAfter(endDate);
    }
    
    public void renewSubscription() {
        this.startDate = LocalDateTime.now();
        setEndDateBasedOnTier();
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void resetMonthlyCounts() {
        // Reset counts at the beginning of each billing cycle
        this.physicalBooksBorrowed = 0;
        this.digitalBooksBorrowed = 0;
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public SubscriptionTier getTier() {
        return tier;
    }
    
    public void setTier(SubscriptionTier tier) {
        this.tier = tier;
        setEndDateBasedOnTier();
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getAutoRenew() {
        return autoRenew;
    }
    
    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
    }
    
    public Integer getPhysicalBooksBorrowed() {
        return physicalBooksBorrowed;
    }
    
    public void setPhysicalBooksBorrowed(Integer physicalBooksBorrowed) {
        this.physicalBooksBorrowed = physicalBooksBorrowed;
    }
    
    public Integer getDigitalBooksBorrowed() {
        return digitalBooksBorrowed;
    }
    
    public void setDigitalBooksBorrowed(Integer digitalBooksBorrowed) {
        this.digitalBooksBorrowed = digitalBooksBorrowed;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
