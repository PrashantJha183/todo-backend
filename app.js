import express from "express";
import dotenv from "dotenv";
import MongoDbConnection from "./database/mongoDB.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/note.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow loading assets from different origins if needed
  })
);
app.use(express.json());

// Enable CORS safely
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://utilers.netlify.app",
       "https://utilers.netlify.app/",
      "https://todo-backend-8iko.onrender.com",
      // process.env.FRONTEND_API_URL,
    ].filter(Boolean),
    credentials: true, // enable credentials if cookies or auth headers are used
  })
);

// Rate limiter - protect from brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Register routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

// Serve environment variables dynamically to frontend
// app.get("/env.js", (req, res) => {
//   res.setHeader("Content-Type", "application/javascript");
//   res.send(`
//     window._env_ = {
//       API_URL: "${process.env.FRONTEND_API_URL || ""}"
//     };
//   `);
// });

// Start server in an async IIFE
(async () => {
  try {
    await MongoDbConnection();
    app.listen(port, () => {
      console.log(`Todo app backend listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
