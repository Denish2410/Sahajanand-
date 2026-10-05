const admin = require('../../config/firebase');
const logger = require('../../utils/logger');

/**
 * Verify a Firebase ID token.
 * @param {string} idToken - The Firebase ID token from the client
 * @returns {Promise<import('firebase-admin').auth.DecodedIdToken>}
 */
async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (err) {
    logger.error(`Firebase token verification failed: ${err.message}`);
    throw err;
  }
}

/**
 * Revoke all refresh tokens for a user.
 * @param {string} uid - Firebase UID
 */
async function revokeRefreshTokens(uid) {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    logger.info(`Revoked refresh tokens for Firebase UID: ${uid}`);
  } catch (err) {
    logger.error(`Failed to revoke tokens for UID ${uid}: ${err.message}`);
  }
}

module.exports = { verifyIdToken, revokeRefreshTokens };
