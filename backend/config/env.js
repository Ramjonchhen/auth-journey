const { z } = require("zod");

const envSchema = z.object({
    PORT: z.coerce.number(),
    SESSION_SECRET: z.string(),
    FRONTEND_URL: z.url(),
});

const env = envSchema.parse(process.env);

module.exports = env;