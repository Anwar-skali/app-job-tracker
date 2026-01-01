// Implémentation web avec AsyncStorage (fallback pour web)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobApplication, ApplicationHistory, ApplicationStatus } from '@/types/jobApplication';
import { User, UserRole } from '@/types';
import { Job } from '@/types/job';
import { Message } from '@/types/message';

const STORAGE_KEY = '@job_applications';
const USERS_STORAGE_KEY = '@users';
const JOBS_STORAGE_KEY = '@jobs';

let initialized = false;

export const initDatabase = async (): Promise<void> => {
  if (initialized) return;

  try {
    // Vérifier si les données existent, sinon initialiser
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!usersData) {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    }
    const jobsData = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!jobsData) {
      await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify([]));
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
    const userApps = allApplications.filter(app => app.userId === userId);
    return userApps
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

export const hasUserAppliedToJob = async (userId: string, jobId: string): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return false;

    const applications: JobApplication[] = JSON.parse(data);
    return applications.some(app => app.userId === userId && app.jobId === jobId);
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

// User management functions
export const createUser = async (userData: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users: (User & { password: string })[] = data ? JSON.parse(data) : [];

    // Vérifier si l'email existe déjà
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    users.push({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      password: userData.password,
    });

    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<(User & { password: string }) | null> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return null;

    const users: (User & { password: string })[] = JSON.parse(data);
    return users.find(u => u.email === email) || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return null;

    const users: (User & { password: string })[] = JSON.parse(data);
    const user = users.find(u => u.id === id);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      linkedinUrl: user.linkedinUrl,
      companyName: user.companyName,
      companySector: user.companySector,
      companyWebsite: user.companyWebsite,
      companySize: user.companySize,
    };
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return null;

    const users: (User & { password: string })[] = JSON.parse(data);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
    };

    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    const updated = users[index];
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      address: updated.address,
      skills: updated.skills,
      experience: updated.experience,
      education: updated.education,
      linkedinUrl: updated.linkedinUrl,
      companyName: updated.companyName,
      companySector: updated.companySector,
      companyWebsite: updated.companyWebsite,
      companySize: updated.companySize,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Job management functions
export const createJob = async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
  try {
    const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    const jobs: Job[] = data ? JSON.parse(data) : [];

    const newJob: Job = {
      ...job,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.push(newJob);
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    return newJob;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const getJobsByRecruiter = async (recruiterId: string): Promise<Job[]> => {
  try {
    const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) return [];

    const jobs: Job[] = JSON.parse(data);
    return jobs
      .filter(job => job.recruiterId === recruiterId)
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  } catch (error) {
    console.error('Error getting jobs by recruiter:', error);
    return [];
  }
};

export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) return [];

    const jobs: Job[] = JSON.parse(data);
    return jobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  } catch (error) {
    console.error('Error getting all jobs:', error);
    return [];
  }
};

export const getJobById = async (id: string): Promise<Job | null> => {
  try {
    const jobs = await getAllJobs();
    return jobs.find(job => job.id === id) || null;
  } catch (error) {
    console.error('Error getting job by id:', error);
    return null;
  }
};

export const updateJob = async (
  id: string,
  updates: Partial<Job>,
  recruiterId: string
): Promise<Job | null> => {
  try {
    const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) return null;

    const jobs: Job[] = JSON.parse(data);
    const index = jobs.findIndex(job => job.id === id && job.recruiterId === recruiterId);

    if (index === -1) return null;

    jobs[index] = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    return jobs[index];
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const hasApplications = async (jobId: string): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return false;

    const applications: JobApplication[] = JSON.parse(data);
    return applications.some(app => app.jobId === jobId);
  } catch (error) {
    console.error('Error checking applications:', error);
    return false;
  }
};

export const deleteJob = async (id: string, recruiterId: string): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) return false;

    const jobs: Job[] = JSON.parse(data);
    const filtered = jobs.filter(job => !(job.id === id && job.recruiterId === recruiterId));

    if (filtered.length === jobs.length) return false;

    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export const getApplicationsByRecruiter = async (recruiterId: string): Promise<JobApplication[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const allApplications: JobApplication[] = JSON.parse(data);
    return allApplications
      .filter(app => app.recruiterId === recruiterId)
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
  } catch (error) {
    console.error('Error getting applications by recruiter:', error);
    return [];
  }
};

// Fonctions Admin
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return [];

    const users: (User & { password?: string })[] = JSON.parse(data);
    return users.map(({ password, ...user }) => user);
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return false;

    const users: (User & { password?: string })[] = JSON.parse(data);
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return false;

    users[index].role = newRole;
    users[index].updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    if (!data) return false;

    const users: (User & { password?: string })[] = JSON.parse(data);
    const filtered = users.filter(u => u.id !== userId);

    if (filtered.length === users.length) return false;

    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAllApplicationsAdmin = async (): Promise<JobApplication[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const applications: JobApplication[] = JSON.parse(data);
    return applications.map(app => ({
      ...app,
      documents: app.documents || [],
    }));
  } catch (error) {
    console.error('Error getting all applications:', error);
    return [];
  }
};

export const toggleJobArchive = async (id: string, recruiterId: string, archived: boolean): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!data) return false;

    const jobs: Job[] = JSON.parse(data);
    const index = jobs.findIndex(job => job.id === id && job.recruiterId === recruiterId);
    
    if (index === -1) return false;

    jobs[index] = {
      ...jobs[index],
      archived: archived,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    return true;
  } catch (error) {
    console.error('Error toggling job archive:', error);
    throw error;
  }
};

// Historique des candidatures
const APPLICATION_HISTORY_KEY = '@application_history';

export const addApplicationHistory = async (
  applicationId: string,
  oldStatus: ApplicationStatus | undefined,
  newStatus: ApplicationStatus,
  changedBy: string,
  notes?: string
): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(APPLICATION_HISTORY_KEY);
    const history: ApplicationHistory[] = data ? JSON.parse(data) : [];

    const newHistory: ApplicationHistory = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      applicationId,
      oldStatus,
      newStatus,
      changedBy,
      changedAt: new Date().toISOString(),
      notes,
    };

    history.push(newHistory);
    await AsyncStorage.setItem(APPLICATION_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding application history:', error);
  }
};

export const getApplicationHistory = async (applicationId: string): Promise<ApplicationHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(APPLICATION_HISTORY_KEY);
    if (!data) return [];

    const history: ApplicationHistory[] = JSON.parse(data);
    return history
      .filter(h => h.applicationId === applicationId)
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  } catch (error) {
    console.error('Error getting application history:', error);
    return [];
  }
};

// Messages
const MESSAGES_STORAGE_KEY = '@messages';

export const createMessage = async (message: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> => {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    const messages: Message[] = data ? JSON.parse(data) : [];

    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
    };

    messages.push(newMessage);
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    return newMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

export const getMessagesByApplication = async (applicationId: string): Promise<Message[]> => {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!data) return [];

    const messages: Message[] = JSON.parse(data);
    return messages
      .filter(m => m.applicationId === applicationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!data) return;

    const messages: Message[] = JSON.parse(data);
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      messages[index].read = true;
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

