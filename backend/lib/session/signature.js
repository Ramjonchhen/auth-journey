// create & verify signature for server side session auth

const env = require("../../config/env");
const crypto = require('node:crypto');

function createSessionSignature(sessionId) {    
    const hmac = crypto.createHmac("sha256", env.SESSION_SECRET);
    hmac.update(sessionId+"");
    const sessionSignature = hmac.digest("hex");
    return sessionSignature;
}

function verifySignature(sessionId, sessionSignature) {    
    return createSessionSignature(sessionId) === sessionSignature;
}

module.exports = {
    createSessionSignature,
    verifySignature
};              