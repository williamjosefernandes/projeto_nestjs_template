import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirestoreService } from './firestore.service';
import { FIREBASE_APP } from './firebase.constants';

@Module({
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): admin.app.App => {
        const serviceAccountBase64 = configService.getOrThrow<string>(
          'firebase.serviceAccountBase64',
        );
        const serviceAccount = JSON.parse(
          Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'),
        ) as admin.ServiceAccount;

        return admin.initializeApp({
          projectId: configService.getOrThrow<string>('firebase.projectId'),
          storageBucket: configService.getOrThrow<string>(
            'firebase.storageBucket',
          ),
          credential: admin.credential.cert(serviceAccount),
        });
      },
    },
    FirebaseAuthService,
    FirestoreService,
  ],
  exports: [FirebaseAuthService, FirestoreService],
})
export class FirebaseModule {}
