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
      enum: [
        "Gaming",
        "Workstation",
        "Budget",
        "High-End",
        "Streaming",
        "Content Creation",
      ],
    },
    genre: {
      type: String,
      required: true,
    },
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
      fps: Number,
      resolution: String,
      settings: String,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
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
    ratings: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
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
  // This method will be called from the controller
  // We'll update the savesCount here
  const currentSavesCount = this.savesCount || 0;

  // The actual save/unsave logic is handled in the controller
  // This method just helps with the count logic
  if (this._currentUserId && this._toggleAction === "save") {
    this.savesCount = currentSavesCount + 1;
    return true;
  } else if (this._currentUserId && this._toggleAction === "unsave") {
    this.savesCount = Math.max(0, currentSavesCount - 1);
    return false;
  }

  return false;
};

// Method to add/update rating
guideSchema.methods.addRating = function (userId, value, review = "") {
  const existingRatingIndex = this.ratings.findIndex(
    (rating) => rating.user.toString() === userId.toString()
  );

  if (existingRatingIndex !== -1) {
    // Update existing rating
    this.ratings[existingRatingIndex].value = value;
    this.ratings[existingRatingIndex].review = review;
  } else {
    // Add new rating
    this.ratings.push({
      user: userId,
      value,
      review,
    });
  }

  // Recalculate average rating
  const totalRating = this.ratings.reduce(
    (sum, rating) => sum + rating.value,
    0
  );
  this.averageRating = totalRating / this.ratings.length;
};

// Index for efficient querying
guideSchema.index({ category: 1, status: 1, isApproved: 1 });
guideSchema.index({ creator: 1 });
guideSchema.index({ averageRating: -1 });
guideSchema.index({ savesCount: -1 });
guideSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Guide", guideSchema);
