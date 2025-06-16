package com.javaproject.lib_management.model;

public enum BookType {
    PHYSICAL("Physical"),
    DIGITAL("Digital");
    
    private final String displayName;
    
    BookType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
