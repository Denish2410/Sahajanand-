const admin = require('firebase-admin');
const config = require('./env');

if (!admin.apps.length) {
  if (config.firebase.emulatorHost) {
    // Local development / end-to-end tests: the Admin SDK reads
    // FIREBASE_AUTH_EMULATOR_HOST itself and needs no service account.
    admin.initializeApp({ projectId: config.firebase.projectId });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  }
}

module.exports = admin;
