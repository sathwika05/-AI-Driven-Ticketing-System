# 🧠 AI-Driven Ticket Management System

A smart, scalable ticket management solution powered by AI to streamline support workflows. Automatically categorizes, prioritizes, and assigns tickets to the most appropriate moderators—ensuring faster and more effective issue resolution.

---

## 🚀 Features

### 🎯 AI-Powered Ticket Processing
- ✅ Automatic ticket categorization using Google Gemini API
- 📌 Intelligent priority assignment (low, medium, high)
- 👥 Skill-based moderator matching
- 📝 AI-generated helpful notes for moderators

### 👤 Smart Moderator Assignment
- 🧠 Auto-matching of tickets to moderators based on skillset
- ⚠️ Fallback mechanism for admin assignment if no match found
- 🔀 Skill-based routing logic

### 👥 User & Role Management
- 🔐 JWT-based authentication
- 🔄 Role-based access control (User, Moderator, Admin)
- 🛠️ Moderator skill management

### ⚙️ Background Processing
- 📦 Event-driven architecture powered by [Inngest](https://www.inngest.com/)
- 📧 Automated email notifications
- ⏳ Asynchronous and resilient ticket handling

---

## 🛠️ Tech Stack

| Layer            | Technology                         |
|-------------------|-------------------------------------|
| **Backend**       | Node.js, NestJS                     |
| **Frontend**      | ReactJS                             |
| **Database**      | PostgreSQL                         |
| **Authentication**| JWT                                |
| **AI Integration**| Google Gemini API                  |
| **Background Jobs**| Inngest                           |
| **Email Service** | Nodemailer + Mailtrap              |

---

## 📝 API Endpoints

### 🔐 Authentication
- `POST /api/auth/signup` – Register a new user  
- `POST /api/auth/login` – Login and receive a JWT token  

### 🧾 Tickets
- `POST /api/tickets` – Create a new support ticket  
- `GET /api/tickets` – Fetch all tickets for the logged-in user  
- `GET /api/tickets/:id` – Get detailed info for a specific ticket  

### 🛡️ Admin
- `GET /api/auth/users` – View all users (Admin only)  
- `POST /api/auth/update-user` – Update user role and skills (Admin only) 



