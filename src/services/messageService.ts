import { Platform } from 'react-native';
import { Message } from '@/types/message';

const getDatabase = () => {
  if (Platform.OS === 'web') {
    return null;
  }
  const dbModule = require('./database');
  return dbModule.getDatabase();
};

// Créer un message
export const createMessage = async (message: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.createMessage(message);
  }

  const database = getDatabase();
  const newMessage: Message = {
    ...message,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    read: false,
  };

  try {
    await database.runAsync(
      `INSERT INTO messages (id, applicationId, senderId, senderRole, message, createdAt, read)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newMessage.id,
        newMessage.applicationId,
        newMessage.senderId,
        newMessage.senderRole,
        newMessage.message,
        newMessage.createdAt,
        0,
      ]
    );
    return newMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

// Récupérer les messages d'une candidature
export const getMessagesByApplication = async (applicationId: string): Promise<Message[]> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getMessagesByApplication(applicationId);
  }

  const database = getDatabase();
  try {
    const result = await database.getAllAsync<Message>(
      'SELECT * FROM messages WHERE applicationId = ? ORDER BY createdAt ASC',
      [applicationId]
    );
    return result.map(msg => ({
      ...msg,
      read: msg.read === 1,
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Marquer un message comme lu
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.markMessageAsRead(messageId);
  }

  const database = getDatabase();
  try {
    await database.runAsync(
      'UPDATE messages SET read = 1 WHERE id = ?',
      [messageId]
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

