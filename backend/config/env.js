const { z } = require("zod");

const envSchema = z.object({
    SESSION_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

module.exports = env;