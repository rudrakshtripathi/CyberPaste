import { config } from 'dotenv';
config(); // Load environment variables from .env file

import admin from 'firebase-admin';

// Function to get the initialized Firestore instance
function getDb() {
  // If the app is already initialized, return the firestore instance
  if (admin.apps.length) {
    return admin.firestore();
  }

  // Check if the required environment variables are set
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Throw an error if credentials are not available, which will be caught by Next.js error boundary
    throw new Error('Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set.');
  }

  // Initialize the app if it's not already initialized
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    // Log the specific initialization error for easier debugging
    console.error('Firebase admin initialization error:', error.message);
    // Re-throw to prevent the app from continuing in a broken state
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
  
  return admin.firestore();
}

// Export a single instance of the database and collection
export const db = getDb();
export const pastesCollection = db.collection('pastes');