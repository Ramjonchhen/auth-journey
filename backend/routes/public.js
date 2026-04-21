const express = require("express");
const publicRoutes = express.Router();

publicRoutes.get('/public', (req, res) => {
    res.json({ message: "This is public data", data: "anyone can see this" });
})

module.exports = publicRoutes;