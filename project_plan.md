System Design Elements:

Layered Architecture: Controller → Service → Repository → Database
Database Design: Multiple related tables (Users, Books, Borrowings, Fines)
RESTful API: Clean endpoints like /api/books, /api/users/{id}/borrow
Configuration Management: Properties files for database settings

OOP Concepts Demonstrated:

Inheritance: User → (Student, Librarian) with different permissions
Polymorphism: Different user types have different borrowing limits
Encapsulation: Private fields with getters/setters, validation logic
Abstraction: Interfaces like BookRepository, UserService
Composition: Library contains Books, Users, and Borrowings

# Digital Library Management System - Project Plan

## Overview
This document outlines the implementation plan for a Digital Library Management System using Spring Boot. The system will demonstrate OOP principles, system design knowledge, and RESTful API development skills.

## Core Features
1. **Book Inventory Management**
   - Add, search, update, and delete books
   - Track available copies

2. **User Management**
   - User registration and authentication
   - User roles (basic users and administrators)

3. **Borrowing System**
   - Check out books with due dates
   - Return books
   - Calculate fines for overdue books

4. **Reporting**
   - Most borrowed books
   - Overdue books
   - User activity

5. **Reservation System**
   - Place holds on books
   - Manage reservations
   - Notify users when books are available

6. **Renewal System**
   - Renew borrowed books
   - Limit renewals to prevent abuse
   - Update due dates accordingly

7. **Library Card Subscription System**
   - Manage library card subscriptions
   - Different tiers with varying benefits
   - Integration with the borrowing system

## Implementation Steps

### Step 1: Project Setup
- Create a Spring Boot project with required dependencies
- Configure the application properties
- Set up the database connection (using H2 for development)

### Step 2: Data Model Creation
- Define entity classes:
  - Book
  - User
  - Borrowing
  - Reservation
  - Subscription
- Create repositories for database operations

### Step 3: Business Logic Implementation
- Develop service layer for:
  - Book management
  - User management
  - Borrowing operations
  - Fine calculation
  - Reservation handling
  - Renewal processing
  - Subscription management

### Step 4: API Development
- Create RESTful controllers:
  - BookController
  - UserController
  - AuthController
  - BorrowingController
  - ReportController
  - ReservationController
  - SubscriptionController

### Step 5: Security Implementation
- Configure Spring Security
- Implement user authentication and authorization
- Secure API endpoints

### Step 6: Testing
- Write unit tests for service layer
- Test API endpoints using Postman or similar tools
- Verify business rules and validation

### Step 7: Documentation and Finalization
- Document API endpoints
- Add README with setup instructions
- Review code quality and make improvements

## Technical Decisions

### Architecture
- **3-Tier Architecture**:
  - Presentation Layer (Controllers)
  - Business Layer (Services)
  - Data Access Layer (Repositories)

### Design Patterns
- **Repository Pattern**: For data access
- **Service Layer Pattern**: For business logic
- **DTO Pattern**: For data transfer

### OOP Principles Demonstrated
- **Encapsulation**: Through proper use of private fields and public methods
- **Inheritance**: Through entity relationships
- **Polymorphism**: In service implementations
- **Abstraction**: Using interfaces for repositories and services

### Additional Features (If Time Permits)
- Email notifications for overdue books
- Book reservations
- Advanced reporting features
- Admin dashboard

## Testing Strategy
- Unit tests for services
- Integration tests for APIs
- End-to-end testing of critical workflows

## Learning Outcomes
- Spring Boot application development
- Working with JPA/Hibernate
- RESTful API design
- Security implementation
- Software architecture principles

## ✅ COMPLETED BACKEND FEATURES

### 1. Book Inventory Management (COMPLETED)
**Status: Fully Implemented**

**Data Model:**
- ✅ `Book` entity with all required fields (title, author, ISBN, publication date, publisher, category, total copies, available copies)
- ✅ Proper validation annotations (@NotBlank, @NotNull, unique constraints)
- ✅ Auto-generated IDs and proper table mapping

