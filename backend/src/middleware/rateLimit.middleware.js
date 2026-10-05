const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const WINDOW_MS = 15 * 60 * 1000;

const limiter = (max, message) =>
  rateLimit({
    windowMs: WINDOW_MS,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Automated tests fire many requests from one address
    skip: () => config.isTest,
    message: {
      success: false,
      message,
    },
  });

/**
 * Global rate limiter: 600 requests per 15 minutes per IP.
 * A storefront page view makes several API calls, and offices share one IP.
 */
const globalLimiter = limiter(600, 'Too many requests, please try again later.');

/**
 * Auth endpoints rate limiter: 20 requests per 15 minutes per IP.
 */
const authLimiter = limiter(20, 'Too many authentication attempts. Please try again later.');

/**
 * Payment endpoints rate limiter: 30 requests per 15 minutes per IP.
 */
const paymentLimiter = limiter(30, 'Too many payment requests. Please try again later.');

/**
 * Order placement: 20 per 15 minutes per IP.
 */
const checkoutLimiter = limiter(20, 'Too many orders in a short time. Please try again later.');

/**
 * Public quote requests: 10 per 15 minutes per IP (spam protection).
 */
const enquiryLimiter = limiter(10, 'Too many enquiries in a short time. Please try again later.');

/**
 * Admin endpoints rate limiter: 600 requests per 15 minutes per IP.
 */
const adminLimiter = limiter(600, 'Too many admin requests. Please try again later.');

module.exports = {
  globalLimiter,
  authLimiter,
  paymentLimiter,
  checkoutLimiter,
  enquiryLimiter,
  adminLimiter,
};
