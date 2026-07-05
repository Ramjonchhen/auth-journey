const express = require("express");
const crypto = require("crypto");
const authRoutes = express.Router();

const serverSession = require("../shared/sessions");
const users = require("../constants");

const { createSessionSignature } = require("../lib/session/signature");

authRoutes.post("/login", (req, res) => {
    const username = req?.body?.username;
    const password = req?.body?.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Missing Required Parameters for Login !!!" })
    }

    // finding appropriate user from the list
    const user = users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ message: "Invalid username or password!!!" })
    }

    // checking correctness for user password
    if (password !== user.password) {
        return res.status(404).json({ message: "Invalid username or password!!!" })
    }

    // for successful login, creating a user session

    // for various use-cases throughout the journey, use the appropriate sessionId format
    // linear sessionId is used for testing purposes, 
    // cryptographic sessionId is used to provide extra security for sessions
    // for the latest session experiment, the cryptographic sessionId is used
    // use appropriate sessionId format accordingly 

    // const sessionId = Object.keys(serverSession).length + 1; // Linear Sequential ID
    const sessionId = crypto.randomBytes(16).toString('hex'); // Cryptographic Random ID
    serverSession[sessionId] = {
        userId: user.id,
        username: user.username,
    };

    // creating sessionSignature for the session
    const sessionSignature = createSessionSignature(sessionId);
    return res.json({
        sessionId,
        sessionSignature,
    })
});

module.exports = authRoutes;