const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URLS: z.string().min(1, 'CLIENT_URLS is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_CLIENT_EMAIL is required'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // Admin
  ADMIN_EMAILS: z.string().default(''),

  // Business
  ENABLE_COD: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  FREE_DELIVERY_ABOVE: z.coerce.number().int().nonnegative().default(10000),
  DELIVERY_CHARGE: z.coerce.number().int().nonnegative().default(500),
  GST_INCLUSIVE: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),

  // SMTP (optional)
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(0),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map(
    (issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`
  );
  console.error('❌ Environment validation failed:\n' + errors.join('\n'));
  console.error('\nPlease check your .env file. See .env.example for reference.');
  process.exit(1);
}

const env = parsed.data;

/**
 * Frozen configuration object derived from environment variables.
 * All config access should go through this object.
 */
const config = Object.freeze({
  env: env.NODE_ENV,
  port: env.PORT,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  clientUrls: env.CLIENT_URLS.split(',').map((u) => u.trim()).filter(Boolean),

  mongo: {
    uri: env.MONGODB_URI,
  },

  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },

  razorpay: {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  adminEmails: env.ADMIN_EMAILS
    ? env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [],

  business: {
    enableCod: env.ENABLE_COD,
    freeDeliveryAbove: env.FREE_DELIVERY_ABOVE,
    deliveryCharge: env.DELIVERY_CHARGE,
    gstInclusive: env.GST_INCLUSIVE,
  },

  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },
});

module.exports = config;