**Repository Layer:**
- ✅ `BookRepository` extending JpaRepository
- ✅ Custom query methods: findByIsbn, findByTitleContainingIgnoreCase, findByAuthorContainingIgnoreCase
- ✅ Native query for finding most borrowed books
- ✅ Query for finding available books

**Service Layer:**
- ✅ `BookService` with full CRUD operations
- ✅ Search functionality by title, author, category
- ✅ Business logic for tracking available copies
- ✅ Transactional operations for data consistency

**REST API Controllers:**
- ✅ `BookController` with comprehensive endpoints:
  - GET /api/books (get all books)
  - GET /api/books/{id} (get book by ID)
  - GET /api/books/isbn/{isbn} (get book by ISBN)
  - GET /api/books/public/search (search with filters)
  - GET /api/books/available (get available books)
  - POST /api/books (add new book)
  - PUT /api/books/{id} (update book)
  - DELETE /api/books/{id} (delete book)
  - GET /api/books/most-borrowed (reporting)

### 2. User Registration and Authentication (COMPLETED)
**Status: Fully Implemented**

**Data Model:**
- ✅ `User` entity with validation (name, email, password, role, registration date)
- ✅ Email uniqueness constraint
- ✅ Default role assignment ("USER")
- ✅ BCrypt password encoding

**Repository Layer:**
- ✅ `UserRepository` with findByEmail and existsByEmail methods
- ✅ Proper user lookup for authentication

**Service Layer:**
- ✅ `UserService` with full user management
- ✅ User registration with password encoding
- ✅ User authentication with credential validation
- ✅ CRUD operations for user management
- ✅ Secure password handling (never return passwords in responses)

**REST API Controllers:**
- ✅ `AuthController` with authentication endpoints:
  - POST /api/auth/register (user registration)
  - POST /api/auth/login (user authentication)
- ✅ `UserController` with user management endpoints:
  - GET /api/users (get all users)
  - GET /api/users/{id} (get user by ID)
  - PUT /api/users/{id} (update user)
  - DELETE /api/users/{id} (delete user)

**Security Configuration:**
- ✅ Spring Security with BCrypt password encoder
- ✅ CORS configuration for frontend integration
- ✅ Public endpoints for auth and book search
- ✅ Protected endpoints for user management

### 3. Book Borrowing/Returning System (COMPLETED)
**Status: Fully Implemented**

**Data Model:**
- ✅ `Borrowing` entity with proper relationships to User and Book
- ✅ Automatic date handling (borrow date, due date, return date)
- ✅ Fine calculation logic
- ✅ Boolean flag for return status

