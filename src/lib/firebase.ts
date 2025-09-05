
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
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    // Throw an error if credentials are not available, which will be caught by Next.js error boundary
    throw new Error('Firebase environment variable FIREBASE_SERVICE_ACCOUNT_JSON is not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the app if it's not already initialized
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    return admin.firestore();
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    throw new Error("The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not valid JSON.");
  }
}

// Export a single instance of the database and collection
export const db = getDb();
export const pastesCollection = db.collection('pastes');
