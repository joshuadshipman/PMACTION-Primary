import admin from 'firebase-admin';

/**
 * Firebase Admin SDK initialization for server-side operations.
 * Bypasses Security Rules for migration and automated tasks.
 */
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    if (serviceAccount.project_id) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
        console.log("🔥 Firebase Admin Initialized");
    } else {
        console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid. Admin operations will fail.");
    }
}

const firestoreAdmin = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestoreAdmin, authAdmin };
