export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  CANDIDATE = 'candidate',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Champs communs
  phone?: string;
  address?: string;
  // Champs spécifiques aux postulants
  skills?: string[]; // Compétences
  experience?: string; // Années d'expérience
  education?: string; // Niveau d'éducation
  linkedinUrl?: string;
  // Champs spécifiques aux recruteurs
  companyName?: string; // Nom de l'entreprise
  companySector?: string; // Secteur d'activité
  companyWebsite?: string; // Site web de l'entreprise
  companySize?: string; // Taille de l'entreprise
}

export * from './auth';
export * from './jobApplication';
export * from './job';
