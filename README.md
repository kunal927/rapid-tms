# RAPONE TMS — Transport Management System

A production-ready, scalable **Transport Management System (TMS)** designed for transport logistics companies. Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **MySQL**, and **Prisma ORM**.

---

## 🏛 Architecture & Exactly 3 User Panels

The system deliberately consolidates all transport workflows into **exactly 3 permission-isolated panels**:

| Panel | Primary Role | Scope & Permissions | Target Viewport |
| :--- | :--- | :--- | :--- |
| **Super Admin / Owner Panel** | `SUPER_ADMIN` | Executive command, full fleet visibility, financial ledger, advance approvals, Excel import/export, audit trail, company settings. | Desktop / Tablet |
| **Operations Manager Panel** | `OPERATIONS_MANAGER` | Dispatch board, vehicle allocation, route monitoring, driver attendance, delivery fulfillment tracking, fuel logs. | Desktop / Tablet |
| **Driver Panel** | `DRIVER` | **Mobile-First Cockpit**: Strictly scoped to assigned trip, delivery queue, OTP/POD status, cash collection (COD), earnings breakdown, and 1-tap SOS emergency. | Mobile Smartphone |

> **Strict RBAC Rule**: Drivers can **never** view another driver's data, advances, earnings, or trips. Unauthorized panel visits are blocked by Edge middleware and server guards.

---

## 🚀 Key Credentials for Testing

| Role | Email | Password | Direct Destination |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin / Owner** | `admin@rapone.com` | `Admin@12345` | `/admin/dashboard` |
| **🚛 Operations Manager** | `ops@rapone.com` | `Ops@12345` | `/operations/dashboard` |
| **🚚 Driver** | `driver@rapone.com` | `Driver@12345` | `/driver/dashboard` |

> 💡 *On the `/login` page, you can also click the quick-fill buttons to populate credentials instantly.*

---

## 📊 Business Logic: Excel Normalization

The existing transport spreadsheet workflow has been normalized into relational database entities while preserving client financial concepts:

| Legacy Excel Column | Normalized Database Mapping | Business Logic & Rules |
| :--- | :--- | :--- |
| **Date** | `Trip.tripDate` (`@db.Date`) | Indexed date of dispatch |
| **Vehicle No.** | `Vehicle.vehicleNumber` (Unique) | Relational reference to fleet register |
| **Trip No.** | `Trip.tripNumber` (Unique) | Auto-generated standard identifier (e.g. `TRP-2026-0042`) |
| **Driver** | `Driver.id` / `User.name` | 1-to-1 link with driver profile and rate card |
| **Driver Advance** | `Trip.driverAdvance` / `DriverAdvance` | Advance disbursed to driver for fuel/trip expenses |
| **DPD Name** | `Dpd.name` / `Dpd.code` | Distribution Hub / Delivery Center |
| **DPD Advance** | `Trip.dpdAdvance` | Advance received from customer/hub |
| **Orders in Trip** | `Trip.totalOrders` | Aggregate count of linked `Order` records |
| **Orders Delivered** | `Trip.deliveredOrders` | Count of orders with status `DELIVERED` |
| **Per Order Rate** | `Trip.perOrderRate` (`Decimal`) | Agreed contractual rate per successful delivery |
| **Driver Payment** | **Server-side Calculated** | Formula: `Delivered Orders × Per Order Rate` |

---

## 🛠 Technology Stack

- **Framework**: Next.js (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict typing, no `any`)
- **Styling**: Tailwind CSS + Enterprise Logistics Global Theme (`globals.css`)
- **UI Components**: **shadcn/ui** (Button, Card, Input, Label, Select, Dialog, Sheet, Tabs, Table, Badge, Avatar, Separator, Dropdown-Menu, Sonner, Alert, Skeleton, Tooltip, Scroll-Area, Breadcrumb, Pagination, Checkbox, Switch, Textarea, Progress, Accordion, Popover, Command)
- **Database**: MySQL with **Prisma ORM 6**
- **Authentication**: Secure HTTP-only JWT cookies (`jose`), bcrypt password hashing
- **Validation**: Zod schema validation on all inputs and API endpoints

---

## 🗄 Core Database Schema

The normalized MySQL schema in `prisma/schema.prisma` includes:
- `users`, `drivers`, `driver_documents`, `driver_attendance`, `driver_advances`, `driver_expenses`, `driver_payments`, `driver_ledger`
- `vehicles`, `vehicle_documents`, `vehicle_fuel`, `vehicle_maintenance`, `vehicle_expenses`
- `dpds` (Distribution Points / Hubs)
- `trips`, `trip_assignments`, `trip_expenses`
- `orders`, `deliveries`, `delivery_attempts`, `pod_documents`
- `payments`, `expenses`, `transactions`
- `notifications`, `audit_logs`, `settings`

---

## ⚡ Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your MySQL connection string is set:
```env
DATABASE_URL="mysql://root:password@localhost:3306/rapone_tms"
AUTH_SECRET="rapone_tms_jwt_auth_secret_key_minimum_32_characters_long_for_security"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Schema & Seed Initial Data
When your MySQL server is running:
```bash
npm run db:push
npm run db:seed
```

> **Resilient Local Fallback**: If MySQL service is offline or not yet configured on your machine, the application will automatically operate in high-fidelity demo mode with pre-seeded accounts so you can inspect, test, and run all 3 panels without interruptions.

### 5. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 6. Run Verification Test Suite
```bash
node scripts/verify-foundation.mjs
```
Validates authentication, cookie session handling, RBAC isolation, dashboard responses, and driver delivery status updates.
