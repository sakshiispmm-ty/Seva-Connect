# SevaConnect — NGO Donation & Resource Management System

<p align="center">
  <img src="frontend/public/assets/logo.png" alt="SevaConnect Logo" width="140" />
</p>

<p align="center">
  <strong>"Connecting NGOs, Donors, Volunteers & Communities"</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-3.2.0-087F73?style=flat-square" alt="Version 3.2.0" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-087F73?style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-05665D?style=flat-square" alt="Express" />
  <img src="https://img.shields.io/badge/Database-MySQL%208.0%20%2B%20Failover-17243A?style=flat-square" alt="MySQL 8.0" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-2EAD62?style=flat-square" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-ISC-F7BA3E?style=flat-square" alt="License" />
</p>

---

## 📌 1. Project Overview

**SevaConnect** is a comprehensive, production-grade **Full-Stack NGO Donation, Volunteer Coordination & Resource Management System**. It bridges the transparency and trust gap between philanthropic donors, charitable NGOs, field volunteers, and distressed beneficiaries.

The platform provides a secure, role-based operational ecosystem where:
- **Donors** discover verified relief initiatives, contribute financial or in-kind supplies, track real-time delivery timelines, and download verifiable donation certificates.
- **Volunteers** manage assigned field relief tasks, record deliveries, earn service points, unlock recognition badges, and track rankings on the community leaderboard.
- **NGO Administrators** oversee campaigns, verify incoming contributions, dispatch warehouse inventories, allocate field tasks, inspect audit trails, analyze operational metrics, and manage user accounts.
- **Beneficiaries** access essential disaster relief, medical aids, and educational resources through transparent request pipelines.

---

## 👥 2. Core Ecosystem & User Roles

```
                      ┌─────────────────────────────────────────┐
                      │               SevaConnect               │
                      │          Platform Ecosystem             │
                      └────────────────────┬────────────────────┘
                                           │
         ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
         ▼                   ▼                           ▼                   ▼
    ┌──────────┐      ┌─────────────┐             ┌─────────────┐     ┌──────────────┐
    │  Donors  │      │ Volunteers  │             │   Admins    │     │ Beneficiaries│
    └────┬─────┘      └──────┬──────┘             └──────┬──────┘     └──────┬───────┘
         │                   │                           │                   │
  • Donate Funds      • Accept Tasks              • Verify Pledges    • Assistance
  • Pledge In-Kind    • Deliver Supplies          • Manage Campaigns    Requests
  • Track Receipts    • Earn Gamified Points      • Inventory Control • Aid Delivery
  • Smart Suggestions • Unlock Badges & Ranks     • Audit Log & KPIs  • Status Tracking
```

### 1. 💝 Donors
- **Campaign Discovery**: Browse categorized community drives (Education, Healthcare, Disaster Relief, Nutrition, Community Care).
- **Dual Donation Pathways**:
  - **Financial**: Direct monetary pledges with instant allocation tracking.
  - **In-Kind Relief**: Material donations (food ration kits, blankets, medical kits, school supplies).
- **Cryptographic Token Verification**: Instant unique transaction tokens (`#TKN-XXXXX`) for complete public or internal verification.
- **Contribution Receipts**: On-demand printable and downloadable official NGO donation receipts.
- **Smart Campaign Recommendations**: Intelligent suggestions matching past contribution patterns and urgent community deadlines.
- **Community Feedback & Reviews**: Star ratings and qualitative feedback on campaigns.

### 2. 🤝 Volunteers
- **Task Dispatch Center**: Real-time assignment board with urgency tags (`High`, `Medium`, `Low`) and resolution deadlines.
- **Mission Progression Workflow**: Transition tasks seamlessly from `Assigned` ➔ `In Progress` ➔ `Completed / Delivered`.
- **Gamification & Points Engine**: Earn 25 to 100 volunteer service points per verified relief delivery.
- **Recognition Badges**: Progressive service badges with criteria modals:
  - 🏅 *First Steps* — First community delivery task.
  - 🛡️ *Dedicated Helper* — 5 completed tasks.
  - 🏆 *Community Champion* — 10+ completed tasks.
  - 🔥 *Priority Hero* — 3+ high-priority emergency missions.
  - ⚡ *Centurion* — 250+ volunteer points.
  - 👑 *Legendary Volunteer* — 500+ volunteer points.
- **Public Community Leaderboard**: Real-time ranked leaderboards with milestone filtration.
- **Volunteer Skills Profile**: Registered skillsets and availability windows for targeted administrative dispatch.