**Repository Layer:**
- ✅ `BorrowingRepository` with custom queries:
  - findByUserAndIsReturnedFalse (active loans per user)
  - findOverdueBooks (overdue borrowings)
  - findByUserId (user's borrowing history)
  - countActiveLoans (borrowing limit enforcement)

**Service Layer:**
- ✅ `BorrowingService` with complete business logic:
  - Book borrowing with availability checks
  - Maximum borrowing limit enforcement (5 books)
  - Automatic due date calculation (14 days)
  - Book return processing
  - Available copy management

**REST API Controllers:**
- ✅ `BorrowingController` with all necessary endpoints:
  - GET /api/borrowings (get all borrowings)
  - GET /api/borrowings/{id} (get specific borrowing)
  - GET /api/borrowings/user/{userId} (user's borrowings)
  - GET /api/borrowings/overdue (overdue books)
  - POST /api/borrowings (borrow a book)
  - PUT /api/borrowings/{id}/return (return a book)
  - GET /api/borrowings/{id}/fine (calculate fine)

### 4. Fine Calculation for Overdue Books (COMPLETED)
**Status: Fully Implemented**

**Business Logic:**
- ✅ Automatic fine calculation based on overdue days
- ✅ Configurable daily fine rate ($0.50 per day)
- ✅ Fine calculation both at entity level and service level
- ✅ Integration with return process

**Implementation:**
- ✅ Fine calculation method in `Borrowing` entity
- ✅ Service-level fine calculation in `BorrowingService`
- ✅ REST endpoint for fine calculation
- ✅ Automatic fine update on book return

### 5. Simple Reporting (COMPLETED)
**Status: Fully Implemented**

**Reporting Features:**
- ✅ Most borrowed books (native SQL query with joins)
- ✅ Overdue books list with borrower information
- ✅ User borrowing activity (borrowings by user ID)
- ✅ Active loans count per user

**REST API Controllers:**
- ✅ `ReportController` with reporting endpoints:
  - GET /api/reports/most-borrowed (most popular books)
  - GET /api/reports/overdue (overdue books report)
- ✅ Additional reporting via BorrowingController endpoints

### 6. Database Configuration and Setup (COMPLETED)
**Status: Fully Implemented**

**Database Setup:**
- ✅ MySQL database configuration
- ✅ JPA/Hibernate with automatic DDL updates
- ✅ Proper entity relationships and foreign keys
- ✅ Connection pooling and transaction management

**Configuration:**
- ✅ application.properties with database settings
- ✅ Environment-specific configuration capability
- ✅ Security configuration for development

### 7. Book Reservation System (COMPLETED)
**Status: Fully Implemented**

**Data Model:**
- ✅ `Reservation` entity with queue management
- ✅ Queue position tracking and automatic updates
- ✅ Reservation status management (WAITING, AVAILABLE, FULFILLED, EXPIRED, CANCELLED)
- ✅ Expiry date handling for reservation validity

**Repository Layer:**
- ✅ `ReservationRepository` with comprehensive query methods
- ✅ Queue position management and automatic updates
- ✅ Expired reservation detection and cleanup

**Service Layer:**
- ✅ `ReservationService` with complete business logic:
  - Reservation creation with availability checks
  - Maximum reservation limit enforcement (5 reservations)
  - Queue position management
  - Automatic queue updates on cancellations
  - Expired reservation processing

**REST API Controllers:**
- ✅ `ReservationController` with reservation endpoints:
  - POST /api/reservations (create reservation)
  - GET /api/reservations/user/{userId} (user's reservations)
  - DELETE /api/reservations/{id}/user/{userId} (cancel reservation)
  - PUT /api/reservations/{id}/fulfill (fulfill reservation)
  - GET /api/reservations/expired (get expired reservations)

### 8. Book Renewal System (COMPLETED)
**Status: Fully Implemented**

**Enhanced Borrowing Model:**
- ✅ Renewal count tracking
- ✅ Maximum renewals limit (default: 2 renewals)
- ✅ Last renewal date tracking
- ✅ Renewal eligibility validation

**Service Layer Enhancements:**
- ✅ `BorrowingService` enhanced with renewal functionality:
  - Renewal eligibility checking
  - Renewal limit enforcement
  - Due date extension (14 days per renewal)
  - Integration with reservation system

**REST API Enhancements:**
- ✅ `BorrowingController` with renewal endpoints:
  - PUT /api/borrowings/{id}/renew/user/{userId} (renew borrowing)
  - GET /api/borrowings/{id}/can-renew/user/{userId} (check renewal eligibility)

### 9. Frontend Integration (COMPLETED)
**Status: Fully Implemented**

**User Interface Updates:**
- ✅ "Place Hold" button for unavailable books
- ✅ "Check Out" terminology instead of "Borrow Book"
- ✅ Renewal buttons in user borrowing history
- ✅ Reservation management in user profile
- ✅ Queue position display for active reservations

**Profile Page Enhancements:**
- ✅ Three-tab interface: Profile, Borrowings, Reservations
- ✅ Renewal functionality with proper error handling
- ✅ Reservation cancellation capability
- ✅ Status indicators for borrowings and reservations

**Library-Specific UI:**
- ✅ Updated terminology throughout the interface
- ✅ Library card status display
- ✅ Collection size vs inventory language
- ✅ Catalog vs books terminology

### 10. Library Card Subscription System (COMPLETED)
**Status: Fully Implemented**

**Data Model:**
- ✅ `Subscription` entity with subscription tier management
- ✅ `SubscriptionTier` enum (FREE, MONTHLY, ANNUAL) with pricing and limits
- ✅ `BookType` enum (PHYSICAL, DIGITAL) for book classification
- ✅ Track usage counts for physical and digital books
- ✅ Automatic expiry and renewal handling

**Repository Layer:**
- ✅ `SubscriptionRepository` with comprehensive query methods
- ✅ Find subscriptions by user, tier, active status
- ✅ Expired subscription detection and auto-renewal queries

**Service Layer:**
- ✅ `SubscriptionService` with complete business logic:
  - Subscription creation and management
  - Tier upgrade/downgrade functionality
  - Usage limit enforcement (physical vs digital books)
  - Automatic expired subscription processing
  - Borrow count tracking and validation

**REST API Controllers:**
- ✅ `SubscriptionController` with subscription endpoints:
  - GET /api/subscriptions/user/{userId} (get user subscription)
  - POST /api/subscriptions/create (create subscription)
  - PUT /api/subscriptions/upgrade (upgrade subscription tier)
  - PUT /api/subscriptions/renew/{userId} (renew subscription)
  - GET /api/subscriptions/tiers (get available tiers)
  - GET /api/subscriptions/tier-info/{tier} (get tier details)

**Integration with Borrowing System:**
- ✅ Updated `BorrowingService` to check subscription eligibility
- ✅ Physical vs digital book borrowing limits enforced
- ✅ Automatic usage count updates on borrow/return
- ✅ Enhanced `Book` entity with bookType field

**Subscription Tiers:**
- ✅ **FREE**: 0 physical books, 10 digital books, $0/month
- ✅ **MONTHLY**: 10 physical books, unlimited digital, $9.99/month
- ✅ **ANNUAL**: 20 physical books, unlimited digital, $99.99/year

**Frontend Integration:**
- ✅ New subscription management page (/my-subscription)
- ✅ Three-tab interface: Overview, Borrowings, Upgrade Plan
- ✅ Visual subscription status and usage tracking
- ✅ Tier comparison and upgrade functionality
- ✅ Updated navbar to replace "My Account" with "My Subscription"
- ✅ Enhanced book display with digital/physical indicators
- ✅ Updated book form to include book type selection

## 🔧 TECHNICAL IMPLEMENTATION HIGHLIGHTS

### Backend Architecture Achievements:
- ✅ **Layered Architecture**: Clean separation of concerns (Controller → Service → Repository)
- ✅ **RESTful API Design**: Consistent endpoints following REST principles
- ✅ **Data Validation**: Comprehensive validation using Bean Validation annotations
- ✅ **Error Handling**: Proper exception handling with meaningful error messages
- ✅ **Security**: BCrypt password encoding and Spring Security integration
- ✅ **Database Design**: Normalized schema with proper relationships
- ✅ **Transaction Management**: @Transactional annotations for data consistency
- ✅ **Business Logic**: Complex borrowing rules and fine calculations implemented
- ✅ **Reservation and Renewal**: Complete reservation and renewal functionality
- ✅ **Subscription System**: Fully functional library card subscription system

### OOP Principles Demonstrated:
- ✅ **Encapsulation**: Private fields with public getters/setters, service layer abstraction
- ✅ **Abstraction**: Repository interfaces, service layer abstractions
- ✅ **Composition**: Entities composed of other entities (Borrowing contains User and Book)
- ✅ **Single Responsibility**: Each class and method has a clear, single purpose

### Frontend Integration:
- ✅ **CORS Configuration**: Proper cross-origin setup for React frontend
- ✅ **JSON API**: All endpoints return/accept JSON for easy frontend consumption
- ✅ **Authentication Flow**: Login/register endpoints ready for frontend integration
- ✅ **Role-based Access**: Foundation for role-based UI components

✅ Core Components Created:
1.	Navigation System (Navbar.tsx)
o	Role-based navigation menu
o	User info display with welcome message
o	Responsive design for mobile devices
o	Logout functionality
2.	Homepage (HomePage.tsx)
o	Dashboard with statistics (total books, available books, borrowings, overdue books)
o	Quick action cards for easy navigation
o	Recent books display
o	Role-based content (admin/librarian see additional stats)
3.	Book Management (BooksPage.tsx)
o	Full CRUD operations for books (Add, Edit, Delete, Search)
o	Search by title, author, or category
o	Book borrowing functionality
o	Role-based access (only admins/librarians can manage books)
o	Responsive grid layout
4.	User Profile Management (ProfilePage.tsx)
o	Profile information display and editing
o	Password change functionality
o	User's borrowing history with status indicators
o	Book return functionality
o	Tabbed interface for profile vs borrowings
5.	User Management (UsersPage.tsx) - Admin/Librarian Only
o	View all users in the system
o	Add new users with role assignment
o	Edit existing users
o	Delete users (except self)
o	Role-based permissions (only admins can assign admin roles)
6.	Reservation Management (ReservationsPage.tsx)
o	View and manage book reservations
o	Place new reservations
o	Cancel existing reservations
o	Role-based access (admins/librarians manage all reservations, users manage their own)
o	Responsive design
7.	Renewal Management (RenewalsPage.tsx)
o	View and manage book renewals
o	Renew borrowed books
o	Role-based access (admins/librarians manage renewals, users renew their own borrowings)
o	Responsive design
8.	Subscription Management (SubscriptionPage.tsx)
o	View current subscription status
o	Upgrade or downgrade subscription tier
o	Manage payment information
o	Role-based access (all users can manage their subscription)
o	Responsive design
✅ Key Features Implemented:
1.	Authentication Integration
o	Fixed login to use email instead of username
o	Role-based access control throughout the UI
o	Protected routes with proper redirects
2.	User Experience
o	Modern, responsive design
o	Loading states and error handling
o	Intuitive navigation and breadcrumbs
o	Mobile-friendly responsive layout
3.	Role-Based Access
o	Regular Users: Can browse books, borrow books, manage their profile, view their borrowings
o	Librarians: All user features + manage books, view all users, access reports
o	Admins: All features + full user management including role changes
4.	Data Integration
o	Full integration with your backend APIs
o	Real-time data updates after operations
o	Proper error handling with user feedback
5.	Reservation and Renewal Integration
o	Seamless integration of reservation and renewal features
o	Proper handling of queue positions and renewal limits
o	User-friendly interfaces for managing reservations and renewals
6.	Subscription Integration
o	Library card subscription system fully integrated
o	Subscription management UI
o	Real-time usage tracking and limit enforcement
o	Tier-based borrowing limits and benefits

✅ Navigation Structure:
•	Homepage (/) - Dashboard with overview
•	Books (/books) - Browse and manage books
•	My Borrowings (/my-borrowings) - View personal borrowing history
•	Profile (/profile) - Manage user profile
•	Manage Users (users) - Admin/Librarian only
•	All Borrowings (/all-borrowings) - Admin/Librarian only (placeholder)
•	Reports (/reports) - Admin/Librarian only (placeholder)
•	Reservations (/reservations) - Manage book reservations
•	Renewals (/renewals) - Manage book renewals
•	My Subscription (/my-subscription) - Manage library card subscription
🎨 Design Features:
•	Clean, modern UI with consistent styling
•	Color-coded elements (book availability, user roles, borrowing status)
•	Responsive design that works on desktop, tablet, and mobile
•	Loading states and proper error messaging
•	Intuitive forms with validation
•	Card-based layouts for better content organization
🔧 Technical Implementation:
•	TypeScript for type safety
•	React Hooks for state management
•	CSS Grid and Flexbox for responsive layouts
•	Integration with your existing backend APIs
•	Proper error handling and user feedback
•	Role-based component rendering




Library Management System - Directory Structure
library-management-system/
├── README.md
├── pom.xml
├── .gitignore
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── library/
│   │   │           └── management/
│   │   │               ├── LibraryManagementApplication.java
│   │   │               │
│   │   │               ├── config/
│   │   │               │   ├── WebConfig.java
│   │   │               │   └── DatabaseConfig.java
│   │   │               │
│   │   │               ├── controller/
│   │   │               │   ├── BookController.java
│   │   │               │   ├── UserController.java
│   │   │               │   ├── BorrowingController.java
│   │   │               │   ├── ReservationController.java
│   │   │               │   └── WebController.java (for serving frontend)
│   │   │               │
│   │   │               ├── service/
│   │   │               │   ├── BookService.java
│   │   │               │   ├── UserService.java
│   │   │               │   ├── BorrowingService.java
│   │   │               │   ├── FineService.java
│   │   │               │   └── ReservationService.java
│   │   │               │
│   │   │               ├── repository/
│   │   │               │   ├── BookRepository.java
│   │   │               │   ├── UserRepository.java
│   │   │               │   ├── BorrowingRepository.java
│   │   │               │   ├── FineRepository.java
│   │   │               │   └── ReservationRepository.java
│   │   │               │
│   │   │               ├── model/
│   │   │               │   ├── Book.java
│   │   │               │   ├── User.java
│   │   │               │   ├── Student.java
│   │   │               │   ├── Librarian.java
│   │   │               │   ├── Borrowing.java
│   │   │               │   ├── Fine.java
│   │   │               │   └── Reservation.java
│   │   │               │
│   │   │               ├── dto/
│   │   │               │   ├── BookDTO.java
│   │   │               │   ├── UserDTO.java
│   │   │               │   ├── BorrowingDTO.java
│   │   │               │   ├── ReservationDTO.java
│   │   │               │   └── LoginRequest.java
│   │   │               │
│   │   │               ├── exception/
│   │   │               │   ├── BookNotFoundException.java
│   │   │               │   ├── UserNotFoundException.java
│   │   │               │   └── GlobalExceptionHandler.java
│   │   │               │
│   │   │               └── util/
│   │   │                   ├── DateUtil.java
│   │   │                   └── ValidationUtil.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── data.sql (sample data)
│   │       ├── schema.sql (if needed)
│   │       │
│   │       ├── static/
│   │       │   ├── css/
│   │       │   │   ├── style.css
│   │       │   │   └── bootstrap.min.css
│   │       │   │
│   │       │   ├── js/
│   │       │   │   ├── app.js
│   │       │   │   ├── books.js
│   │       │   │   ├── users.js
│   │       │   │   ├── borrowings.js
│   │       │   │   └── jquery.min.js
│   │       │   │
│   │       │   └── images/
│   │       │       └── logo.png
│   │       │
│   │       └── templates/ (if using Thymeleaf)
│   │           ├── index.html
│   │           ├── books.html
│   │           ├── users.html
│   │           ├── borrowings.html
│   │           └── login.html
│   │
│   └── test/
│       └── java/
│           └── com/
│               └── library/
│                   └── management/
│                       ├── LibraryManagementApplicationTests.java
│                       ├── controller/
│                       │   ├── BookControllerTest.java
│                       │   └── UserControllerTest.java
│                       ├── service/
│                       │   ├── BookServiceTest.java
│                       │   └── UserServiceTest.java
│                       └── repository/
│                           ├── BookRepositoryTest.java
│                           └── UserRepositoryTest.java
│
├── frontend/ (Alternative: Separate React/Angular project)
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   └── src/
│       ├── components/
│       │   ├── BookList.js
│       │   ├── UserManagement.js
│       │   └── BorrowingHistory.js
│       ├── services/
│       │   └── api.js
│       ├── App.js
│       └── index.js
│
└── docs/
    ├── API_Documentation.md
    ├── Database_Schema.md
    └── Setup_Instructions.md
Key Points About This Structure:
Backend (Spring Boot)

Standard Maven structure with src/main/java and src/test/java
Layered architecture: Controller → Service → Repository → Model
DTOs for clean API responses (separates internal models from API contracts)
Exception handling centralized in one place
Configuration separated by environment

Separate Frontend Project

Create separate React/Vue/Angular project in frontend/ directory
Communicates with backend via REST API
More complex but more professional

Why This Structure Works

Separation of Concerns: Each package has a clear responsibility
Scalable: Easy to add new features without restructuring
Professional: Follows enterprise Java conventions
Testable: Clear separation makes unit testing straightforward
Maintainable: Easy to find and modify specific functionality



Next Steps to Further Improve:
✅ Implement actual reservation functionality in the backend - COMPLETED
✅ Add renewal options for checked-out books - COMPLETED
Create library hours and contact information section
Add digital resources section (eBooks, databases)
Implement reading lists and recommendations
Add late fees and fine management
Create librarian circulation desk interface
Add notification system for reservations