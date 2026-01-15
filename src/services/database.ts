import { db } from '@/config/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { JobApplication } from '@/types/jobApplication';

const APPLICATIONS_COLLECTION = 'applications';

export const initDatabase = async (): Promise<void> => {
  // Firebase initialization is handled in firebaseConfig.ts
  console.log('Firebase (Firestore/Auth) initialized');
};

export const getDatabase = () => db;

// Applications CRUD
export const getAllApplications = async (userId: string): Promise<JobApplication[]> => {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  // Remove orderBy to avoid composite index requirement
  const q = query(
    appsRef,
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const apps = querySnapshot.docs.map(doc => doc.data() as JobApplication);

  // In-memory sort
  return apps.sort((a, b) =>
    new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
  );
};

export const getApplicationById = async (id: string, userId: string): Promise<JobApplication | null> => {
  const appRef = doc(db, APPLICATIONS_COLLECTION, id);
  const appDoc = await getDoc(appRef);

  if (!appDoc.exists() || appDoc.data().userId !== userId) return null;
  return appDoc.data() as JobApplication;
};

export const hasUserAppliedToJob = async (userId: string, jobId: string): Promise<boolean> => {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  const q = query(
    appsRef,
    where('userId', '==', userId),
    where('jobId', '==', jobId)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const createApplication = async (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplication> => {
  const now = new Date().toISOString();
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  const newAppRef = doc(appsRef);

  const newApp: JobApplication = {
    ...application,
    id: newAppRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newAppRef, newApp);
  return newApp;
};

export const updateApplication = async (
  id: string,
  updates: Partial<JobApplication>,
  userId: string
): Promise<JobApplication | null> => {
  const appRef = doc(db, APPLICATIONS_COLLECTION, id);
  const appDoc = await getDoc(appRef);

  if (!appDoc.exists() || appDoc.data().userId !== userId) return null;

  const now = new Date().toISOString();
  await updateDoc(appRef, {
    ...updates,
    updatedAt: now,
  });

  return await getApplicationById(id, userId);
};

export const deleteApplication = async (id: string, userId: string): Promise<boolean> => {
  const appRef = doc(db, APPLICATIONS_COLLECTION, id);
  const appDoc = await getDoc(appRef);

  if (!appDoc.exists() || appDoc.data().userId !== userId) return false;

  await deleteDoc(appRef);
  return true;
};

// Search (Firestore basic search)
export const searchApplications = async (
  userId: string,
  queryString: string
): Promise<JobApplication[]> => {
  const apps = await getAllApplications(userId);
  const lowerQuery = queryString.toLowerCase();
  return apps.filter(app =>
    app.title.toLowerCase().includes(lowerQuery) ||
    app.company.toLowerCase().includes(lowerQuery)
  );
};

// Recruiter functions
export const getApplicationsByRecruiter = async (recruiterId: string): Promise<JobApplication[]> => {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  // Remove orderBy to avoid composite index requirement
  const q = query(
    appsRef,
    where('recruiterId', '==', recruiterId)
  );

  const querySnapshot = await getDocs(q);
  const apps = querySnapshot.docs.map(doc => doc.data() as JobApplication);

  // In-memory sort
  return apps.sort((a, b) =>
    new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
  );
};

// Admin functions
export const getAllApplicationsAdmin = async (): Promise<JobApplication[]> => {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);
  const q = query(appsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as JobApplication);
};
