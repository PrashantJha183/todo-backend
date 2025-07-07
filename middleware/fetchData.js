import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not found in environment varaibale");
}

const fetchData = async (req, res, next) => {
  try {
    //Reading token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided" });
    }

    //Extract  token value
    const token = authHeader.split(" ")[1];

    //Verify token using secret key
    const userData = jwt.verify(token, JWT_SECRET);
    console.log("JWT verified data: ", userData);

    /**
     * Save decoded data into request object
     * so downstream routes know which user is logged in.
     *
     * Example:
     * payload = { userId: ... }
     * So decoded.userId is the logged-in user's id.
     */

    req.user = userData.userId;

    // Call next middleware or route handler
    next();
  } catch (error) {
    console.error("JWT verification error: ", error.message);
    // Differentiate between invalid and expired tokens
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please log in again." });
    } else {
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
};

export default fetchData;
