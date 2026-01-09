import { Platform } from 'react-native';
import { JobApplication } from '@/types/jobApplication';
import { User, UserRole } from '@/types';

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
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        skills TEXT,
        experience TEXT,
        education TEXT,
        linkedinUrl TEXT,
        companyName TEXT,
        companySector TEXT,
        companyWebsite TEXT,
        companySize TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        salary TEXT,
        jobUrl TEXT,
        postedDate TEXT NOT NULL,
        source TEXT,
        remote INTEGER DEFAULT 0,
        requirements TEXT,
        recruiterId TEXT NOT NULL,
        archived INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      
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
        cvUrl TEXT,
        cvFileName TEXT,
        jobId TEXT,
        userId TEXT NOT NULL,
        recruiterId TEXT,
        lastFollowUp TEXT,
        followUpCount INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS application_history (
        id TEXT PRIMARY KEY NOT NULL,
        applicationId TEXT NOT NULL,
        oldStatus TEXT,
        newStatus TEXT NOT NULL,
        changedBy TEXT NOT NULL,
        changedAt TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (applicationId) REFERENCES applications(id)
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        applicationId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        senderRole TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        FOREIGN KEY (applicationId) REFERENCES applications(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_userId ON applications(userId);
      CREATE INDEX IF NOT EXISTS idx_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_applicationDate ON applications(applicationDate);
      CREATE INDEX IF NOT EXISTS idx_jobId ON applications(jobId);
      CREATE INDEX IF NOT EXISTS idx_recruiterId ON applications(recruiterId);
      CREATE INDEX IF NOT EXISTS idx_userEmail ON users(email);
      CREATE INDEX IF NOT EXISTS idx_jobRecruiterId ON jobs(recruiterId);
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
    const result = await database.getAllAsync<any>(
      'SELECT * FROM applications WHERE userId = ? ORDER BY applicationDate DESC',
      [userId]
    );
    return result.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : [],
      lastFollowUp: app.lastFollowUp || undefined,
      followUpCount: app.followUpCount || 0,
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
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM applications WHERE id = ? AND userId = ?',
      [id, userId]
    );
    if (!result) return null;
    return {
      ...result,
      documents: result.documents ? JSON.parse(result.documents) : [],
      lastFollowUp: result.lastFollowUp || undefined,
      followUpCount: result.followUpCount || 0,
    };
  } catch (error) {
    console.error('Error getting application by id:', error);
    return null;
  }
};

// Vérifier si un utilisateur a déjà postulé à une offre
export const hasUserAppliedToJob = async (userId: string, jobId: string): Promise<boolean> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.hasUserAppliedToJob(userId, jobId);
  }

  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM applications WHERE userId = ? AND jobId = ?',
      [userId, jobId]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking if user applied:', error);
    return false;
  }
};

export const createApplication = async (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplication> => {
  // Vérifier si l'utilisateur a déjà postulé à cette offre
  if (application.jobId && application.userId) {
    const alreadyApplied = await hasUserAppliedToJob(application.userId, application.jobId);
    if (alreadyApplied) {
      throw new Error('Vous avez déjà postulé à cette offre');
    }
  }

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
        applicationDate, status, notes, documents, cvUrl, cvFileName, jobId, recruiterId, userId, 
        lastFollowUp, followUpCount, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        newApplication.cvUrl || null,
        newApplication.cvFileName || null,
        newApplication.jobId || null,
        newApplication.recruiterId || null,
        newApplication.userId,
        newApplication.lastFollowUp || null,
        newApplication.followUpCount || 0,
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
        applicationDate = ?, status = ?, notes = ?, documents = ?, cvUrl = ?, cvFileName = ?, 
        lastFollowUp = ?, followUpCount = ?, updatedAt = ?
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
        updated.cvUrl || null,
        updated.cvFileName || null,
        updated.lastFollowUp || null,
        updated.followUpCount || 0,
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

// Récupérer les candidatures reçues par un recruteur
export const getApplicationsByRecruiter = async (recruiterId: string): Promise<JobApplication[]> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getApplicationsByRecruiter(recruiterId);
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<any>(
      'SELECT * FROM applications WHERE recruiterId = ? ORDER BY applicationDate DESC',
      [recruiterId]
    );
    return result.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : [],
      lastFollowUp: app.lastFollowUp || undefined,
      followUpCount: app.followUpCount || 0,
    }));
  } catch (error) {
    console.error('Error getting applications by recruiter:', error);
    return [];
  }
};

// Récupérer toutes les candidatures (Admin uniquement)
export const getAllApplicationsAdmin = async (): Promise<JobApplication[]> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getAllApplicationsAdmin();
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<JobApplication>(
      'SELECT * FROM applications ORDER BY applicationDate DESC'
    );
    return result.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : [],
    }));
  } catch (error) {
    console.error('Error getting all applications:', error);
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

// Récupérer tous les utilisateurs (Admin)
export const getAllUsers = async (): Promise<User[]> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getAllUsers();
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<any>(
      'SELECT id, name, email, role, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
    );
    return result.map(u => ({
      ...u,
      role: u.role as UserRole
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.updateUserRole(userId, newRole);
  }

  const database = getDatabase();
  try {
    const now = new Date().toISOString();
    await database.runAsync(
      'UPDATE users SET role = ?, updatedAt = ? WHERE id = ?',
      [newRole, now, userId]
    );
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  // Sur web, utiliser AsyncStorage
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.deleteUser(userId);
  }

  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

