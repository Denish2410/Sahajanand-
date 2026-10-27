const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const config = require('./env');
const logger = require('../utils/logger');

if (getApps().length === 0) {
  try {
    if (config.firebase.emulatorHost) {
      // Local development / end-to-end tests: the Admin SDK reads
      // FIREBASE_AUTH_EMULATOR_HOST itself and needs no service account.
      initializeApp({ projectId: config.firebase.projectId });
    } else {
      let privateKey = config.firebase.privateKey;
      if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey,
        }),
      });
      logger.info('Firebase Admin initialized successfully');
    }
  } catch (err) {
    logger.error(`Firebase Admin initialization failed: ${err.message}`);
    if (config.isProduction) {
      throw err;
    }
  }
}

module.exports = { auth: () => getAuth() };
