import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_APP } from './firebase.constants';

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
  private readonly logger = new Logger(FirebaseAuthService.name);
  private auth: admin.auth.Auth;

  constructor(@Inject(FIREBASE_APP) firebaseApp: admin.app.App) {
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
        signInProvider:
          (decodedToken.firebase as any)?.sign_in_provider ?? null,
      };
    } catch (error) {
      const code = this.extractFirebaseErrorCode(error);
      if (code?.startsWith('auth/')) {
        this.logger.warn(`ID token do Firebase inválido/expirado: ${code}`);
        return null;
      }
      this.logger.error(
        'Erro inesperado ao verificar ID token do Firebase',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private extractFirebaseErrorCode(error: unknown): string | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    ) {
      return (error as { code: string }).code;
    }
    return undefined;
  }
}
