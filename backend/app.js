const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");  
const authRoutes =  require("./routes/routesauth")
const postRoutes =  require("./routes/routesPost")
const userRoutes =  require("./routes/routesUser")

require("dotenv").config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
// Allow larger payloads for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
 
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
 

module.exports = app;
