import { Platform } from 'react-native';
import { Job, JobType } from '@/types/job';

const getDatabase = () => {
  if (Platform.OS === 'web') {
    return null;
  }
  // Utiliser la fonction getDatabase de database.ts
  const dbModule = require('./database');
  return dbModule.getDatabase();
};

// Créer une offre d'emploi
export const createJob = async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.createJob(job);
  }

  const database = getDatabase();
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  const newJob: Job = {
    ...job,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await database.runAsync(
      `INSERT INTO jobs (
        id, title, company, location, type, description, salary, jobUrl,
        postedDate, source, remote, requirements, recruiterId, archived, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newJob.id,
        newJob.title,
        newJob.company,
        newJob.location,
        newJob.type,
        newJob.description || null,
        newJob.salary || null,
        newJob.jobUrl || null,
        newJob.postedDate,
        newJob.source || null,
        newJob.remote ? 1 : 0,
        newJob.requirements ? JSON.stringify(newJob.requirements) : null,
        newJob.recruiterId || null,
        newJob.archived ? 1 : 0,
        newJob.createdAt,
        newJob.updatedAt,
      ]
    );
    return newJob;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Récupérer toutes les offres d'un recruteur
export const getJobsByRecruiter = async (recruiterId: string): Promise<Job[]> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getJobsByRecruiter(recruiterId);
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<any>(
      'SELECT * FROM jobs WHERE recruiterId = ? ORDER BY postedDate DESC',
      [recruiterId]
    );
    return result.map(job => ({
      ...job,
      remote: job.remote === 1,
      archived: job.archived === 1,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
    }));
  } catch (error) {
    console.error('Error getting jobs by recruiter:', error);
    return [];
  }
};

// Récupérer toutes les offres disponibles (pour les candidats)
export const getAllJobs = async (): Promise<Job[]> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getAllJobs();
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<any>(
      'SELECT * FROM jobs WHERE archived = 0 OR archived IS NULL ORDER BY postedDate DESC'
    );
    return result.map(job => ({
      ...job,
      remote: job.remote === 1,
      archived: job.archived === 1,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
    }));
  } catch (error) {
    console.error('Error getting all jobs:', error);
    return [];
  }
};

// Récupérer une offre par ID
export const getJobById = async (id: string): Promise<Job | null> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getJobById(id);
  }

  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM jobs WHERE id = ?',
      [id]
    );
    if (!result) return null;
    return {
      ...result,
      remote: result.remote === 1,
      archived: result.archived === 1,
      requirements: result.requirements ? JSON.parse(result.requirements) : [],
    };
  } catch (error) {
    console.error('Error getting job by id:', error);
    return null;
  }
};

// Mettre à jour une offre
export const updateJob = async (
  id: string,
  updates: Partial<Job>,
  recruiterId: string
): Promise<Job | null> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.updateJob(id, updates, recruiterId);
  }

  const database = getDatabase();
  try {
    const existing = await getJobById(id);
    if (!existing || existing.recruiterId !== recruiterId) return null;

    const updated: Job = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await database.runAsync(
      `UPDATE jobs SET
        title = ?, company = ?, location = ?, type = ?, description = ?,
        salary = ?, jobUrl = ?, postedDate = ?, source = ?, remote = ?,
        requirements = ?, archived = ?, updatedAt = ?
      WHERE id = ? AND recruiterId = ?`,
      [
        updated.title,
        updated.company,
        updated.location,
        updated.type,
        updated.description || null,
        updated.salary || null,
        updated.jobUrl || null,
        updated.postedDate,
        updated.source || null,
        updated.remote ? 1 : 0,
        updated.requirements ? JSON.stringify(updated.requirements) : null,
        updated.archived ? 1 : 0,
        updated.updatedAt,
        id,
        recruiterId,
      ]
    );
    return updated;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

// Vérifier si une offre a des candidatures
export const hasApplications = async (jobId: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.hasApplications(jobId);
  }

  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM applications WHERE jobId = ?',
      [jobId]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking applications:', error);
    return false;
  }
};

// Archiver/Désarchiver une offre
export const toggleJobArchive = async (id: string, recruiterId: string, archived: boolean): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.toggleJobArchive(id, recruiterId, archived);
  }

  const database = getDatabase();
  try {
    const existing = await getJobById(id);
    if (!existing || existing.recruiterId !== recruiterId) return false;

    await database.runAsync(
      'UPDATE jobs SET archived = ?, updatedAt = ? WHERE id = ? AND recruiterId = ?',
      [archived ? 1 : 0, new Date().toISOString(), id, recruiterId]
    );
    return true;
  } catch (error) {
    console.error('Error toggling job archive:', error);
    throw error;
  }
};

// Supprimer une offre
export const deleteJob = async (id: string, recruiterId: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.deleteJob(id, recruiterId);
  }

  const database = getDatabase();
  try {
    const result = await database.runAsync(
      'DELETE FROM jobs WHERE id = ? AND recruiterId = ?',
      [id, recruiterId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

