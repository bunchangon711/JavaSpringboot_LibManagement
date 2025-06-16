package com.javaproject.lib_management.model;

public enum SubscriptionTier {
    FREE("Free", 0, 10, 0.0),
    MONTHLY("Monthly", 10, -1, 9.99), // -1 means unlimited
    ANNUAL("Annual", 20, -1, 99.99);
    
    private final String displayName;
    private final int physicalBookLimit;
    private final int digitalBookLimit; // -1 for unlimited
    private final double price;
    
    SubscriptionTier(String displayName, int physicalBookLimit, int digitalBookLimit, double price) {
        this.displayName = displayName;
        this.physicalBookLimit = physicalBookLimit;
        this.digitalBookLimit = digitalBookLimit;
        this.price = price;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getPhysicalBookLimit() {
        return physicalBookLimit;
    }
    
    public int getDigitalBookLimit() {
        return digitalBookLimit;
    }
    
    public double getPrice() {
        return price;
    }
    
    public boolean isUnlimitedDigital() {
        return digitalBookLimit == -1;
    }
    
    public String getDescription() {
        switch (this) {
            case FREE:
                return "0 physical books, 10 digital books";
            case MONTHLY:
                return "10 physical books, unlimited digital books";
            case ANNUAL:
                return "20 physical books, unlimited digital books";
            default:
                return "";
        }
    }
    
    public String getBenefits() {
        switch (this) {
            case FREE:
                return "Access to digital collection with 10 monthly downloads";
            case MONTHLY:
                return "Physical book borrowing + unlimited digital access";
            case ANNUAL:
                return "Maximum borrowing privileges + unlimited digital access + priority holds";
            default:
                return "";
        }
    }
}
