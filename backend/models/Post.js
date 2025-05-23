const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  build: {
    type: Schema.Types.ObjectId,
    ref: "Build",
    // required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: String,
  images: [
    {
      public_id: String,
      url: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ratings: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      value: { type: Number, min: 0.5, max: 5 },
    },
  ],
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Posts", PostSchema);
