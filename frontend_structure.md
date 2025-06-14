# Library Management System - Frontend Structure

## Directory Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── books/
│   │   │   ├── BookList.tsx
│   │   │   ├── BookDetails.tsx
│   │   │   └── BookForm.tsx
│   │   ├── users/
│   │   │   ├── UserList.tsx
│   │   │   └── UserProfile.tsx
│   │   └── borrowing/
│   │       ├── BorrowingList.tsx
│   │       └── BorrowingForm.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── bookService.ts
│   │   ├── userService.ts
│   │   └── borrowingService.ts
│   ├── types/
│   │   ├── Book.ts
│   │   ├── User.ts
│   │   └── Borrowing.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── styles/
│       ├── global.css
│       └── variables.css
├── package.json
└── tsconfig.json
```

## Authentication Implementation Plan

1. **Initial Setup**:
   - Create auth components (Login, Register)
   - Set up AuthContext for global auth state
   - Create auth service for API calls

2. **Key Authentication Features**:
   - User registration
   - User login/logout
   - Token management (JWT)
   - Protected routes
   - Role-based access control

3. **Authentication Flow**:
   - User enters credentials
   - Frontend sends auth request to API
   - API returns JWT token
   - Token stored in localStorage/sessionStorage
   - Auth state updated in context
   - Protected routes check auth status

4. **Dependencies to Add**:
   - axios: For API requests
   - react-router-dom: For routing
   - formik & yup: For form handling and validation
   - @mui/material or react-bootstrap: For UI components
