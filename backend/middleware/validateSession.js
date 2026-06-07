const serverSession = require("../shared/sessions");
const { verifySignature } = require("../lib/session/signature");

const validateSession = function (req, res, next) {
    const sessionId = req.headers['x-session-id'];
    const clientSessionSignature = req.headers['x-session-signature'];
    if (!clientSessionSignature) {
        return res.status(401).json({ error: "Missing Session Header" });
    }

    const existingSession = serverSession[sessionId];

    if (existingSession) {
        const isSignatureVerfied = verifySignature(sessionId, clientSessionSignature);

        if (!isSignatureVerfied) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        req.user = existingSession;
        next();
    } else {
        return res.status(401).json({ error: "Not authenticated" });
    }
}

module.exports = validateSession;