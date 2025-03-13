const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");



const userSchema = new mongoose.Schema(
  {
   
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
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
      { item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel',
      },

      onModel: {
        type: String,
        required: true,
        enum: ['Cooling', 'GPU', 'CPU','Memory','MotherBoard','Case','PSU','Storage'] 
      }}
     ]
      
    ,
    savedBuilds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Build",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);



// if username is not set
userSchema.pre("validate", function (next) { //middleware
  if (!this.username) {
    this.username = this.email.split("@")[0]; 
  }
  next();
});
// hash password before saving
userSchema.pre("save", async function (next) { //use of regular func not arrow (this)
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare password for login
userSchema.methods.comparePassword = async function (userpassword) { // custom instance method
  return await bcrypt.compare(userpassword, this.password); 
};

module.exports = mongoose.model("User", userSchema);  