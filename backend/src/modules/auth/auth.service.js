const { User } = require('../../models');
const config = require('../../config/env');
const firebaseService = require('../../integrations/firebase/firebase.service');
const logger = require('../../utils/logger');

/**
 * Verify Firebase token and upsert the user in MongoDB.
 * Sets admin role if email is in ADMIN_EMAILS.
 *
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<object>} User document
 */
async function loginWithFirebase(idToken) {
  const decodedToken = await firebaseService.verifyIdToken(idToken);

  const { uid, name, email, picture, email_verified } = decodedToken;

  if (!email) {
    throw new Error('Email not available from Firebase token');
  }

  const isAdmin = config.adminEmails.includes(email.toLowerCase());

  const updateData = {
    firebaseUid: uid,
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    photoURL: picture || '',
    emailVerified: email_verified || false,
    lastLoginAt: new Date(),
  };

  // Only set role on first creation or if they're an admin email
  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    // New user
    updateData.role = isAdmin ? 'admin' : 'user';
    user = await User.create(updateData);
    logger.info(`New user created: ${email} (role: ${updateData.role})`);
  } else {
    // Existing user — update fields, promote to admin if in ADMIN_EMAILS
    if (isAdmin && user.role !== 'admin') {
      updateData.role = 'admin';
    }
    Object.assign(user, updateData);
    await user.save();
    logger.info(`User logged in: ${email}`);
  }

  return user;
}

/**
 * Get user profile by ID.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getUserProfile(userId) {
  return User.findById(userId);
}

/**
 * Logout — optionally revoke Firebase refresh tokens.
 * @param {string} firebaseUid
 */
async function logout(firebaseUid) {
  await firebaseService.revokeRefreshTokens(firebaseUid);
}

module.exports = { loginWithFirebase, getUserProfile, logout };
