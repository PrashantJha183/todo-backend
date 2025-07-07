# ToDo Backend API

This is the backend REST API for the ToDo application, built with:


- **Node.js**
- **Express.js**
- **MongoDB / Mongoose**
- **JWT authentication**
- **bcrypt.js** for secure password hashing
- **express-validator** for input validation
- **Helmet + Rate Limiting** for security
- **Docker-ready** for deployment (Render or custom)

---

## 📂 Project Structure

```

├── app.js                # App entrypoint
├── database/
│   └── mongoDB.js        # MongoDB setup
├── models/               # Mongoose models and schema
├── routes/               # API routes
│   ├── auth.js
│   ├── note.js
│   └── notification.py
└── middleware/           # Middleware function
```

---

## ⚙️ Setup Instructions

### ✅ Prerequisites

- Node.js
- MongoDB (local or Atlas)
- Git
- Docker (for containerization & deployment)

---

### 🔧 Installation

1. **Clone the repo**

```bash
git clone https://github.com/PrashantJha183/todo-backend.git
cd todo-backend
```

2. **Install dependencies**

```bash
npm install
```

4. **Configure environment**

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster0.qczlqfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/todo
JWT_SECRET=<your-jwt_secret>
```

---

### ▶️ Run the Server

```bash
node app.js
```