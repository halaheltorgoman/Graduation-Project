const mongoose = require("mongoose");
const { Schema } = mongoose;

const guideSchema = new Schema(
  {
    build: {
      type: Schema.Types.ObjectId,
      ref: "Build",
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: ["Gaming", "Workstation", "Budget", "Development"],
    },
    // Removed genre field - everything now depends on category
    tags: [String],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    estimatedBuildTime: {
      type: String,
      default: "2-4 hours",
    },
    performance: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
    // Updated ratings structure to match community Post schema
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 0.5, max: 5 },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to toggle save status and update save count
guideSchema.methods.toggleSave = function (userId) {
  const currentSavesCount = this.savesCount || 0;
  if (this._currentUserId && this._toggleAction === "save") {
    this.savesCount = currentSavesCount + 1;
    return true;
  } else if (this._currentUserId && this._toggleAction === "unsave") {
    this.savesCount = Math.max(0, currentSavesCount - 1);
    return false;
  }
  return false;
};

// Index for efficient querying
guideSchema.index({ category: 1, status: 1, isApproved: 1 });
guideSchema.index({ creator: 1 });
guideSchema.index({ averageRating: -1 });
guideSchema.index({ savesCount: -1 });
guideSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Guide", guideSchema);
