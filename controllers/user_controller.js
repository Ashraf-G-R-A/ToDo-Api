const User = require("../models/user_model");
const httpStatus = require("../utils/StatusText");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { __v: false });
    res.json({
      status: "success",
      data: {
        users: users.map((user) => ({
          id: user._id,
          name: user.Name,
          email: user.Email,
          token: user.token,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID" });
    }

    const user = await User.findById(id, { __v: false });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({
      status: "success",
      data: {
        id: user._id,
        name: user.Name,
        email: user.Email,
        token: user.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }

    const { name, email, password } = req.body;
    const newUser = await new User({
      Name: name,
      Email: email.toLowerCase(),
      Password: password,
    }).save();

    res.status(201).json({ status: "success", data: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is already registered" });
    }
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ Email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.token = token;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.Name,
        email: user.Email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Logged-in user ID from token

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID format." });
    }

    if (id !== userId) {
      return res
        .status(403)
        .json({
          status: "error",
          message: "You can only update your own account.",
        });
    }

    if (req.body.token) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Token cannot be manually updated.",
        });
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found." });
    }

    res.json({
      status: "success",
      message: "User updated successfully.",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Logged-in user ID from token

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID format." });
    }

    if (id !== userId) {
      return res
        .status(403)
        .json({
          status: "error",
          message: "You can only delete your own account.",
        });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found." });
    }

    res.json({ status: "success", message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
};
