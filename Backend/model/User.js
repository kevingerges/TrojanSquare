const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "must provide fullname"],
  },
  email: {
    type: String,
    required: [true, "must provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "please provide valid email",
    ],
    unique: true,
  },
  type: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "must provide password"],
  },
  image: {
    type: String,
    default: "",
  },
  privacypolicy: {
    type: Boolean,
  },
  socketid: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,           // Add resetPasswordToken field
  resetPasswordExpires: Date,          // Add resetPasswordExpires field
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createjwt = function () {
  return jwt.sign(
    {
      id: this._id,
      fullName: this.fullName,
      email: this.email,
      imageurl: this.image,
    },
    "hacktech"
  );
};
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

UserSchema.methods.comparePassword = async function (enterPassword) {
  const isMatch = await bcrypt.compare(enterPassword, this.password); // Await the result
  return isMatch;
};

module.exports = mongoose.model("user", UserSchema);
