import { Platform } from 'react-native';
import { JobApplication } from '@/types/jobApplication';

// Utiliser SQLite sur mobile, AsyncStorage sur web
let db: any = null;
let SQLite: any = null;

// Charger SQLite uniquement sur mobile
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

export const initDatabase = async (): Promise<void> => {
  try {
    if (db) {
      return; // Déjà initialisée
    }
    
    // Sur web, utiliser AsyncStorage
    if (Platform.OS === 'web') {
      const webDb = await import('./database.web');
      await webDb.initDatabase();
      db = 'web'; // Marqueur pour utiliser les fonctions web
      console.log('Database initialized (web/AsyncStorage)');
      return;
    }
    
    // Sur mobile, utiliser SQLite
    if (!SQLite) {
      throw new Error('SQLite not available');
    }
    
    db = await SQLite.openDatabaseAsync('jobtracker.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        jobUrl TEXT,
        contractType TEXT NOT NULL,
        applicationDate TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        documents TEXT,
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_userId ON applications(userId);
      CREATE INDEX IF NOT EXISTS idx_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_applicationDate ON applications(applicationDate);
    `);
    
    console.log('Database initialized successfully (SQLite)');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Ne pas throw pour ne pas bloquer l'app
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Applications CRUD
export const getAllApplications = async (userId: string): Promise<JobApplication[]> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getAllApplications(userId);
  }
  
  const database = getDatabase();
  try {
    const result = await database.getAllAsync<JobApplication>(
      'SELECT * FROM applications WHERE userId = ? ORDER BY applicationDate DESC',
      [userId]
    );
    return result.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : [],
    }));
  } catch (error) {
    console.error('Error getting applications:', error);
    return [];
  }
};

export const getApplicationById = async (id: string, userId: string): Promise<JobApplication | null> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getApplicationById(id, userId);
  }
  
  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<JobApplication>(
      'SELECT * FROM applications WHERE id = ? AND userId = ?',
      [id, userId]
    );
    if (!result) return null;
    return {
      ...result,
      documents: result.documents ? JSON.parse(result.documents) : [],
    };
  } catch (error) {
    console.error('Error getting application by id:', error);
    return null;
  }
};

export const createApplication = async (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplication> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.createApplication(application);
  }
  
  const database = getDatabase();
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  const newApplication: JobApplication = {
    ...application,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await database.runAsync(
      `INSERT INTO applications (
        id, title, company, location, jobUrl, contractType, 
        applicationDate, status, notes, documents, userId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newApplication.id,
        newApplication.title,
        newApplication.company,
        newApplication.location,
        newApplication.jobUrl || null,
        newApplication.contractType,
        newApplication.applicationDate,
        newApplication.status,
        newApplication.notes || null,
        newApplication.documents ? JSON.stringify(newApplication.documents) : null,
        newApplication.userId,
        newApplication.createdAt,
        newApplication.updatedAt,
      ]
    );
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
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.updateApplication(id, updates, userId);
  }
  
  const database = getDatabase();
  
  try {
    const existing = await getApplicationById(id, userId);
    if (!existing) return null;

    const updated: JobApplication = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await database.runAsync(
      `UPDATE applications SET
        title = ?, company = ?, location = ?, jobUrl = ?, contractType = ?,
        applicationDate = ?, status = ?, notes = ?, documents = ?, updatedAt = ?
      WHERE id = ? AND userId = ?`,
      [
        updated.title,
        updated.company,
        updated.location,
        updated.jobUrl || null,
        updated.contractType,
        updated.applicationDate,
        updated.status,
        updated.notes || null,
        updated.documents ? JSON.stringify(updated.documents) : null,
        updated.updatedAt,
        id,
        userId,
      ]
    );
    return updated;
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (id: string, userId: string): Promise<boolean> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.deleteApplication(id, userId);
  }
  
  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'DELETE FROM applications WHERE id = ? AND userId = ?',
      [id, userId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

export const searchApplications = async (
  userId: string,
  query: string
): Promise<JobApplication[]> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.searchApplications(userId, query);
  }
  
  const database = getDatabase();
  try {
    const result = await database.getAllAsync<JobApplication>(
      `SELECT * FROM applications 
       WHERE userId = ? AND (title LIKE ? OR company LIKE ?)
       ORDER BY applicationDate DESC`,
      [userId, `%${query}%`, `%${query}%`]
    );
    return result.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : [],
    }));
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
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.filterApplications(userId, filters);
  }
  
  const database = getDatabase();
  
  try {
    let query = 'SELECT * FROM applications WHERE userId = ?';
    const params: any[] = [userId];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.contractType) {
      query += ' AND contractType = ?';
      params.push(filters.contractType);
    }

    if (filters.startDate) {
      query += ' AND applicationDate >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND applicationDate <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY applicationDate DESC';

    const result = await database.getAllAsync<JobApplication>(query, params);
    return result.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : [],
    }));
  } catch (error) {
    console.error('Error filtering applications:', error);
    return [];
  }
};

