import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { PrintJob } from './types.ts';

const app = initializeApp(firebaseConfig);

/* CRITICAL: The app requires firestoreDatabaseId for custom provisioned databases */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection offline or check configuration.');
    }
    return false;
  }
}

// Firestore operations for Print Jobs
export async function savePrintJobToFirestore(job: PrintJob): Promise<string> {
  const path = 'printJobs';
  try {
    const jobDocRef = doc(db, path, job.id);
    await setDoc(jobDocRef, {
      id: job.id,
      tokenNumber: job.tokenNumber,
      documentName: job.document.name,
      docCategory: job.docCategory,
      categoryLabel: job.categoryLabel,
      pages: job.effectivePages,
      copies: job.copies,
      totalCost: job.totalCost,
      paymentMethod: job.paymentMethod,
      paymentTrxId: job.paymentTrxId || '',
      status: job.status,
      createdAt: job.createdAt,
      shopLocation: 'Deganga Counter',
    });
    return job.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return job.id;
  }
}

export function subscribePrintJobs(
  onUpdate: (jobs: PrintJob[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'printJobs';
  const q = query(collection(db, path), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const results: PrintJob[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        results.push({
          id: data.id || d.id,
          tokenNumber: data.tokenNumber || 'SK-0000',
          document: {
            id: `doc-${d.id}`,
            name: data.documentName || 'Document.pdf',
            sizeBytes: 500000,
            type: 'application/pdf',
            pageCount: data.pages || 1,
            previewUrl: '',
          },
          docCategory: data.docCategory || '5',
          categoryLabel: data.categoryLabel || 'ছোট ডকুমেন্টস',
          paperSize: 'a4',
          pageRangeMode: 'all',
          effectivePages: data.pages || 1,
          copies: data.copies || 1,
          duplexMode: 'single',
          binding: 'none',
          totalCost: data.totalCost || 5,
          paymentMethod: data.paymentMethod || 'phonepe',
          paymentTrxId: data.paymentTrxId || '',
          status: data.status || 'completed',
          createdAt: data.createdAt || new Date().toISOString(),
          printedPagesCount: (data.pages || 1) * (data.copies || 1),
        });
      });

      // Sort descending by createdAt
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error as Error);
    }
  );
}
