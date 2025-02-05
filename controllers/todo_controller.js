const User = require("../models/user_model");
const Todo = require("../models/todo_model");
const mongoose = require("mongoose");

const getAllTodoByUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized access." });
    }

    const todos = await Todo.find({ user: userId });
    if (todos.length === 0) {
      return res.status(404).json({ status: "error", message: "No todos found for this user." });
    }

    res.status(200).json({ status: "success", data: todos });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error", error: error.message });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized. User ID is required." });
    }

    if (!title || !description) {
      return res.status(400).json({ status: "error", message: "Title and description are required." });
    }

    const newTodo = new Todo({ title, description, status, user: userId });
    await newTodo.save();

    res.status(201).json({ status: "success", message: "Todo created successfully.", data: newTodo });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Could not create todo.", error: error.message });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid todo ID format." });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(id, { title, description, status }, { new: true });

    if (!updatedTodo) {
      return res.status(404).json({ status: "error", message: "Todo not found." });
    }

    res.status(200).json({ status: "success", message: "Todo updated successfully.", data: updatedTodo });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Could not update todo.", error: error.message });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid todo ID format." });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ status: "error", message: "Todo not found." });
    }

    res.status(200).json({ status: "success", data: todo });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Could not retrieve todo.", error: error.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid todo ID format." });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) {
      return res.status(404).json({ status: "error", message: "Todo not found or already deleted." });
    }

    res.status(200).json({ status: "success", message: "Todo deleted successfully." });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Could not delete todo.", error: error.message });
  }
};

module.exports = {
  getAllTodoByUser,
  createTodo,
  updateTodo,
  getTodoById,
  deleteTodo,
};
