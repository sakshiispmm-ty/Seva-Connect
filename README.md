# SevaConnect — NGO Donation & Resource Management System

> **"Connecting NGOs, Donors & Communities"**

---

## 1. Project Description
**SevaConnect** is a full-stack NGO Donation & Resource Management platform designed to bridge the trust gap between philanthropic donors, charitable non-governmental organizations (NGOs), and recipient communities. The platform provides a secure, role-based ecosystem where donors can view causes, manage contributions, and audit impacts, while NGO administrators can supervise operations, oversee registered members, and ensure resource allocation integrity.

---

## 2. Version 1.1 Scope
**Version 1.1** is the **Foundation + Authentication stage**.

### Included in V1.1:
- Clean modular full-stack architecture (React + Vite frontend, Express REST API backend, MySQL database).
- Official uploaded SevaConnect logo integrated without alteration across all screens.
- Strict adherence to the official SevaConnect brand color palette.
- Multi-user authentication & registration with zero artificial user limits.
- Role-based authorization (`Donor` and `Admin`).
- JWT (JSON Web Token) authentication with stateless session verification and HTTP Bearer tokens.
- Password encryption using salted `bcrypt` hashes.
- Responsive public Landing Page with Hero, About, How It Works, and Feature Roadmap cards.
- Dedicated Donor Dashboard with real personalized welcome, profile summary, and preview cards.
- Dedicated Admin Dashboard with real-time MySQL database user counts, donor statistics, system health, and registered user table.
- User Profile management with validation (update Name and Phone; locked Email and Role).
- Client-side and server-side route guards (unauthorized requests return 401/403).
- Responsive design across desktop, laptop, tablet, and mobile viewports.


---

## 3. Technology Stack

### Frontend:
- **Framework**: React.js (v19) via Vite
- **Routing**: React Router (v7)
- **HTTP Client**: Axios (with Bearer token interceptor and 401 handling)
- **Styling**: Tailwind CSS (v4) with custom theme tokens & CSS3
- **Icons**: Lucide React
- **Typography**: Google Fonts (Inter)

### Backend:
- **Runtime**: Node.js
- **Server**: Express.js
- **Database Driver**: `mysql2/promise` (with connection pooling)
- **Authentication**: `jsonwebtoken` (JWT)
- **Security & Hashing**: `bcryptjs` (salt rounds: 10)
- **Cross-Origin**: `cors`
- **Environment**: `dotenv`

### Database:
- **Engine**: MySQL 8.0
- **Database Name**: `sevaconnect`
- **Tables**: `users`

---

## 4. Project Structure

```
SPM-SevaConnect/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL pool connection, initialization & failover persistence
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Logout, Session verification
│   │   ├── userController.js     # GET /api/users/profile, PUT /api/users/profile
│   │   └── adminController.js    # GET /api/admin/users, GET /api/admin/stats
│   ├── middleware/
│   │   ├── authMiddleware.js     # verifyToken and requireRole('Admin')
│   │   └── errorMiddleware.js    # 404 handler and safe global error response
│   ├── models/
│   │   └── userModel.js          # User database model abstraction & safe field projection
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── userRoutes.js         # /api/users endpoints
│   │   └── adminRoutes.js        # /api/admin endpoints
│   ├── utils/
│   │   ├── jwtUtils.js           # JWT signing & verification helper
│   │   └── validationUtils.js    # Email, phone, role, and password validators
│   ├── .env                      # Local environment configuration (DB credentials, secret)
│   ├── .env.example              # Template configuration
│   ├── package.json              # Backend dependencies & scripts
│   ├── schema.sql                # MySQL database schema definition
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── logo.png          # Official SevaConnect logo asset
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx         # Status notifications (success, error, warning)
│   │   │   ├── Button.jsx        # Standard buttons with spinner loading states
│   │   │   ├── Footer.jsx        # Responsive brand footer
│   │   │   ├── Input.jsx         # Form input with validation feedback & icons
│   │   │   ├── Navbar.jsx        # Navigation bar with responsive mobile menu
│   │   │   ├── ProtectedRoute.jsx# Role-based route guard
│   │   │   └── Sidebar.jsx       # Responsive dashboard navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state, user profile, login, logout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Public landing page
│   │   │   ├── LoginPage.jsx     # Login with credentials & role redirection
│   │   │   ├── RegisterPage.jsx  # Multi-user registration with role selection
│   │   │   ├── DonorDashboard.jsx# Donor portal with placeholder module cards
│   │   │   ├── AdminDashboard.jsx# Admin portal with live database stats & user list
│   │   │   └── ProfilePage.jsx   # View profile & update Name/Phone
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx               # Routes definition
│   │   ├── index.css             # Tailwind styling & SevaConnect brand tokens
│   │   └── main.jsx              # React DOM entry
│   ├── index.html
│   ├── vite.config.js            # Vite configuration with proxy
│   └── package.json
├── README.md
└── package.json                  # Root npm runner scripts
```

