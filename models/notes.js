import mongoose from "mongoose";
import { Schema } from "mongoose";

/**
 * Helper function to get current date-time in IST.
 * Returns a native JavaScript Date object representing IST time.
 */
function getISTDate() {
  const currentUTC = new Date();
  const istOffsetMinutes = 330; // IST is UTC+5:30
  const istTime = new Date(currentUTC.getTime() + istOffsetMinutes * 60000);
  return istTime;
}

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

    status: {
      type: String,
      enum: ["pending", "completed", "in-progress"],
      default: "pending",
    },

    createdDate: {
      type: Date,
      default: getISTDate,
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
