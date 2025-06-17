package com.javaproject.lib_management.service;

import com.javaproject.lib_management.model.PaymentInfo;
import com.javaproject.lib_management.model.PaymentMethod;
import com.javaproject.lib_management.model.User;
import com.javaproject.lib_management.repository.PaymentInfoRepository;
import com.javaproject.lib_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PaymentInfoService {
    
    @Autowired
    private PaymentInfoRepository paymentInfoRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public PaymentInfo createPaymentInfo(Long userId, PaymentMethod paymentMethod) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Check if user already has payment info
        Optional<PaymentInfo> existingPaymentInfo = paymentInfoRepository.findByUserId(userId);
        if (existingPaymentInfo.isPresent()) {
            throw new RuntimeException("User already has payment information configured");
        }
        
        PaymentInfo paymentInfo = new PaymentInfo(user, paymentMethod);
        return paymentInfoRepository.save(paymentInfo);
    }
    
    public PaymentInfo getPaymentInfoByUserId(Long userId) {
        return paymentInfoRepository.findByUserId(userId)
            .orElse(null); // Return null if no payment info exists
    }
    
    public PaymentInfo updatePaymentInfo(Long userId, PaymentInfo updatedInfo) {
        PaymentInfo existingInfo = getPaymentInfoByUserId(userId);
        if (existingInfo == null) {
            throw new RuntimeException("No payment information found for user");
        }
        
        // Update fields based on payment method
        existingInfo.setPaymentMethod(updatedInfo.getPaymentMethod());
        
        switch (updatedInfo.getPaymentMethod()) {
            case BANK_ACCOUNT:
                existingInfo.setBankAccountNumber(updatedInfo.getBankAccountNumber());
                existingInfo.setBankRoutingNumber(updatedInfo.getBankRoutingNumber());
                existingInfo.setBankName(updatedInfo.getBankName());
                existingInfo.setAccountHolderName(updatedInfo.getAccountHolderName());
                // Clear other payment method fields
                existingInfo.setPaypalEmail(null);
                existingInfo.setStripeCustomerId(null);
                existingInfo.setStripePaymentMethodId(null);
                existingInfo.setCardLastFour(null);
                existingInfo.setCardBrand(null);
                existingInfo.setCardExpMonth(null);
                existingInfo.setCardExpYear(null);
                break;
                
            case PAYPAL:
                existingInfo.setPaypalEmail(updatedInfo.getPaypalEmail());
                // Clear other payment method fields
                existingInfo.setBankAccountNumber(null);
                existingInfo.setBankRoutingNumber(null);
                existingInfo.setBankName(null);
                existingInfo.setAccountHolderName(null);
                existingInfo.setStripeCustomerId(null);
                existingInfo.setStripePaymentMethodId(null);
                existingInfo.setCardLastFour(null);
                existingInfo.setCardBrand(null);
                existingInfo.setCardExpMonth(null);
                existingInfo.setCardExpYear(null);
                break;
                
            case STRIPE:
                existingInfo.setStripeCustomerId(updatedInfo.getStripeCustomerId());
                existingInfo.setStripePaymentMethodId(updatedInfo.getStripePaymentMethodId());
                existingInfo.setCardLastFour(updatedInfo.getCardLastFour());
                existingInfo.setCardBrand(updatedInfo.getCardBrand());
                existingInfo.setCardExpMonth(updatedInfo.getCardExpMonth());
                existingInfo.setCardExpYear(updatedInfo.getCardExpYear());
                // Clear other payment method fields
                existingInfo.setBankAccountNumber(null);
                existingInfo.setBankRoutingNumber(null);
                existingInfo.setBankName(null);
                existingInfo.setAccountHolderName(null);
                existingInfo.setPaypalEmail(null);
                break;
        }
        
        existingInfo.setIsActive(updatedInfo.getIsActive());
        existingInfo.setIsDefault(updatedInfo.getIsDefault());
        
        return paymentInfoRepository.save(existingInfo);
    }
    
    public void deletePaymentInfo(Long userId) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        if (paymentInfo != null) {
            paymentInfoRepository.delete(paymentInfo);
        }
    }
    
    public void deactivatePaymentInfo(Long userId) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        if (paymentInfo != null) {
            paymentInfo.setIsActive(false);
            paymentInfoRepository.save(paymentInfo);
        }
    }
    
    public void reactivatePaymentInfo(Long userId) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        if (paymentInfo != null) {
            paymentInfo.setIsActive(true);
            paymentInfoRepository.save(paymentInfo);
        }
    }
    
    public boolean hasValidPaymentMethod(Long userId) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        if (paymentInfo == null || !paymentInfo.getIsActive()) {
            return false;
        }
        
        // Check if payment method is expired (for cards)
        if (paymentInfo.getPaymentMethod() == PaymentMethod.STRIPE) {
            return !paymentInfo.isExpired();
        }
        
        return true;
    }
    
    public List<PaymentInfo> getAllPaymentInfo() {
        return paymentInfoRepository.findAll();
    }
    
    public List<PaymentInfo> getActivePaymentInfo() {
        return paymentInfoRepository.findByIsActiveTrue();
    }
    
    public List<PaymentInfo> getPaymentInfoByMethod(PaymentMethod method) {
        return paymentInfoRepository.findByPaymentMethod(method);
    }
    
    public List<PaymentInfo> getActivePaymentInfoByMethod(PaymentMethod method) {
        return paymentInfoRepository.findActiveByPaymentMethod(method);
    }
    
    public List<PaymentInfo> getExpiredCards() {
        LocalDateTime now = LocalDateTime.now();
        return paymentInfoRepository.findExpiredCards(now.getYear(), now.getMonthValue());
    }
    
    public List<PaymentInfo> getCardsExpiringThisMonth() {
        LocalDateTime now = LocalDateTime.now();
        return paymentInfoRepository.findCardsExpiringInMonth(now.getYear(), now.getMonthValue());
    }
    
    public long getActivePaymentCountByMethod(PaymentMethod method) {
        return paymentInfoRepository.countActiveByPaymentMethod(method);
    }
    
    // Placeholder methods for future payment processing integration
    public boolean processPayment(Long userId, double amount, String description) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        if (paymentInfo == null || !paymentInfo.getIsActive()) {
            throw new RuntimeException("No valid payment method found");
        }
        
        // TODO: Integrate with actual payment processors
        switch (paymentInfo.getPaymentMethod()) {
            case BANK_ACCOUNT:
                return processBankPayment(paymentInfo, amount, description);
            case PAYPAL:
                return processPayPalPayment(paymentInfo, amount, description);
            case STRIPE:
                return processStripePayment(paymentInfo, amount, description);
            default:
                throw new RuntimeException("Unsupported payment method");
        }
    }
    
    private boolean processBankPayment(PaymentInfo paymentInfo, double amount, String description) {
        // TODO: Integrate with bank payment API (ACH, etc.)
        // For now, return true as placeholder
        return true;
    }
    
    private boolean processPayPalPayment(PaymentInfo paymentInfo, double amount, String description) {
        // TODO: Integrate with PayPal API
        // For now, return true as placeholder
        return true;
    }
    
    private boolean processStripePayment(PaymentInfo paymentInfo, double amount, String description) {
        // TODO: Integrate with Stripe API
        // For now, return true as placeholder
        return true;
    }
    
    public PaymentInfo createOrUpdateBankAccount(Long userId, String accountNumber, String routingNumber, 
                                                String bankName, String accountHolderName) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        
        if (paymentInfo == null) {
            paymentInfo = createPaymentInfo(userId, PaymentMethod.BANK_ACCOUNT);
        }
        
        paymentInfo.setPaymentMethod(PaymentMethod.BANK_ACCOUNT);
        paymentInfo.setBankAccountNumber(accountNumber);
        paymentInfo.setBankRoutingNumber(routingNumber);
        paymentInfo.setBankName(bankName);
        paymentInfo.setAccountHolderName(accountHolderName);
        paymentInfo.setIsActive(true);
        
        return paymentInfoRepository.save(paymentInfo);
    }
    
    public PaymentInfo createOrUpdatePayPal(Long userId, String paypalEmail) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        
        if (paymentInfo == null) {
            paymentInfo = createPaymentInfo(userId, PaymentMethod.PAYPAL);
        }
        
        paymentInfo.setPaymentMethod(PaymentMethod.PAYPAL);
        paymentInfo.setPaypalEmail(paypalEmail);
        paymentInfo.setIsActive(true);
        
        return paymentInfoRepository.save(paymentInfo);
    }
    
    public PaymentInfo createOrUpdateStripe(Long userId, String customerId, String paymentMethodId, 
                                          String lastFour, String brand, int expMonth, int expYear) {
        PaymentInfo paymentInfo = getPaymentInfoByUserId(userId);
        
        if (paymentInfo == null) {
            paymentInfo = createPaymentInfo(userId, PaymentMethod.STRIPE);
        }
        
        paymentInfo.setPaymentMethod(PaymentMethod.STRIPE);
        paymentInfo.setStripeCustomerId(customerId);
        paymentInfo.setStripePaymentMethodId(paymentMethodId);
        paymentInfo.setCardLastFour(lastFour);
        paymentInfo.setCardBrand(brand);
        paymentInfo.setCardExpMonth(expMonth);
        paymentInfo.setCardExpYear(expYear);
        paymentInfo.setIsActive(true);
        
        return paymentInfoRepository.save(paymentInfo);
    }
}
