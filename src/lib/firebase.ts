import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

function initializeFirebaseAdmin() {
    // This prevents re-initialization in hot-reload environments
    if (admin.apps.length > 0) {
        return;
    }

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (e: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${e.message}`);
    }
}

initializeFirebaseAdmin();

export const getDb = () => {
    return admin.firestore();
};

export const getAdmin = () => {
    return admin;
};
