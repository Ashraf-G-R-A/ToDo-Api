const express = require("express");
const todoController = require("../controllers/todo_controller");
const verifyToken = require("../models/verifyToken");

const router = express.Router();

router.post("/add", verifyToken, todoController.createTodo);

router.get("/user/:userId", verifyToken, todoController.getAllTodoByUser);

router.get("/:id", verifyToken, todoController.getTodoById);
router.patch("/:id", verifyToken, todoController.updateTodo);
router.delete("/:id", verifyToken, todoController.deleteTodo);

module.exports = router;
