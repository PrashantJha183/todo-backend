import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import fetchData from "../middleware/fetchData.js";
const router = Router();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not found in environment variable");
}
//--------------------------Creating a user using post request  /auth/resgister-------------------------------
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Paasword must be 8 characters long")
      .matches(/[a-z]/)
      .withMessage("Password must contain atleast one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain atleast one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain atleast one number")
      .matches(/[^a-zA-z0-9]/)
      .withMessage("Password must contain atleast one special character"),
  ],
  async (req, res) => {
    try {
      //Verifying error and returning it
      const registerResult = validationResult(req);
      if (!registerResult.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      //Using object destructuring to extract data from object
      const { name, email, password } = req.body;

      //Verifying if user exsist
      const exisiting = await User.findOne({ email });
      if (exisiting) {
        return res.status(400).json({ message: "User already exists" });
      }

      //---------------------------------Password hashing and adding salt using bcryptjs------------------------------------------

      //Generting salt
      const salt = await bcrypt.genSalt(10);

      //Hashing password beforing saving it into database
      const hashedPassword = await bcrypt.hash(password, salt);

      //If no user found store the data into database
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      //Generate jwt token once user get registered
      const payload = { userId: user._id };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h", //token expire in 1 hour
      });
      console.log("JWT token generated: ", token);

      //Return success response without password once data get stored in database
      res.status(201).json({
        message: "User resgistered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

//------------------------------------Login routes using post route /auth/login--------------------------

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      //Verifying error and returning it
      const loginResult = validationResult(req);
      if (!loginResult.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      //Using object destructuring to extract email and password from object
      const { email, password } = req.body;

      //Verify that the entered email address for log in is correct
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res
          .status(400)
          .json({ error: "Please enter correct login credentials" });
      }

      //Comparing entered password with the password exsist of that user in the database (using compare method of bcrypt)
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please enter correct login credentials" });
      }

      //Payload for JWT: contains user unique ID
      const payload = { userId: user._id };
      console.log("Payload data: ", payload);

      //Sign JWT token using payload data and secret
      const authToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h", //expires in 1 hour
      });
      console.log("Token after login: ", authToken);

      return res.status(200).json({
        message: "Login successful",
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

//-----------------------------------Get loggedin user details  /auth/fetchuserdata-------------------------------------------------

router.get("/fetchuserdata", fetchData, async (req, res) => {
  try {
    //In fetchData middleware jwt token is getting verified hence user payload is already extracted with req.user
    const userId = req.user;
    console.log(
      "User id in fetchuserdata router using fetchData middleware: ",
      userId
    );

    if (!userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    // Find user by ID and select only name and email
    const user = await User.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //Once the data get fetched the following message will be shown
    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
