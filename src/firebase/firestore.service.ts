import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseApp } from './firebase.service';
import { firestore } from 'firebase-admin';

@Injectable()
export class FirestoreService {
  db: admin.firestore.Firestore;

  constructor() {
    this.db = firebaseApp.firestore();
  }

  async getOne(collectionPath: string, documentId: string): Promise<any> {
    const docRef = this.db.collection(collectionPath).doc(documentId);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      return { id: docSnapshot.id, ...docSnapshot.data() };
    } else {
      return null;
    }
  }

  async getOneByField(
    collectionPath: string,
    fieldName: string,
    fieldValue: any,
  ): Promise<any | null> {
    const query = this.db
      .collection(collectionPath)
      .where(fieldName, '==', fieldValue);
    const snapshot = await query.get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return null;
    }
  }

  /**
   * Obtém um documento de uma coleção com base em um campo específico.
   * @param collectionPath O caminho da coleção no Firestore.
   * @param fields
   * @returns Um objeto representando o documento encontrado ou null se não houver correspondência.
   */
  async getOneByFields(
    collectionPath: string,
    fields: { name: string; value: any }[],
  ): Promise<any | null> {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      this.db.collection(collectionPath);

    for (const field of fields) {
      query = query.where(field.name, '==', field.value);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async getOneFilters(
    collectionPath: string,
    documentId: string,
    filters: {
      field: string;
      operator: '==' | '<' | '<=' | '>' | '>=';
      value: any;
    }[],
  ): Promise<any | null> {
    let query: admin.firestore.Query = this.db.collection(collectionPath);

    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs.find((d) => d.id === documentId);

    if (doc) {
      return { id: doc.id, ...doc.data() };
    }

    return null;
  }
  async getOneFiltersNoId(
    collectionPath: string,
    filters: {
      field: string;
      operator: '==' | '<' | '<=' | '>' | '>=';
      value: any;
    }[],
  ): Promise<any | null> {
    let query: admin.firestore.Query = this.db.collection(collectionPath);

    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return null;
    }

    // Se houver documentos correspondentes aos filtros, retornar o primeiro
    const doc = snapshot.docs[0];

    return { id: doc.id, ...doc.data() };
  }

  async getAll(
    collectionPath: string,
    p: (string | string[])[],
  ): Promise<any[]> {
    const snapshot = await this.db.collection(collectionPath).get();
    const documents: any[] = [];

    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return documents;
  }

  async getAllFilters(
    collectionPath: string,
    filters: {
      field: string;
      operator: '==' | '<' | '<=' | '>' | '>=';
      value: any;
    }[],
  ): Promise<any> {
    let query: admin.firestore.Query = this.db.collection(collectionPath);

    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    const snapshot = await query.get();
    const documents: any = [];

    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return documents;
  }

  async create(collectionPath: string, data: any): Promise<string> {
    const docRef = await this.db.collection(collectionPath).add(data);
    return docRef.id;
  }

  async createWithId(
    collectionPath: string,
    documentId: string,
    data: any,
  ): Promise<void> {
    const docRef = this.db.collection(collectionPath).doc(documentId);
    await docRef.set(data);
  }

  async arrayUnion(
    collection: string,
    documentId: string,
    field: string,
    values: any[],
  ): Promise<void> {
    const documentRef = admin
      .firestore()
      .collection(collection)
      .doc(documentId);

    await documentRef.set(
      { [field]: admin.firestore.FieldValue.arrayUnion(...values) },
      { merge: true },
    );
  }

  async arrayRemove(
    collection: string,
    documentId: string,
    field: string,
    values: any[],
  ): Promise<void> {
    try {
      const documentRef = this.db.collection(collection).doc(documentId);
      await documentRef.update({
        [field]: firestore.FieldValue.arrayRemove(...values),
      });
    } catch (error) {
      throw new Error(`Error performing arrayRemove: ${error}`);
    }
  }

  async update(
    collectionPath: string,
    documentId: string,
    data: Partial<any>,
  ): Promise<void> {
    const docRef = this.db.collection(collectionPath).doc(documentId);
    await docRef.update(data);
  }

  async delete(collectionPath: string, documentId: string): Promise<void> {
    const docRef = this.db.collection(collectionPath).doc(documentId);
    await docRef.delete();
  }

  async deleteMany(
    collection: string,
    field: string,
    value: any,
    targetCollection: string = null,
  ): Promise<void> {
    const querySnapshot = await this.db
      .collection(collection)
      .where(field, '==', value)
      .get();

    const batch = this.db.batch();

    querySnapshot.forEach((doc) => {
      // Exclui o documento da coleção fornecida ou da coleção original
      const collectionRef = targetCollection
        ? this.db.collection(targetCollection)
        : doc.ref.parent;
      const documentRef = collectionRef.doc(doc.id);

      batch.delete(documentRef);
    });

    await batch.commit();
  }

  // Real-time updates with Firestore's onSnapshot
  async onSnapshot(
    collectionPath: string,
    callback: (docs: any) => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const collectionRef = this.db.collection(collectionPath);

      return collectionRef.onSnapshot((snapshot) => {
        const documents: any = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });

        callback(documents);
        resolve();
      });
    });
  }

  // Query with filters, sorting, and pagination
  async query(
    collectionPath: string,
    filters: {
      field: string;
      operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains';
      value: any;
    }[],
    orderBy: string,
    limit: number,
    startAfter?: admin.firestore.DocumentSnapshot,
  ): Promise<any> {
    let query: admin.firestore.Query = this.db.collection(collectionPath);

    for (const filter of filters) {
      query = query.where(
        filter.field,
        filter.operator,
        filter.value,
      ) as admin.firestore.Query;
    }

    if (orderBy) {
      query = query.orderBy(orderBy);
    }

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const documents: any = [];

    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return documents;
  }

  createFirestoreReference(
    collectionName: string,
    documentId: string,
  ): admin.firestore.DocumentReference {
    return this.db.collection(collectionName).doc(documentId);
  }
}
