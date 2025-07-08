import jwt from "jsonwebtoken";
import JWT_SECRET from "./jwtSecret.js";

const fetchData = async (req, res, next) => {
  try {
    //Reading token from Authorization header
    const authHeader = req.header("Authorization");
    console.log("Token received in header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided" });
    }

    //Extract  token value
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return res
        .status(401)
        .json({ error: "Token missing after Bearer prefix." });
    }

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
