const express = require("express");
const authRoutes = express.Router();

const serverSession = require("../shared/sessions");
const users = require("../constants");

authRoutes.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Missing Required Parameters for Login !!!" })
    }

    // finding appropriate user from the list
    const user = users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "Invaid username or password!!!" })
    }

    // checking correctness for user password
    if (password !== user.password) {
        return res.status(404).json({ message: "Invaid username or password!!!" })
    }

    // for successfull login creating user session
    const sessionId = Object.keys(serverSession).length + 1;
    serverSession[sessionId] = {
        userId: user.id,
        username: user.username,
    };

    return res.json({ sessionId });
});

module.exports = authRoutes;