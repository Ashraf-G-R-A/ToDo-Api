require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;
const httpStatus = require("./utils/StatusText.js");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser"); 
const verifyToken = require("./models/verifyToken"); 
connectDB();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
// app.use(verifyToken);

app.use("/api/users", require("./Routes/userRoute.js"));
app.use("/api/todo", require("./Routes/todoRoute.js"));

const PORT = process.env.PORT 

app.all("*", (req, res) => {
    res
      .status(404)
      .json({ status: httpStatus.ERROR, message: "Route not found" });
});

app.use((err, req, res, next) => {
    res.status(500).json({ status: httpStatus.ERROR, message: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
