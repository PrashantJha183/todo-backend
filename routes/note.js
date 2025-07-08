import Notes from "../models/notes.js";
import { body, validationResult } from "express-validator";
import { Router } from "express";
import fetchData from "../middleware/fetchData.js";

const router = Router();

//-------------------------- Add a new note - POST /notes/task --------------------------
router.post(
  "/task",
  fetchData,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters long"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),

    body("dueDate")
      .notEmpty()
      .withMessage("Due date cannot be empty")
      .isISO8601()
      .withMessage("Due date must be a valid date"),

    body("tags").optional().trim(),

    body("status")
      .optional()
      .isIn(["pending", "completed", "in-progress"])
      .withMessage("Invalid status value"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, dueDate, tags, status } = req.body;
      const userId = req.user;

      const existingNote = await Notes.findOne({ user: userId, title });

      if (existingNote) {
        return res
          .status(400)
          .json({ message: "You already have a note with this title" });
      }

      const newNote = new Notes({
        user: userId,
        title,
        description,
        dueDate,
        tags: tags || "",
        status: status || "pending",
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
          status: newNote.status,
        },
      });
    } catch (error) {
      console.error("POST /task error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

//-------------------------- Get all notes - GET /notes/task --------------------------
router.get("/task", fetchData, async (req, res) => {
  try {
    const userId = req.user;

    const allNotes = await Notes.find({ user: userId }).sort({
      createdDate: -1,
    });

    const sanitizedNotes = allNotes.map((note) => {
      const { __v, ...rest } = note.toObject();
      return rest;
    });

    res.status(200).json({
      message: "Notes fetched successfully",
      notes: sanitizedNotes,
    });
  } catch (error) {
    console.error("GET /task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//-------------------------- Update a note - PATCH /notes/task/:id --------------------------
router.patch("/task/:id", fetchData, async (req, res) => {
  try {
    const noteId = req.params.id;

    const taskNote = await Notes.findById(noteId);
    if (!taskNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (taskNote.user.toString() !== req.user) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Determine fields to update
    const updateFields = {};
    const allowedFields = ["title", "description", "tags", "dueDate", "status"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // If no fields provided, do nothing
    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        message: "No fields provided to update. Note remains unchanged.",
        note: taskNote,
      });
    }

    const updatedNote = await Notes.findByIdAndUpdate(
      noteId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("PATCH /task/:id error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//-------------------------- Delete a note - DELETE /notes/task/:id --------------------------
router.delete("/task/:id", fetchData, async (req, res) => {
  try {
    const noteId = req.params.id;

    if (!noteId || !noteId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Notes.findOne({ _id: noteId, user: req.user });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or unauthorized" });
    }

    await note.deleteOne();

    res.status(200).json({
      message: "Note deleted successfully",
      deletedNote: {
        id: note._id,
        title: note.title,
        description: note.description,
        dueDate: note.dueDate,
        tags: note.tags,
        status: note.status,
      },
    });
  } catch (error) {
    console.error("DELETE /task/:id error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
