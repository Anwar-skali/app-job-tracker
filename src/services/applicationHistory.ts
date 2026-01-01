import { Platform } from 'react-native';
import { ApplicationHistory, ApplicationStatus } from '@/types/jobApplication';

// Fonctions pour gérer l'historique des candidatures
const getDatabase = () => {
  if (Platform.OS === 'web') {
    return null;
  }
  const dbModule = require('./database');
  return dbModule.getDatabase();
};

// Ajouter une entrée dans l'historique
export const addApplicationHistory = async (
  applicationId: string,
  oldStatus: ApplicationStatus | undefined,
  newStatus: ApplicationStatus,
  changedBy: string,
  notes?: string
): Promise<void> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.addApplicationHistory(applicationId, oldStatus, newStatus, changedBy, notes);
  }

  const database = getDatabase();
  try {
    const historyId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await database.runAsync(
      `INSERT INTO application_history (id, applicationId, oldStatus, newStatus, changedBy, changedAt, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        historyId,
        applicationId,
        oldStatus || null,
        newStatus,
        changedBy,
        new Date().toISOString(),
        notes || null,
      ]
    );
  } catch (error) {
    console.error('Error adding application history:', error);
    // Ne pas throw pour ne pas bloquer la mise à jour
  }
};

// Récupérer l'historique d'une candidature
export const getApplicationHistory = async (applicationId: string): Promise<ApplicationHistory[]> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getApplicationHistory(applicationId);
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<ApplicationHistory>(
      'SELECT * FROM application_history WHERE applicationId = ? ORDER BY changedAt DESC',
      [applicationId]
    );
    return result;
  } catch (error) {
    console.error('Error getting application history:', error);
    return [];
  }
};

