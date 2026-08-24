const express = require("express");
const userRoutes = express.Router();

const users = require("../constants");
const validateSession = require('../middleware/validateSession');

userRoutes.get("/balance", validateSession, (req, res) => {
    const reqUser = req.user;
    let user = users.find((u) => u.username === reqUser.username);
    res.json({ balance: user.balance, currency: user.currency });
})

userRoutes.get("/me", validateSession, (req, res) => {
    const reqUser = req.user;
    let user = users.find((u) => u.username === reqUser.username);
    res.json({ username: user.username, balance: user.balance, currency: user.currency });
})

module.exports = userRoutes;