### 3. 🛡️ NGO Administrators
- **Executive Operations Radar**: Unified dashboard summarizing real-time fundraising, pending verifications, active volunteers, and low-stock alerts.
- **Donation Verification Suite**: Approve or reject monetary and material contributions with automated notification dispatch.
- **Beneficiary Registry**: Central database of aid recipients with historic request profiles and household classifications.
- **Assistance Request Lifecycle**: Multi-stage state machine (`Submitted` ➔ `Under Review` ➔ `Approved` ➔ `Resources Allocated` ➔ `Volunteer Assigned` ➔ `Completed`).
- **Warehouse Inventory & Stock Movements**: Item catalog, minimum reorder thresholds, automated low-stock warnings, and historical stock logs.
- **Deep Analytics & Reporting Suite**:
  - Financial, Campaign, Volunteer velocity, and Beneficiary urgency reports.
  - **Donor Base Segmentation**: Behavioral classification (Major Donors, Regular Donors, In-Kind Contributors).
  - **Resource Consumption Trends**: Temporal demand forecasting across warehouse inventory.
- **User Directory & Access Governance**:
  - Role management (`Donor`, `Volunteer`, `Admin`) with automatic volunteer profile initialization.
  - Soft-deactivation and reactivation of user accounts preserving database referential integrity.
  - Self-demotion and self-deactivation protection for the active administrator.
- **Immutable Administrative Audit Log**: Write-only tamper-evident audit trail capturing security-critical administrative actions.

### 4. 🤖 SevaBot — AI Assistant
- App-wide interactive assistant powered by contextual NGO response algorithms.
- Provides immediate answers regarding donation verification, volunteer onboarding, tax receipts, and relief requests.
- Integrated quick-action links guiding users directly to relevant platform modules.

---

## 🛠️ 3. Technology Stack

