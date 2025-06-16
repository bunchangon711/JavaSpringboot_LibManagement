package com.javaproject.lib_management.controller;

import com.javaproject.lib_management.model.Reservation;
import com.javaproject.lib_management.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    
    private final ReservationService reservationService;
    
    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long bookId = request.get("bookId");
        
        Reservation reservation = reservationService.createReservation(userId, bookId);
        return new ResponseEntity<>(reservation, HttpStatus.CREATED);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getUserReservations(@PathVariable Long userId) {
        List<Reservation> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }
    
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }
    
    @DeleteMapping("/{reservationId}/user/{userId}")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long reservationId, 
            @PathVariable Long userId) {
        reservationService.cancelReservation(reservationId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{reservationId}/fulfill")
    public ResponseEntity<Void> fulfillReservation(@PathVariable Long reservationId) {
        reservationService.fulfillReservation(reservationId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/expired")
    public ResponseEntity<List<Reservation>> getExpiredReservations() {
        List<Reservation> expiredReservations = reservationService.getExpiredReservations();
        return ResponseEntity.ok(expiredReservations);
    }
    
    @PostMapping("/process-expired")
    public ResponseEntity<Void> processExpiredReservations() {
        reservationService.processExpiredReservations();
        return ResponseEntity.ok().build();
    }
}
