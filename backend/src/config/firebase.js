const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const config = require('./env');

if (getApps().length === 0) {
  if (config.firebase.emulatorHost) {
    // Local development / end-to-end tests: the Admin SDK reads
    // FIREBASE_AUTH_EMULATOR_HOST itself and needs no service account.
    initializeApp({ projectId: config.firebase.projectId });
  } else {
    initializeApp({
      credential: cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  }
}

module.exports = { auth: () => getAuth() };
