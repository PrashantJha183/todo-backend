import Notes from "../models/notes.js";
import { body, validationResult } from "express-validator";
import { Router } from "express";
import fetchData from "../middleware/fetchData.js";
const router = Router();

//--------------------------Adding a notes notes/addnotes-----------------------------------------
router.post(
  "/task",
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
router.get("/task", fetchData, async (req, res) => {
  try {
    //Fetching userId from middleware (Payload already has userId)
    const userId = req.user;

    //Fetched all notes saved by logged in user
    const allNotes = await Notes.find({ user: userId }).sort({
      createdDate: -1,
    });

    //Remove _v field if there is any available
    const sanitizedNotes = allNotes.map((note) => {
      const { __v, ...rest } = note.toObject();
      return rest;
    });

    return res
      .status(200)
      .json({ message: "Notes fetched successfully", notes: sanitizedNotes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------------------------Update notes route /notes/task/{id}----------------------------------------------
router.put("/task/:id", fetchData, async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //FInd notes by ID from URL
    let taskNotes = await Notes.findById(req.params.id);
    if (!taskNotes) {
      return res.status(404).json("Not found");
    }

    //Compare loggedin userID with the note's user field
    if (taskNotes.user.toString() !== req.user) {
      return res.status(403).send("Access denied");
    }

    //Using object destructuring to get this data from object
    const { title, description, tags, dueDate } = req.body;

    //Prepare the updated fields only if provided in request
    const updateFields = {};

    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined)
      updateFields.description = description.trim();
    if (tags !== undefined) updateFields.tags = tags.trim();
    if (dueDate !== undefined) updateFields.dueDate = dueDate.trim();

    //Update the notes in the database
    const updateNotes = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Notes updated successfully",
      notes: updateNotes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.delete("/task/:id", fetchData, async (req, res) => {
  try {
    const noteId = req.params.id;

    // Validate that the id is a valid Mongo ObjectId
    if (!noteId || !noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    // Find note belonging to the logged-in user
    const note = await Notes.findOne({ _id: noteId, user: req.user });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    await note.deleteOne();

    return res.status(200).json({
      message: "Note deleted successfully",
      deletedNote: {
        id: note._id,
        title: note.title,
        description: note.description,
        dueDate: note.dueDate,
        tags: note.tags,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
