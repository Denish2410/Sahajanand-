const { z } = require('zod');

const loginSchema = z.object({
  // No body needed — the Firebase ID token is in the Authorization header.
  // But we accept an optional body for future extension.
}).passthrough();

module.exports = { loginSchema };
