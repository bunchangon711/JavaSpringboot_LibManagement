package com.javaproject.lib_management.controller;

import com.javaproject.lib_management.model.Borrowing;
import com.javaproject.lib_management.service.BorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowings")
@RequiredArgsConstructor
public class BorrowingController {
    private final BorrowingService borrowingService;

    @GetMapping
    public ResponseEntity<List<Borrowing>> getAllBorrowings() {
        return ResponseEntity.ok(borrowingService.getAllBorrowings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Borrowing> getBorrowingById(@PathVariable Long id) {
        return ResponseEntity.ok(borrowingService.getBorrowingById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Borrowing>> getBorrowingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowingService.getBorrowingsByUserId(userId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Borrowing>> getOverdueBooks() {
        return ResponseEntity.ok(borrowingService.getOverdueBooks());
    }

    @PostMapping
    public ResponseEntity<Borrowing> borrowBook(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long bookId = request.get("bookId");
        
        if (userId == null || bookId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return new ResponseEntity<>(borrowingService.borrowBook(userId, bookId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Borrowing> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(borrowingService.returnBook(id));
    }

    @GetMapping("/{id}/fine")
    public ResponseEntity<Map<String, Double>> calculateFine(@PathVariable Long id) {
        double fine = borrowingService.calculateFine(id);
        return ResponseEntity.ok(Map.of("fine", fine));
    }
}
