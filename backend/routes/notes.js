const express = require("express");
const validateSession = require("../middleware/validateSession");
const notesRoutes = express.Router();

// server memory notes
const notes = [];

notesRoutes.post("/", validateSession, (req, res) => {
    const { title, content } = req.body;

    let validationErrors = [];

    if (!title) {
        validationErrors.push("Missing Title on req body");
    }

    if (!content) {
        validationErrors.push("Missing Content on req body");
    }

    if (title && (title.length < 2 || title.length > 20)) {
        validationErrors.push("Note Title must be within 2 to 20 characters");
    }

    if (content && (content.length < 2 || content.length > 100)) {
        validationErrors.push("Note Content must be within 2 to 100 characters");
    }

    if (validationErrors.length > 0) {
        return res.status(400).json({ message: validationErrors.join(", ") });
    }

    const username = req.user.username;
    const note = { id: notes.length + 1, title, content, username };
    notes.push(note);
    res.json({ data: note, message: "Note created successfully", status: "success" });
});

notesRoutes.get("/", validateSession, (_, res) => {
    res.json({ data: notes, message: "Notes fetched successfully", status: "success" });
});

module.exports = notesRoutes;