import mongoose from "mongoose";
import { Schema } from "mongoose";

const NotesSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      match: [/^[\w\s.,!?-]+$/, "Title contains invalid characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [5, "Description must be at least 5 characters long"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    tags: {
      type: String,
      trim: true,
      default: "",
      maxlength: [50, "Tags cannot exceed 50 characters"],
      match: [/^[\w\s.,!?-]+$/, "Tags contains invalid characters"],
    },

    createdDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
  },
  { collection: "notes", timestamps: true }
);

// Hide __v from output
NotesSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

// Safe model export
const Notes = mongoose.models.notes || mongoose.model("notes", NotesSchema);

export default Notes;
