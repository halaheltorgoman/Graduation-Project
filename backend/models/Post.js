// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const PostsSchema = new Schema({
//   build: {
//     type: Schema.Types.ObjectId,
//     ref: "Build",
//     // required: true,
//   },
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//   },
//   description: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   ratings: [
//     {
//       user: { type: Schema.Types.ObjectId, ref: "User" },
//       value: { type: Number, min: 1, max: 5 },
//     },
//   ],
//   comments: [
//     {
//       user: { type: Schema.Types.ObjectId, ref: "User" },
//       text: String,
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   averageRating: { type: Number, default: 0 },
//   savesCount: { type: Number, default: 0 },
//   shareCount: { type: Number, default: 0 },
//   viewCount: { type: Number, default: 0 },
//   images: [{ type: String }],
// });

// //calculate avg rating before saving into database through pre-save hook
// //this => refers to current document
// // next is called when mongoose middleware is done so save can proceed
// //postSchema.pre(save , (next)=>{}) => is a mongoose middleware hook that runs before a Post document is saved
// PostsSchema.pre("save", function (next) {
//   if (this.ratings.length > 0) {
//     let sum = 0;
//     for (let i = 0; i < this.ratings.length; i++) {
//       sum += this.ratings[i].value;
//     }
//     this.averageRating = sum / this.ratings.length;
//   } else {
//     this.averageRating = 0;
//   }
//   next();
// });

// module.exports = mongoose.model("Post", PostsSchema);
//latest update
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const PostsSchema = new Schema({
//   build: {
//     type: Schema.Types.ObjectId,
//     ref: "Build",
//     // required: true,
//   },
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//   },
//   description: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   ratings: [
//     {
//       user: { type: Schema.Types.ObjectId, ref: "User" },
//       value: { type: Number, min: 1, max: 5 },
//     },
//   ],
//   comments: [
//     {
//       user: { type: Schema.Types.ObjectId, ref: "User" },
//       text: String,
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
//   averageRating: { type: Number, default: 0 },
//   savesCount: { type: Number, default: 0 },
// });

// module.exports = mongoose.model("Post", PostsSchema);
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
