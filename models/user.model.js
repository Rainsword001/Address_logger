import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match:[/\S+.\S+@\S./],
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["admin", "agent", "viewer"],
      default: "agent"
    }
  },
  { timestamps: true }
);



export default mongoose.model("User", UserSchema);
