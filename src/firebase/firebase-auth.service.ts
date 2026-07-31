import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseApp } from './firebase.service';

export interface FirebaseIdentity {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** Provedor que autenticou este login (ex.: 'google.com', 'github.com', 'phone', 'anonymous'). */
  signInProvider: string | null;
}

@Injectable()
export class FirebaseAuthService {
  private auth: admin.auth.Auth;

  constructor() {
    this.auth = firebaseApp.auth();
  }

  async createToken(uid: string): Promise<string> {
    return await this.auth.createCustomToken(uid);
  }

  /** Verifica o ID token e devolve a identidade nele contida — nunca confie em email/uid enviados pelo cliente. */
  async verifyIdToken(idToken: string): Promise<FirebaseIdentity | null> {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
        emailVerified: !!decodedToken.email_verified,
        phoneNumber: decodedToken.phone_number ?? null,
        displayName: (decodedToken as any).name ?? null,
        photoURL: (decodedToken as any).picture ?? null,
        signInProvider: (decodedToken.firebase as any)?.sign_in_provider ?? null,
      };
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return null;
    }
  }
}
