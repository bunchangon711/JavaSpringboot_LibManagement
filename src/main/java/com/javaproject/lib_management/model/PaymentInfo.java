package com.javaproject.lib_management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_info")
public class PaymentInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;
    
    // Bank Account fields
    @Column(name = "bank_account_number")
    private String bankAccountNumber;
    
    @Column(name = "bank_routing_number")
    private String bankRoutingNumber;
    
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "account_holder_name")
    private String accountHolderName;
    
    // PayPal fields
    @Column(name = "paypal_email")
    private String paypalEmail;
    
    // Stripe fields
    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;
    
    @Column(name = "stripe_payment_method_id")
    private String stripePaymentMethodId;
    
    @Column(name = "card_last_four")
    private String cardLastFour;
    
    @Column(name = "card_brand")
    private String cardBrand;
    
    @Column(name = "card_exp_month")
    private Integer cardExpMonth;
    
    @Column(name = "card_exp_year")
    private Integer cardExpYear;
    
    // Common fields
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = true;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public PaymentInfo() {
        this.createdAt = LocalDateTime.now();
    }
    
    public PaymentInfo(User user, PaymentMethod paymentMethod) {
        this();
        this.user = user;
        this.paymentMethod = paymentMethod;
    }
    
    // Business methods
    public String getMaskedAccountInfo() {
        switch (paymentMethod) {
            case BANK_ACCOUNT:
                if (bankAccountNumber != null && bankAccountNumber.length() > 4) {
                    return "****" + bankAccountNumber.substring(bankAccountNumber.length() - 4);
                }
                return "****";
            case PAYPAL:
                if (paypalEmail != null) {
                    String[] parts = paypalEmail.split("@");
                    if (parts.length == 2) {
                        String username = parts[0];
                        String domain = parts[1];
                        String maskedUsername = username.length() > 2 ? 
                            username.substring(0, 2) + "***" : "***";
                        return maskedUsername + "@" + domain;
                    }
                }
                return "***@***.com";
            case STRIPE:
                return cardBrand != null ? cardBrand + " ****" + (cardLastFour != null ? cardLastFour : "****") : "****";
            default:
                return "****";
        }
    }
    
    public String getDisplayInfo() {
        switch (paymentMethod) {
            case BANK_ACCOUNT:
                return bankName != null ? bankName + " " + getMaskedAccountInfo() : getMaskedAccountInfo();
            case PAYPAL:
                return "PayPal " + getMaskedAccountInfo();
            case STRIPE:
                String expiry = (cardExpMonth != null && cardExpYear != null) ? 
                    String.format(" (Exp: %02d/%d)", cardExpMonth, cardExpYear) : "";
                return getMaskedAccountInfo() + expiry;
            default:
                return paymentMethod.getDisplayName();
        }
    }
    
    public boolean isExpired() {
        if (paymentMethod == PaymentMethod.STRIPE && cardExpMonth != null && cardExpYear != null) {
            LocalDateTime now = LocalDateTime.now();
            return now.getYear() > cardExpYear || 
                   (now.getYear() == cardExpYear && now.getMonthValue() > cardExpMonth);
        }
        return false;
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
    
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getBankAccountNumber() {
        return bankAccountNumber;
    }
    
    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }
    
    public String getBankRoutingNumber() {
        return bankRoutingNumber;
    }
    
    public void setBankRoutingNumber(String bankRoutingNumber) {
        this.bankRoutingNumber = bankRoutingNumber;
    }
    
    public String getBankName() {
        return bankName;
    }
    
    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
    
    public String getAccountHolderName() {
        return accountHolderName;
    }
    
    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }
    
    public String getPaypalEmail() {
        return paypalEmail;
    }
    
    public void setPaypalEmail(String paypalEmail) {
        this.paypalEmail = paypalEmail;
    }
    
    public String getStripeCustomerId() {
        return stripeCustomerId;
    }
    
    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }
    
    public String getStripePaymentMethodId() {
        return stripePaymentMethodId;
    }
    
    public void setStripePaymentMethodId(String stripePaymentMethodId) {
        this.stripePaymentMethodId = stripePaymentMethodId;
    }
    
    public String getCardLastFour() {
        return cardLastFour;
    }
    
    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }
    
    public String getCardBrand() {
        return cardBrand;
    }
    
    public void setCardBrand(String cardBrand) {
        this.cardBrand = cardBrand;
    }
    
    public Integer getCardExpMonth() {
        return cardExpMonth;
    }
    
    public void setCardExpMonth(Integer cardExpMonth) {
        this.cardExpMonth = cardExpMonth;
    }
    
    public Integer getCardExpYear() {
        return cardExpYear;
    }
    
    public void setCardExpYear(Integer cardExpYear) {
        this.cardExpYear = cardExpYear;
    }
    
    public Boolean getIsDefault() {
        return isDefault;
    }
    
    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
