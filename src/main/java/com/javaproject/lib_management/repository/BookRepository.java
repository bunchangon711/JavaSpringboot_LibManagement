package com.javaproject.lib_management.repository;

import com.javaproject.lib_management.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    List<Book> findByCategoryIgnoreCase(String category);
    
    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    List<Book> findAvailableBooks();
    
    @Query(value = "SELECT b.* FROM books b JOIN borrowings br ON b.id = br.book_id GROUP BY b.id ORDER BY COUNT(br.id) DESC LIMIT 10", nativeQuery = true)
    List<Book> findMostBorrowedBooks();
}
