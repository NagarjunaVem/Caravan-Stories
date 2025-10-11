# 🏕️ Caravan Stories - HalfStack

A comprehensive **ticket management system** enabling citizens to report issues, employees to resolve them, and administrators to oversee operations.

---

## 📋 Table of Contents

* [Overview](#-overview)
* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Usage](#-usage)
* [API Endpoints](#-api-endpoints)
* [User Roles](#-user-roles)
* [Contributing](#-contributing)
* [License](#-license)
* [Team](#-team)

---

## 🌟 Overview

**Caravan Stories** is a full-stack web application designed to streamline the process of **reporting, tracking, and resolving community issues**.
The platform supports **three distinct user roles** with dedicated dashboards and functionalities.

---

## ✨ Features

### 👤 For Citizens

* 🎫 Create and track tickets/complaints
* 📊 View ticket status and timeline
* 🔍 Filter tickets by status (pending, in-progress, resolved)
* 📈 Dashboard with personal statistics
* 🔔 Real-time ticket updates

### 👷 For Employees

* 📋 View assigned tickets
* ✅ Update ticket status
* 📝 Add comments and updates
* 📊 Personal performance statistics
* 🎯 Quick action tools

### 🧑‍💼 For Administrators

* 👥 Employee management (create, view, edit)
* 🎫 Ticket oversight and assignment
* 📊 Comprehensive analytics and statistics
* 📈 Category-wise breakdown
* 🏢 Department-based filtering
* ✅ Role request approvals

### ⚙️ General Features

* 🔐 Secure authentication system
* ✉️ Email verification
* 🔑 Password recovery
* 👤 User profile management
* 📱 Responsive design
* 🖼️ File upload support for tickets
* 📧 Email notifications

---

## 🛠️ Tech Stack

### **Frontend**

* **Framework:** React 19.1.1
* **Build Tool:** Vite 7.1.7
* **Styling:** Tailwind CSS 4.1.13
* **Routing:** React Router DOM 7.9.3
* **HTTP Client:** Axios 1.12.2
* **Charts:** React Chart.js 2
* **UI Components:** CoreUI React
* **Notifications:** React Toastify

### **Backend**

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JWT
* **Email Service:** Nodemailer
* **File Upload:** Multer
* **Password Hashing:** bcrypt

---

## 📁 Project Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── citizen/     # Citizen-specific components
│   │   │   └── employee/    # Employee-specific components
│   │   ├── context/         # React Context for state management
│   │   ├── pages/           # Page components
│   │   │   ├── dashboards/  # Role-based dashboards
│   │   │   └── sections/    # Home page sections
│   │   └── assets/          # Images and static files
│   └── public/              # Public assets
│
└── server/                   # Backend Node.js application
    ├── configs/             # Configuration files
    ├── controllers/         # Route controllers
    ├── middleware/          # Custom middleware
    ├── models/              # Database models
    ├── routes/              # API routes
    └── uploads/             # Uploaded files storage
```

---

## 🚀 Getting Started

### **Prerequisites**

* Node.js (v14 or higher)
* MongoDB (local or Atlas)
* npm or yarn package manager

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/NagarjunaVem/Caravan-Stories
   cd caravan-stories
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   Create `.env` files in both `server` and `client` directories (see [Environment Variables](#-environment-variables)).

5. **Start MongoDB**
   Ensure MongoDB is running locally or configure your Atlas connection string.

6. **Run the application**

   **Server (from server directory):**

   ```bash
   npm start
   # or for development
   npm run dev
   ```

   **Client (from client directory):**

   ```bash
   npm run dev
   ```

7. **Access the application**

   * Frontend: [http://localhost:5173](http://localhost:5173)
   * Backend: [http://localhost:5000](http://localhost:5000)

---

## 🔐 Environment Variables

### **Server (`server/.env`)**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/caravan-stories
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/caravan-stories

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@caravanstories.com

# Frontend URL
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### **Client (`client/.env`)**

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Caravan Stories
```

---

## 📖 Usage

### **User Registration Flow**

1. Navigate to the Register page
2. Fill in required details
3. Verify email via the link sent to your inbox
4. Login with credentials
5. Request a role (Employee/Admin) if needed
6. Wait for admin approval (for Employee/Admin roles)

### **Creating a Ticket**

1. Login as Citizen or Employee
2. Navigate to Dashboard
3. Click “Create Ticket”
4. Fill in details:

   * Title
   * Description
   * Category
   * Priority
   * Location (optional)
   * Attach image (optional)
5. Submit and track status

### **Admin Operations**

**Employee Management:**

* View all employees
* Create new employee accounts
* View employee details and statistics

**Ticket Management:**

* View all tickets
* Assign tickets to employees
* Monitor ticket status
* Filter by department/status

**Role Requests:**

* Review pending role requests
* Approve/Reject requests

---

## 🔌 API Endpoints

### **Authentication**

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/api/auth/register`              | Register new user      |
| POST   | `/api/auth/login`                 | User login             |
| GET    | `/api/auth/verify-email/:token`   | Verify email           |
| POST   | `/api/auth/forgot-password`       | Request password reset |
| POST   | `/api/auth/reset-password/:token` | Reset password         |

### **Tickets**

| Method | Endpoint           | Description                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/api/tickets`     | Get all tickets (filtered by role) |
| POST   | `/api/tickets`     | Create new ticket                  |
| GET    | `/api/tickets/:id` | Get ticket details                 |
| PUT    | `/api/tickets/:id` | Update ticket                      |
| DELETE | `/api/tickets/:id` | Delete ticket                      |

### **Admin**

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| GET    | `/api/admin/employees`     | Get all employees         |
| POST   | `/api/admin/employees`     | Create employee           |
| GET    | `/api/admin/employees/:id` | Get employee details      |
| PUT    | `/api/admin/assign-ticket` | Assign ticket to employee |

### **Role Requests**

| Method | Endpoint                         | Description                   |
| ------ | -------------------------------- | ----------------------------- |
| POST   | `/api/role-requests`             | Submit role request           |
| GET    | `/api/role-requests`             | Get all role requests (admin) |
| PUT    | `/api/role-requests/:id/approve` | Approve request               |
| PUT    | `/api/role-requests/:id/reject`  | Reject request                |

### **Profile**

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| GET    | `/api/profile`          | Get user profile    |
| PUT    | `/api/profile`          | Update user profile |
| PUT    | `/api/profile/password` | Change password     |

### **Statistics**

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/api/stats/dashboard` | Get dashboard statistics |
| GET    | `/api/stats/tickets`   | Get ticket statistics    |
| GET    | `/api/stats/global`    | Get global statistics    |

---

## 👥 User Roles

### **Citizen**

* Default role for all registered users
* Can create and track personal tickets
* View personal statistics

### **Employee**

* Requires admin approval
* Can handle assigned tickets
* Update ticket status and add comments
* Access to assigned tickets dashboard

### **Admin**

* Full system access
* Manage employees and tickets
* View comprehensive analytics
* Approve role requests
* Assign tickets to employees

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch

   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes

   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. Push to the branch

   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team

* **Nagarjuna** – MNNIT'28
* **Shubham** – MNNIT'28
* **Teja** – MNNIT'28
