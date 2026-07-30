import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseApp } from './firebase.service';

@Injectable()
export class FirebaseAuthService {
  private auth: admin.auth.Auth;

  constructor() {
    this.auth = firebaseApp.auth();
  }

  async createToken(uid: string): Promise<string> {
    return await this.auth.createCustomToken(uid);
  }

  async verifyIdToken(idToken: string): Promise<string | null> {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return decodedToken.uid;
      // ...
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return null;
    }
  }
}
