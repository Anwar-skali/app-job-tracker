import { Platform } from 'react-native';
import { User, UserRole } from '@/types';

import { getDatabase } from './database';

// Créer un utilisateur
export const createUser = async (userData: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.createUser(userData);
  }

  const database = getDatabase();
  const now = new Date().toISOString();

  try {
    await database.runAsync(
      `INSERT INTO users (id, name, email, password, role, phone, address, skills, experience, education, linkedinUrl, companyName, companySector, companyWebsite, companySize, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.id,
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.phone || null,
        userData.address || null,
        userData.skills ? JSON.stringify(userData.skills) : null,
        userData.experience || null,
        userData.education || null,
        userData.linkedinUrl || null,
        userData.companyName || null,
        userData.companySector || null,
        userData.companyWebsite || null,
        userData.companySize || null,
        now,
        now
      ]
    );
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      address: userData.address,
      skills: userData.skills,
      experience: userData.experience,
      education: userData.education,
      linkedinUrl: userData.linkedinUrl,
      companyName: userData.companyName,
      companySector: userData.companySector,
      companyWebsite: userData.companyWebsite,
      companySize: userData.companySize,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Récupérer un utilisateur par email
export const getUserByEmail = async (email: string): Promise<User & { password: string } | null> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getUserByEmail(email);
  }

  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<User & { password: string }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return result || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (id: string): Promise<User | null> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getUserById(id);
  }

  const database = getDatabase();
  try {
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      phone: result.phone || undefined,
      address: result.address || undefined,
      skills: result.skills ? JSON.parse(result.skills) : undefined,
      experience: result.experience || undefined,
      education: result.education || undefined,
      linkedinUrl: result.linkedinUrl || undefined,
      companyName: result.companyName || undefined,
      companySector: result.companySector || undefined,
      companyWebsite: result.companyWebsite || undefined,
      companySize: result.companySize || undefined,
    };
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

// Simple password hash (same as in auth.ts)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const updateUser = async (id: string, updates: Partial<User & { password?: string }>): Promise<User | null> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    // @ts-ignore - web implementation might need update ensuring it handles password
    return await webDb.updateUser(id, updates);
  }

  const database = getDatabase();
  const now = new Date().toISOString();

  try {
    const setClause: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      setClause.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      setClause.push('password = ?');
      values.push(hashPassword(updates.password));
    }
    if (updates.phone !== undefined) {
      setClause.push('phone = ?');
      values.push(updates.phone || null);
    }
    if (updates.address !== undefined) {
      setClause.push('address = ?');
      values.push(updates.address || null);
    }
    if (updates.skills !== undefined) {
      setClause.push('skills = ?');
      values.push(updates.skills ? JSON.stringify(updates.skills) : null);
    }
    if (updates.experience !== undefined) {
      setClause.push('experience = ?');
      values.push(updates.experience || null);
    }
    if (updates.education !== undefined) {
      setClause.push('education = ?');
      values.push(updates.education || null);
    }
    if (updates.linkedinUrl !== undefined) {
      setClause.push('linkedinUrl = ?');
      values.push(updates.linkedinUrl || null);
    }
    if (updates.companyName !== undefined) {
      setClause.push('companyName = ?');
      values.push(updates.companyName || null);
    }
    if (updates.companySector !== undefined) {
      setClause.push('companySector = ?');
      values.push(updates.companySector || null);
    }
    if (updates.companyWebsite !== undefined) {
      setClause.push('companyWebsite = ?');
      values.push(updates.companyWebsite || null);
    }
    if (updates.companySize !== undefined) {
      setClause.push('companySize = ?');
      values.push(updates.companySize || null);
    }

    setClause.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await database.runAsync(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return await getUserById(id);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Récupérer tous les utilisateurs (Admin)
export const getAllUsers = async (): Promise<User[]> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getAllUsers();
  }

  const { getAllUsers: dbGetAllUsers } = await import('./database');
  return await dbGetAllUsers();
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.updateUserRole(userId, newRole);
  }

  const { updateUserRole: dbUpdateUserRole } = await import('./database');
  return await dbUpdateUserRole(userId, newRole);
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.deleteUser(userId);
  }

  const { deleteUser: dbDeleteUser } = await import('./database');
  return await dbDeleteUser(userId);
};

