# ✅ ToDo Backend API

This is the backend REST API for the **ToDo application**, developed using:

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
├── Dockerfile            # Docker configuration
├── .env                  # Environment variables
├── database/
│   └── mongoDB.js        # MongoDB setup
├── models/               # Mongoose models (User, Notes)
├── routes/               # API routes
│   ├── auth.js           # Register/Login
│   └── note.js           # Notes CRUD
├── middleware/
│   └── fetchData.js      # JWT auth middleware
└── package.json
```

---

## ⚙️ Setup Instructions

### ✅ Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Atlas or local)
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

3. **Create your environment variables**

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/todo
JWT_SECRET=your_jwt_secret
```

---

## ▶️ Running the Server Locally

### Development mode (nodemon)

```bash
npm run dev
```

### Production mode

```bash
node app.js
```

---

## 🐳 Docker Setup

### 🧱 Build Docker image

```bash
docker build -t todo-backend .
```

### ▶️ Run Docker container

```bash
docker run -p 5000:5000 --env-file .env todo-backend
```

---

## 🔐 API Endpoints Overview

All secure routes require an `authToken` header with a valid JWT.

### `POST /auth/register`

Register a user.

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "Password@123"
}
```

---

### `POST /auth/login`

Login a user.

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

Response contains a JWT:

```json
{
  "message": "Login successful",
  "token": "....",
  "user": {
    "id": "...",
    "name": "John",
    "email": "john@example.com"
  }
}
```

---

### `POST /auth/fetchuserdata`

Returns authenticated user's data (name).

**Headers:**

```
authToken: <jwt_token>
```

---

### `POST /notes/addnotes`

Create a note.

```json
{
  "title": "My Task",
  "description": "Complete assignment",
  "tags": "work",
  "dueDate": "2025-07-08T00:00:00.000Z"
}
```

---

### `GET /notes/savednotes`

Fetch all notes of the logged-in user.

**Headers:**

```
authToken: <jwt_token>
```

---

## 🌐 Deployment with Render

1. Connect your GitHub repo to [Render](https://render.com).
2. Select "Web Service".
3. Set Environment:

```
Build Command: docker build -t todo-backend .
Start Command: docker run -p 5000:5000 --env-file .env todo-backend
```

4. Add environment variables in Render’s dashboard.

5. Enable "Auto Deploy on Git Push" ✅

---

## 🔒 Security Highlights

- Passwords hashed using `bcryptjs`
- Input validation via `express-validator`
- Token-based authentication with `jsonwebtoken`
- Protected routes using custom `fetchData` middleware
- `Helmet` for setting secure HTTP headers
- `express-rate-limit` to block brute-force attacks
- CORS enabled for cross-origin support

---

## 👨‍💻 Author

**Prashant Jha**  
[GitHub](https://github.com/PrashantJha183)  
[LinkedIn](https://linkedin.com/in/prashantjha183)

---