---

## 5. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MySQL Server**: v8.0 or compatible MariaDB instance

---

## 6. MySQL Database Setup

1. Make sure your MySQL Server is running.
2. The backend will **automatically create** the database (`sevaconnect`) and `users` table on startup.
3. If you prefer to manually initialize the schema via MySQL CLI or MySQL Workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS sevaconnect
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;

   USE sevaconnect;

   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(150) NOT NULL UNIQUE,
     phone VARCHAR(20) NOT NULL,
     password VARCHAR(255) NOT NULL,
     role ENUM('Donor', 'Admin') NOT NULL DEFAULT 'Donor',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     INDEX idx_email (email),
     INDEX idx_role (role)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   ```

---

## 7. Environment Variables

In `backend/.env`:
```ini
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sevaconnect

# JWT Secret Key
JWT_SECRET=sevaconnect_super_secure_jwt_secret_2026
JWT_EXPIRES_IN=7d
```

> **Note**: An automatic persistent local failover storage is included in `backend/config/db.js`. If your local MySQL instance has a custom password, simply provide it in `backend/.env` and restart the backend server to communicate directly with MySQL.

---

## 8. Backend Installation
```bash
cd backend
npm install
```

---

## 9. Frontend Installation
```bash
cd frontend
npm install
```

---

## 10. How to Run Backend
From the root directory:
```bash
npm run server
```
Or from the `backend/` directory:
```bash
cd backend
node server.js
```
The backend API starts on `http://localhost:5000`.

---

## 11. How to Run Frontend
From the root directory:
```bash
npm run client
```
Or from the `frontend/` directory:
```bash
cd frontend
npm run dev
```
The Vite development application will be available at `http://localhost:5173`.

---

## 12. API Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new user (`Donor` or `Admin`). Password is encrypted via bcrypt. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, generates and returns a signed JWT. |
| `POST` | `/api/auth/logout` | Public | Acknowledges session termination. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated session user. |

### User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Authenticated | Returns profile of currently authenticated user (no passwords). |
| `PUT` | `/api/users/profile` | Authenticated | Updates authenticated user's `name` and `phone`. (Email and Role are protected). |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Admin Only | Returns all registered users from MySQL (never exposes passwords/hashes). |
| `GET` | `/api/admin/stats` | Admin Only | Returns live database counts (`totalUsers`, `totalDonors`, `totalAdmins`) and status. |

---

## 13. Authentication & Security Architecture

1. **Password Protection**:
   - Passwords are encrypted before database insertion using `bcryptjs` with 10 salt rounds.
   - Passwords and password hashes are **never returned** in any API response or stored in frontend memory.
2. **Stateless JWT Tokens**:
   - On successful login, the server issues a signed JWT containing `{ id, email, role }`.
   - The token expiration is set to 7 days by default.
3. **Role-Based Access Control**:
   - Server-side middleware verifies the user's role on each protected request by querying the active database record.
   - A `Donor` cannot access `/api/admin/*` endpoints and will receive an HTTP `403 Forbidden` error.
4. **Client-side Guards**:
   - `ProtectedRoute.jsx` intercepts unauthenticated attempts to access `/donor`, `/admin`, or `/profile`, redirecting to `/login`.
   - A `Donor` attempting to visit `/admin` in the browser is automatically redirected to `/donor`.
5. **No Artificial Limits**:
   - Multiple users can register and login simultaneously without limits. Every user maintains an independent session.

---

## 14. Brand Colors

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Teal** | `#087F73` | Navbar, branding, primary buttons & accents |
| **Dark Teal** | `#05665D` | Hover states, dark card headers |
| **Fresh Green** | `#2EAD62` | Success badges, highlight indicators |
| **Light Mint** | `#EAF6F3` | Page background, card backgrounds |
| **Golden Yellow**| `#F7BA3E` | High-priority CTA buttons |
| **Light Yellow** | `#FFF4D6` | Notification badges |
| **Dark Navy** | `#17243A` | Headings, primary text, dark footer |
| **Muted Grey** | `#667085` | Secondary text, placeholders, icons |
| **White** | `#FFFFFF` | Cards, forms, clean containers |
