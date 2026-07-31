import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  /** JSON completo da service account do Firebase Admin SDK, em base64. Nunca commitar o valor decodificado. */
  serviceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
}));
