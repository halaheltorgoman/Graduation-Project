const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    buildId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Build",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);