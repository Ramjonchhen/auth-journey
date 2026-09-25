const express = require("express");
const serverRoutes = express.Router();

const publicRoutes = require("./public");
const userRoutes = require("./user");
const authRoutes = require("./auth");
const notesRoutes = require("./notes");

serverRoutes.use(publicRoutes);
serverRoutes.use("/api/user",userRoutes);
serverRoutes.use("/api/auth", authRoutes);
serverRoutes.use("/api/notes", notesRoutes);

module.exports = serverRoutes;
