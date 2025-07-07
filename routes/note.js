import Notes from "../models/notes.js";
import { body, validationResult } from "express-validator";
import { Router } from "express";
import fetchData from "../middleware/fetchData.js";
import dotenv from "dotenv";
const router = Router();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not found in environment varaibale");
}
//--------------------------Adding a notes notes/addnotes-----------------------------------------
router.post(
  "/addnotes",
  fetchData,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 2 })
      .withMessage("Title must be 2 characters long"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description cannnot empty")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),
    body("dueDate")
      .notEmpty()
      .withMessage("Due date cannnot empty")
      .isISO8601()
      .withMessage("Due date must be valid date"),

    body("tags").optional().trim(),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //Using object destucturing to extract data from object
      const { title, description, dueDate, tags } = req.body;

      //User Id from extratced from jwt token decoded by middleware
      const userId = req.user;
      console.log("User Id: ", userId);

      //Verifying that the notes is already exsists for the loggedin user with the same title
      const exsistingNotes = await Notes.findOne({
        user: userId,
        title: title,
      });

      if (exsistingNotes) {
        return res
          .status(400)
          .json({ message: "You already have a note with this title" });
      }

      //If notes are not available then create a notes and save new notes
      const newNote = new Notes({
        user: userId,
        title,
        description,
        dueDate: dueDate || undefined,
        tags: tags || "",
      });

      await newNote.save();

      res.status(201).json({
        message: "Note created successfully",
        note: {
          id: newNote._id,
          title: newNote.title,
          description: newNote.description,
          dueDate: newNote.dueDate,
          tags: newNote.tags,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

//----------------------------Fetched saved notes notes/savednotes-----------------------------------------
router.get("/savednotes", fetchData, async (req, res) => {
  try {
    //Fetching userId from middleware (Payload already has userId)
    const userId = req.user;

    //Fetched all notes saved by logged in user
    const allNotes = await Notes.find({ user: userId }).sort({
      createdDate: -1,
    });

    //Remove _v field if there is any available
    const sanitizedNotes = allNotes.map((note) => {
      const { _v, ...rest } = note.toObject();
      return rest;
    });

    return res
      .status(200)
      .json({ message: "Notes fetched successfully", notes: sanitizedNotes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
