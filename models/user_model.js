const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z ]+$/.test(name);
      },
      message: "Name should only contain letters and spaces",
    },
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Email is not valid",
    },
    lowercase: true, 
  },
  Password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (password) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
      },
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  token: {  
    type: String,
    default: null,
  }
});


userSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    console.log("Hashing password before saving:", this.Password);
    this.Password = await bcrypt.hash(this.Password, 10);
  }
  next();
});


userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.Password);
};


userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ id: this._id, email: this.Email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  this.token = token; 
  return token;
};

module.exports = mongoose.model("User", userSchema);
