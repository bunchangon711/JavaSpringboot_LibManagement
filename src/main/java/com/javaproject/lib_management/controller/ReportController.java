package com.javaproject.lib_management.controller;

import com.javaproject.lib_management.model.Book;
import com.javaproject.lib_management.model.Borrowing;
import com.javaproject.lib_management.service.BookService;
import com.javaproject.lib_management.service.BorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final BookService bookService;
    private final BorrowingService borrowingService;

    @GetMapping("/most-borrowed")
    public ResponseEntity<List<Book>> getMostBorrowedBooks() {
        return ResponseEntity.ok(bookService.getMostBorrowedBooks());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Borrowing>> getOverdueBooks() {
        return ResponseEntity.ok(borrowingService.getOverdueBooks());
    }
}
