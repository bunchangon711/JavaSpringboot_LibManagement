package com.javaproject.lib_management.model;

public enum PaymentMethod {
    BANK_ACCOUNT("Bank Account"),
    PAYPAL("PayPal"),
    STRIPE("Credit/Debit Card (Stripe)");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
