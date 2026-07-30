import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirestoreService } from './firestore.service';

@Module({
  providers: [FirebaseAuthService, FirestoreService],
  exports: [FirebaseAuthService, FirestoreService],
})
export class FirebaseModule {}
