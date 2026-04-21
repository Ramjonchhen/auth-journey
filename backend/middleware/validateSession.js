const serverSession = require("../shared/sessions");

const validateSession = function (req, res, next) {
    const sessionId = req.headers['x-session-id'];
    const existingSession = serverSession[sessionId];

    if (existingSession) {
        req.user = existingSession;
        next();
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
}

module.exports = validateSession;