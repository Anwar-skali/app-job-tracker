import { Platform } from 'react-native';
import { User, UserRole } from '@/types';
import { Job } from '@/types/job';
import { JobApplication } from '@/types/jobApplication';

// Récupérer tous les utilisateurs (Admin uniquement)
export const getAllUsers = async (): Promise<User[]> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.getAllUsers();
  }

  const dbModule = require('./database');
  const database = dbModule.getDatabase();
  
  try {
    const result = await database.getAllAsync<any>(
      'SELECT * FROM users ORDER BY createdAt DESC'
    );
    return result.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || undefined,
      address: user.address || undefined,
      skills: user.skills ? JSON.parse(user.skills) : undefined,
      experience: user.experience || undefined,
      education: user.education || undefined,
      linkedinUrl: user.linkedinUrl || undefined,
      companyName: user.companyName || undefined,
      companySector: user.companySector || undefined,
      companyWebsite: user.companyWebsite || undefined,
      companySize: user.companySize || undefined,
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Mettre à jour le rôle d'un utilisateur (Admin uniquement)
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.updateUserRole(userId, newRole);
  }

  const dbModule = require('./database');
  const database = dbModule.getDatabase();
  
  try {
    const result = await database.runAsync(
      'UPDATE users SET role = ?, updatedAt = ? WHERE id = ?',
      [newRole, new Date().toISOString(), userId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Supprimer un utilisateur (Admin uniquement)
export const deleteUser = async (userId: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const webDb = await import('./database.web');
    return await webDb.deleteUser(userId);
  }

  const dbModule = require('./database');
  const database = dbModule.getDatabase();
  
  try {
    const result = await database.runAsync(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Statistiques globales pour Admin
export interface AdminStats {
  totalUsers: number;
  totalRecruiters: number;
  totalCandidates: number;
  totalJobs: number;
  totalApplications: number;
  usersByRole: Record<UserRole, number>;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const [users, jobs, applications] = await Promise.all([
      getAllUsers(),
      import('./jobService').then(m => m.getAllJobs()),
      import('./database').then(async (db) => {
        return await db.getAllApplicationsAdmin();
      }),
    ]);

    const usersByRole: Record<UserRole, number> = {
      [UserRole.ADMIN]: 0,
      [UserRole.RECRUITER]: 0,
      [UserRole.CANDIDATE]: 0,
    };

    users.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });

    return {
      totalUsers: users.length,
      totalRecruiters: usersByRole[UserRole.RECRUITER],
      totalCandidates: usersByRole[UserRole.CANDIDATE],
      totalJobs: jobs.length,
      totalApplications: applications.length,
      usersByRole,
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalUsers: 0,
      totalRecruiters: 0,
      totalCandidates: 0,
      totalJobs: 0,
      totalApplications: 0,
      usersByRole: {
        [UserRole.ADMIN]: 0,
        [UserRole.RECRUITER]: 0,
        [UserRole.CANDIDATE]: 0,
      },
    };
  }
};

