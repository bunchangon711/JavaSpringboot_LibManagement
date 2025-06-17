package com.javaproject.lib_management.controller;

import com.javaproject.lib_management.model.PaymentInfo;
import com.javaproject.lib_management.model.PaymentMethod;
import com.javaproject.lib_management.service.PaymentInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment-info")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentInfoController {
    
    @Autowired
    private PaymentInfoService paymentInfoService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<PaymentInfo> getUserPaymentInfo(@PathVariable Long userId) {
        PaymentInfo paymentInfo = paymentInfoService.getPaymentInfoByUserId(userId);
        if (paymentInfo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(paymentInfo);
    }
    
    @PostMapping("/create")
    public ResponseEntity<PaymentInfo> createPaymentInfo(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            PaymentMethod method = PaymentMethod.valueOf(request.get("paymentMethod").toString());
            
            PaymentInfo paymentInfo = paymentInfoService.createPaymentInfo(userId, method);
            return ResponseEntity.ok(paymentInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/update/{userId}")
    public ResponseEntity<PaymentInfo> updatePaymentInfo(@PathVariable Long userId, 
                                                        @RequestBody PaymentInfo updatedInfo) {
        try {
            PaymentInfo paymentInfo = paymentInfoService.updatePaymentInfo(userId, updatedInfo);
            return ResponseEntity.ok(paymentInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/bank-account")
    public ResponseEntity<PaymentInfo> createOrUpdateBankAccount(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String accountNumber = request.get("accountNumber").toString();
            String routingNumber = request.get("routingNumber").toString();
            String bankName = request.get("bankName").toString();
            String accountHolderName = request.get("accountHolderName").toString();
            
            PaymentInfo paymentInfo = paymentInfoService.createOrUpdateBankAccount(
                userId, accountNumber, routingNumber, bankName, accountHolderName);
            return ResponseEntity.ok(paymentInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/paypal")
    public ResponseEntity<PaymentInfo> createOrUpdatePayPal(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String paypalEmail = request.get("paypalEmail").toString();
            
            PaymentInfo paymentInfo = paymentInfoService.createOrUpdatePayPal(userId, paypalEmail);
            return ResponseEntity.ok(paymentInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/stripe")
    public ResponseEntity<PaymentInfo> createOrUpdateStripe(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String customerId = request.get("customerId").toString();
            String paymentMethodId = request.get("paymentMethodId").toString();
            String lastFour = request.get("lastFour").toString();
            String brand = request.get("brand").toString();
            int expMonth = Integer.parseInt(request.get("expMonth").toString());
            int expYear = Integer.parseInt(request.get("expYear").toString());
            
            PaymentInfo paymentInfo = paymentInfoService.createOrUpdateStripe(
                userId, customerId, paymentMethodId, lastFour, brand, expMonth, expYear);
            return ResponseEntity.ok(paymentInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<String> deletePaymentInfo(@PathVariable Long userId) {
        try {
            paymentInfoService.deletePaymentInfo(userId);
            return ResponseEntity.ok("Payment information deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete payment information: " + e.getMessage());
        }
    }
    
    @PutMapping("/deactivate/{userId}")
    public ResponseEntity<String> deactivatePaymentInfo(@PathVariable Long userId) {
        try {
            paymentInfoService.deactivatePaymentInfo(userId);
            return ResponseEntity.ok("Payment information deactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to deactivate payment information: " + e.getMessage());
        }
    }
    
    @PutMapping("/reactivate/{userId}")
    public ResponseEntity<String> reactivatePaymentInfo(@PathVariable Long userId) {
        try {
            paymentInfoService.reactivatePaymentInfo(userId);
            return ResponseEntity.ok("Payment information reactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reactivate payment information: " + e.getMessage());
        }
    }
    
    @GetMapping("/validate/{userId}")
    public ResponseEntity<Map<String, Boolean>> validatePaymentMethod(@PathVariable Long userId) {
        boolean isValid = paymentInfoService.hasValidPaymentMethod(userId);
        return ResponseEntity.ok(Map.of("isValid", isValid));
    }
    
    @GetMapping("/methods")
    public ResponseEntity<PaymentMethod[]> getPaymentMethods() {
        return ResponseEntity.ok(PaymentMethod.values());
    }
    
    @GetMapping("/method-info/{method}")
    public ResponseEntity<Map<String, Object>> getPaymentMethodInfo(@PathVariable String method) {
        try {
            PaymentMethod paymentMethod = PaymentMethod.valueOf(method.toUpperCase());
            Map<String, Object> info = Map.of(
                "name", paymentMethod.name(),
                "displayName", paymentMethod.getDisplayName(),
                "description", getMethodDescription(paymentMethod)
            );
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/process-payment")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            double amount = Double.parseDouble(request.get("amount").toString());
            String description = request.get("description").toString();
            
            boolean success = paymentInfoService.processPayment(userId, amount, description);
            
            return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Payment processed successfully" : "Payment failed"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Payment processing error: " + e.getMessage()
            ));
        }
    }
    
    // Admin endpoints
    @GetMapping("/all")
    public ResponseEntity<List<PaymentInfo>> getAllPaymentInfo() {
        List<PaymentInfo> paymentInfoList = paymentInfoService.getAllPaymentInfo();
        return ResponseEntity.ok(paymentInfoList);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<PaymentInfo>> getActivePaymentInfo() {
        List<PaymentInfo> paymentInfoList = paymentInfoService.getActivePaymentInfo();
        return ResponseEntity.ok(paymentInfoList);
    }
    
    @GetMapping("/expired-cards")
    public ResponseEntity<List<PaymentInfo>> getExpiredCards() {
        List<PaymentInfo> expiredCards = paymentInfoService.getExpiredCards();
        return ResponseEntity.ok(expiredCards);
    }
    
    @GetMapping("/expiring-cards")
    public ResponseEntity<List<PaymentInfo>> getCardsExpiringThisMonth() {
        List<PaymentInfo> expiringCards = paymentInfoService.getCardsExpiringThisMonth();
        return ResponseEntity.ok(expiringCards);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {
        Map<String, Object> stats = Map.of(
            "bankAccounts", paymentInfoService.getActivePaymentCountByMethod(PaymentMethod.BANK_ACCOUNT),
            "paypal", paymentInfoService.getActivePaymentCountByMethod(PaymentMethod.PAYPAL),
            "stripe", paymentInfoService.getActivePaymentCountByMethod(PaymentMethod.STRIPE)
        );
        return ResponseEntity.ok(stats);
    }
    
    private String getMethodDescription(PaymentMethod method) {
        switch (method) {
            case BANK_ACCOUNT:
                return "Direct bank account transfer (ACH)";
            case PAYPAL:
                return "PayPal account payment";
            case STRIPE:
                return "Credit or debit card via Stripe";
            default:
                return "";
        }
    }
}
