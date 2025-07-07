import express from "express";
import MongoDbConnection from "./database/mongoDB.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/note.js";
const app = express();
const port = 5000;

//Security middleware
app.use(helmet());
app.use(express.json());

//Prevent cors policy issue
app.use(cors());

//Rate the limit to hit apis
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //maximum request allowed for this time frame
});
app.use(limiter);

(async () => {
  await MongoDbConnection();

  app.use("/auth", authRoutes);
  app.use("/notes", notesRoutes);

  app.listen(port, () => {
    console.log(`Todo app backend is listening at http://localhost:${port}`);
  });
})();
