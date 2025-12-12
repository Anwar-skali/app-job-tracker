// Implémentation web avec AsyncStorage (fallback pour web)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobApplication } from '@/types/jobApplication';

const STORAGE_KEY = '@job_applications';

let initialized = false;

export const initDatabase = async (): Promise<void> => {
  if (initialized) return;
  
  try {
    // Vérifier si les données existent, sinon initialiser
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    initialized = true;
    console.log('Database initialized (web/AsyncStorage)');
  } catch (error) {
    console.error('Error initializing database:', error);
    initialized = true; // Continue anyway
  }
};

const getDatabase = () => {
  if (!initialized) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return AsyncStorage;
};

export const getAllApplications = async (userId: string): Promise<JobApplication[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const allApplications: JobApplication[] = JSON.parse(data);
    return allApplications
      .filter(app => app.userId === userId)
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
  } catch (error) {
    console.error('Error getting applications:', error);
    return [];
  }
};

export const getApplicationById = async (id: string, userId: string): Promise<JobApplication | null> => {
  try {
    const applications = await getAllApplications(userId);
    return applications.find(app => app.id === id) || null;
  } catch (error) {
    console.error('Error getting application by id:', error);
    return null;
  }
};

export const createApplication = async (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplication> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const allApplications: JobApplication[] = data ? JSON.parse(data) : [];
    
    const newApplication: JobApplication = {
      ...application,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    allApplications.push(newApplication);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allApplications));
    
    return newApplication;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

export const updateApplication = async (
  id: string,
  updates: Partial<JobApplication>,
  userId: string
): Promise<JobApplication | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const allApplications: JobApplication[] = JSON.parse(data);
    const index = allApplications.findIndex(app => app.id === id && app.userId === userId);
    
    if (index === -1) return null;
    
    allApplications[index] = {
      ...allApplications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allApplications));
    return allApplications[index];
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (id: string, userId: string): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    
    const allApplications: JobApplication[] = JSON.parse(data);
    const filtered = allApplications.filter(app => !(app.id === id && app.userId === userId));
    
    if (filtered.length === allApplications.length) return false;
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

export const searchApplications = async (
  userId: string,
  query: string
): Promise<JobApplication[]> => {
  try {
    const applications = await getAllApplications(userId);
    const lowerQuery = query.toLowerCase();
    return applications.filter(
      app =>
        app.title.toLowerCase().includes(lowerQuery) ||
        app.company.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching applications:', error);
    return [];
  }
};

export const filterApplications = async (
  userId: string,
  filters: {
    status?: string;
    contractType?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<JobApplication[]> => {
  try {
    let applications = await getAllApplications(userId);
    
    if (filters.status) {
      applications = applications.filter(app => app.status === filters.status);
    }
    
    if (filters.contractType) {
      applications = applications.filter(app => app.contractType === filters.contractType);
    }
    
    if (filters.startDate) {
      applications = applications.filter(app => app.applicationDate >= filters.startDate!);
    }
    
    if (filters.endDate) {
      applications = applications.filter(app => app.applicationDate <= filters.endDate!);
    }
    
    return applications;
  } catch (error) {
    console.error('Error filtering applications:', error);
    return [];
  }
};

