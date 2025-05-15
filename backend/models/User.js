const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const {Schema} = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    bio: {
    type: String,
    maxlength: 150
  },
     avatar: {
    public_id: String,  
    url: String         
  } ,
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
    enum: ["user", "admin", "guidecreator"], 
    default: "user"
  },
   
      favorites: [{ //fav components
        componentType: { type: String },
        componentId: { type: mongoose.Schema.Types.ObjectId },
        _id: false
      }],
      

     savedGuides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Build'
  }], 

      savedPosts: [{ type: Schema.Types.ObjectId, ref: 'CommunityPost' }], //saved posts from community

      builds: [{ //user's compeleted builds
        type: Schema.Types.ObjectId,
        ref: 'Build'
      }],

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
  username: 'text'
});
module.exports = mongoose.model("User", userSchema);


// if username is not set
/*userSchema.pre("validate", function (next) { //middleware
  if (!this.username) {
    this.username = this.email.split("@")[0]; 
  }
  next();
});

 /* userSchema.pre("save", async function (next) { 
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


/* userSchema.methods.comparePassword = async function (userpassword) { // custom instance method
  return await bcrypt.compare(userpassword, this.password); 
};

module.exports = mongoose.model("User", userSchema);  
// userSchema.pre("validate", function (next) {
//   //middleware
//   if (!this.username) {
//     this.username = this.email.split("@")[0];
//   }
//   next();
// });
// // hash password before saving
// userSchema.pre("save", async function (next) {
//   //use of regular func not arrow (this)
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

//  // // compare password for login
// userSchema.methods.comparePassword = async function (userpassword) {
//  // // custom instance method
//   return await bcrypt.compare(userpassword, this.password);
// }; */
