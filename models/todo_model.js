const mongoose = require("mongoose");
const validator = require("validator");

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required."],
    minlength: [5, "Title must be at least 5 characters long."],
    maxlength: [100, "Title must not exceed 100 characters."],
  },
  description: {
    type: String,
    required: [true, "Description is required."],
    minlength: [10, "Description must be at least 10 characters long."],
    maxlength: [500, "Description must not exceed 500 characters."],
  },
  status: {
    type: String,
    enum: ["pending", "completed", "deleted"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required."],
  },
});

todoSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.title = this.title.toLowerCase();
  }
  next();
});

todoSchema.pre("save", function (next) {
  if (this.isModified("description")) {
    this.description = this.description.toLowerCase();
  }
  next();
});

todoSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.status = this.status.toLowerCase();
  }
  next();
});

module.exports = mongoose.model("Todo", todoSchema);


