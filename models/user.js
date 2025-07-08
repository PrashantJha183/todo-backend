import mongoose from "mongoose";
import { Schema } from "mongoose";

// Helper to get current IST Date
function getISTDate() {
  const currentUTC = new Date();
  const istOffsetMinutes = 330; // IST = UTC + 5:30
  return new Date(currentUTC.getTime() + istOffsetMinutes * 60000);
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be atleast 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be 8 characters long"],
    },

    date: {
      type: Date,
      default: getISTDate,
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

// Remove sensitive data from output JSON
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.models.user || mongoose.model("user", UserSchema);

export default User;