### Frontend
- **Core**: React 19 (via Vite)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 & custom SevaConnect Design Tokens
- **Icons**: Lucide React
- **HTTP Client**: Axios (configured with JWT authorization interceptors and automated 401 handling)
- **Charts & Data Viz**: Responsive CSS-based custom metric charts & visual data meters
- **Typography**: Inter (Google Fonts)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database Driver**: `mysql2/promise` with robust connection pooling
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`)
- **Encryption**: `bcryptjs` salted password hashing (10 salt rounds)
- **CORS & Environment**: `cors`, `dotenv`

### Data Storage & Failover Architecture
- **Primary Database**: MySQL 8.0 (Relational schema with foreign key constraints, indexes, and automated migration scripts).
- **Persistent Local Failover Storage**: Built-in automated JSON failover emulator (`backend/data/*.json`) allowing full-featured operation without mandatory external database dependencies.

---

## 📁 4. Project Directory Structure

```
SPM-SevaConnect/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MySQL pool & persistent failover database engine
│   │   └── jwtConfig.js          # JWT signing keys & expiration configuration
│   ├── controllers/
│   │   ├── adminController.js    # User governance, statistics, audit logs
│   │   ├── assistanceRequestController.js # Beneficiary assistance requests lifecycle
│   │   ├── authController.js     # User registration, authentication, session
│   │   ├── beneficiaryController.js # Beneficiary registry management
│   │   ├── campaignController.js # Relief campaign creation and tracking
│   │   ├── chatbotController.js  # SevaBot AI assistant response handler
│   │   ├── donationController.js # Monetary & in-kind donation workflow
│   │   ├── feedbackController.js # Campaign & task reviews and ratings
│   │   ├── inventoryController.js# Warehouse stock catalog & movements
│   │   ├── notificationController.js # In-app notifications & preference toggles
│   │   ├── reportController.js   # Analytics, segmentation & temporal trends
│   │   ├── userController.js     # User profile management
│   │   └── volunteerController.js# Tasks, delivery verification, gamification
│   ├── data/                     # Seeded JSON database records for failover storage
│   ├── middleware/
│   │   ├── authMiddleware.js     # Token verification & strict role-based route guards
│   │   ├── errorMiddleware.js    # Centralized exception & HTTP error handler
│   │   └── rateLimitMiddleware.js# Login brute-force protection
│   ├── models/                   # Modular data access objects (DAOs)
│   ├── routes/                   # Express REST API route definitions
│   ├── utils/                    # JWT, validation, and analytics calculation utilities
│   ├── schema.sql                # Complete MySQL 8.0 database schema
│   ├── server.js                 # Express application entrypoint
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── assets/               # Brand assets & logos
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, Sidebar, Pagination, Modals)
│   │   ├── context/              # Global AuthContext & session management
│   │   ├── pages/
│   │   │   ├── admin/            # Admin suite (Analytics, Users, Requests, Inventory, etc.)
│   │   │   ├── volunteer/        # Volunteer dashboard, task list, leaderboard, profile
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Unified Axios client with API service modules
│   │   ├── App.jsx               # Application routes & layout router
│   │   ├── index.css             # Tailwind design tokens & utility classes
│   │   └── main.jsx              # React DOM initialization
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── package.json
├── README.md
└── package.json                  # Root runner scripts (concurrent execution)
```

---

## ⚡ 5. Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or newer (`v20+` recommended)
- **npm**: `v9.0.0` or newer
- **MySQL** *(Optional)*: `v8.0+` (If MySQL is not installed, the platform automatically activates persistent local failover storage).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/sakshiispmm-ty/Seva-Connect.git
cd Seva-Connect
```

---

### Step 2: Install Dependencies
Run the root install script to install dependencies for both backend and frontend:
```bash
npm run install:all
```
*Or manually:*
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

---

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend/` directory (a template is provided in `backend/.env.example`):

```ini
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sevaconnect

# JWT Secret
JWT_SECRET=sevaconnect_production_secure_secret_key_2026
JWT_EXPIRES_IN=7d
```

> **Note:** If MySQL credentials are not configured or connection fails, the system automatically logs a notice and seamlessly runs on persistent failover storage without crashing.

---

### Step 4: Run the Application

#### Option A: Run Both Services Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

#### Option B: Run Services Individually
- **Backend API**:
  ```bash
  cd backend
  npm run dev
  ```
  *Backend server runs at: `http://localhost:5000`*

- **Frontend Client**:
  ```bash
  cd frontend
  npm run dev
  ```
  *Frontend application opens at: `http://localhost:5173`*

---

## 🔑 6. Pre-Configured Demo Accounts

Use any of the following pre-seeded accounts to explore the platform across different roles:

| Role | Name | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Sakshi | `sakshiispmm@gmail.com` | `admin123` | Full administrative control, analytics, audit log |
| **Admin** | Jia Patel | `pateljiaa16@gmail.com` | `admin123` | Full administrative control, analytics, audit log |
| **Admin** | Sanjana Patel | `sanjanapatelspm@gmail.com` | `admin123` | Full administrative control, analytics, audit log |
| **Admin** | Shreeya | `shreeyaspm31@gmail.com` | `admin123` | Full administrative control, analytics, audit log |
| **Volunteer** | Vikram Joshi | `vikram.volunteer@gmail.com` | `volunteer123` | Tasks, delivery completion, badges, leaderboard |
| **Volunteer** | Kavya Nair | `volunteer@gmail.com` | `volunteer123` | Tasks, delivery completion, badges, leaderboard |
| **Donor** | Rohit Verma | `rohit.verma@gmail.com` | `donor123` | Monetary/Item donations, receipts, recommendations |
| **Donor** | Manisha Shah | `manisha@gmail.com` | `donor123` | Monetary/Item donations, receipts, recommendations |

*(You can also register brand-new accounts directly through the `/register` portal with immediate login access).*

---

## 🌐 7. Complete API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account (`Donor`, `Volunteer`, `Admin`). |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive signed JWT. |
| `POST` | `/api/auth/logout` | Public | Invalidate current session. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve session profile of active user. |

### 📢 Campaigns (`/api/campaigns`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/campaigns` | Public | List all active campaigns with optional search, category, and pagination. |
| `GET` | `/api/campaigns/:id` | Public | Retrieve single campaign details, progress percentage, and donor reviews. |
| `POST` | `/api/campaigns` | Admin | Create a new community relief campaign. |
| `PUT` | `/api/campaigns/:id` | Admin | Update campaign parameters, target goals, or status. |

### 🎁 Donations (`/api/donations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donations` | Authenticated | Submit monetary or in-kind donation pledge. |
| `GET` | `/api/donations/my` | Authenticated | Retrieve personal donation history with receipt links. |
| `GET` | `/api/donations/verify/:token` | Public | Verify authenticity of any donation using its token. |
| `GET` | `/api/donations` | Admin | List all donations with status, campaign, and date filters. |
| `PUT` | `/api/donations/:id/verify` | Admin | Approve and verify incoming donation contribution. |
| `PUT` | `/api/donations/:id/reject` | Admin | Reject invalid or fraudulent donation submission. |

### 🤝 Volunteers & Gamification (`/api/volunteers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/volunteers/profile` | Volunteer | Retrieve volunteer skills and availability profile. |
| `PUT` | `/api/volunteers/profile` | Volunteer | Update skills, schedule, and on-call status. |
| `GET` | `/api/volunteers/tasks` | Volunteer | List assigned community relief delivery tasks. |
| `PUT` | `/api/volunteers/tasks/:id/status` | Volunteer | Update task progression (`In Progress`, `Completed`). |
| `GET` | `/api/volunteers/leaderboard` | Public | Ranked leaderboard sorted by service points & deliveries. |
| `GET` | `/api/volunteers/:id/badges` | Authenticated | Retrieve earned badges and recognition milestones. |
| `GET` | `/api/volunteers/me/gamification` | Volunteer | Retrieve points balance, badges, and recent transactions. |

### 📦 Beneficiaries & Requests (`/api/beneficiaries`, `/api/assistance-requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/beneficiaries` | Admin | Search and list registered beneficiaries. |
| `POST` | `/api/beneficiaries` | Admin | Register new beneficiary household. |
| `GET` | `/api/assistance-requests` | Admin | List requests with multi-attribute filtering. |
| `POST` | `/api/assistance-requests` | Public / Admin | Submit community assistance request. |
| `PUT` | `/api/assistance-requests/:id/status` | Admin | Update request status through the operational pipeline. |
| `PUT` | `/api/assistance-requests/:id/allocate` | Admin | Allocate warehouse inventory to request. |
| `PUT` | `/api/assistance-requests/:id/assign` | Admin | Assign volunteer to transport and deliver supplies. |

### 🏬 Warehouse Inventory (`/api/inventory`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory` | Admin | View stock catalog, quantities, and low-stock alerts. |
| `POST` | `/api/inventory` | Admin | Add new inventory item to warehouse catalog. |
| `POST` | `/api/inventory/:id/stock-in` | Admin | Record inward supply shipment. |
| `POST` | `/api/inventory/:id/stock-out` | Admin | Record dispatch or damaged stock deduction. |
| `GET` | `/api/inventory/:id/history` | Admin | View historical item transactions audit log. |

### 📊 Reports & Deep Analytics (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/dashboard` | Admin | Comprehensive operational analytics payload. |
| `GET` | `/api/reports/insights` | Admin | Intelligent automated pattern observations. |
| `GET` | `/api/reports/donors/segmentation` | Admin | Behavioral donor tier segmentation analysis. |
| `GET` | `/api/reports/inventory/temporal-trends` | Admin | Historical inventory throughput and demand trends. |

### 🛡️ Admin Governance (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Admin | Paginated user directory with role and status filters. |
| `PUT` | `/api/admin/users/:id/role` | Admin | Change user role (`Donor`, `Volunteer`, `Admin`). |
| `PUT` | `/api/admin/users/:id/deactivate` | Admin | Soft-deactivate user account. |
| `PUT` | `/api/admin/users/:id/reactivate` | Admin | Restore deactivated user account. |
| `GET` | `/api/admin/audit-log` | Admin | Immutable administrative audit log with search. |
| `GET` | `/api/admin/stats` | Admin | System status, database health, live user counts. |

### 🔔 Notifications & Preferences (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Retrieve personal notifications with unread count. |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark individual notification as read. |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read. |
| `GET` | `/api/notifications/preferences` | Authenticated | Retrieve notification category and digest preferences. |
| `PUT` | `/api/notifications/preferences` | Authenticated | Update notification toggles and digest cadence. |

---

## 🎨 8. Design System & Brand Palette

SevaConnect uses a carefully curated color palette designed for high legibility, warmth, and trust:

| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| **Primary Teal** | `#087F73` | Main brand identity, navigation bar, primary action buttons, key accents |
| **Dark Teal** | `#05665D` | Hover states, active pressed buttons, dark container headers |
| **Fresh Green** | `#2EAD62` | Verified status badges, completed tasks, positive metric growths |
| **Light Mint** | `#EAF6F3` | Soft background tints, active tab highlights, badge backgrounds |
| **Golden Yellow** | `#F7BA3E` | High-priority CTAs, gamification points, achievement stars |
| **Light Yellow** | `#FFF4D6` | Notification alerts, warning indicators, urgent deadlines |
| **Dark Navy** | `#17243A` | Page headings, primary high-contrast typography, dark footers |
| **Muted Slate** | `#667085` | Subtitles, helper text, input placeholders, secondary icons |
| **Pure White** | `#FFFFFF` | Card surfaces, modal sheets, elevated panels |

---

## 🔒 9. Security & Data Integrity

- **Encrypted Credentials**: Passwords are protected using `bcryptjs` with 10 salt rounds before storage.
- **Role-Based Access Control (RBAC)**: Enforced via `requireRole` middleware on the backend and `<ProtectedRoute>` route wrappers on the frontend.
- **Session Integrity**: Stateless JWT tokens validated against active database user records on every authenticated call.
- **Self-Protection Guards**: Active administrators cannot demote or deactivate their own active accounts.
- **Immutable Audit Logging**: Security-relevant actions (role changes, account deactivations, inventory dispatches) are logged immutably with administrator IDs, timestamps, and IP addresses.
- **Safe SQL Projections**: User queries strictly exclude password hashes from API responses.

---

## 📄 10. License & Credits

- **Project**: SevaConnect NGO Donation & Resource Management System
- **Authors**: SPM SevaConnect Team
- **License**: ISC License

---

<p align="center">
  Built with ❤️ for non-profit organizations, selfless volunteers, and compassionate donors worldwide.
</p>
