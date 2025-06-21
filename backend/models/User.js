const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    bio: { type: String, default: "Available" },
    avatar: {
      public_id: String,
      url: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    favorites: [
      {
        //fav components
        componentType: { type: String },
        componentId: { type: mongoose.Schema.Types.ObjectId },
        _id: false,
      },
    ],

    // ADD THIS: savedGuides array for saving guides
    savedGuides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guide",
      },
    ],

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
      },
    ],
    builds: [
      {
        //saved own builds
        type: Schema.Types.ObjectId,
        ref: "Build",
      },
    ],

    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpiredAt: { type: String, default: 0 },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.index({
  username: "text",
});

module.exports = mongoose.model("User", userSchema);
