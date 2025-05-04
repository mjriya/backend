import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: { type: String, default:"" },
    meta_title: { type: String },
    meta_description: { type: String },
    display_order: { type: Number },
    roles: {
      type: String,
      enum:["admin","editor","author"]
    },
    description: { type: String },
    hide_on_website: { type: Boolean, default: false },
    social_profiles: {
      twitter:"string",
      linkedin:"string",
      facebook:"string"
    },
    profile_picture: { type: String },
    password: { type: String, required: true }, 
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;
  }
  next();
});

const User = mongoose.model("User", UserSchema, "users");

export { User };
