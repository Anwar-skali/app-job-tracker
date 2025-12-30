import { Job, JobSearchParams, JobFilters, JobType } from '@/types/job';

// Base URL pour l'API de recherche d'emploi
// TODO: Remplacer par l'URL réelle de l'API de recherche d'emploi
const JOB_API_BASE_URL = process.env.EXPO_PUBLIC_JOB_API_URL || 'https://api.example.com/jobs';

// Mock data pour le développement (à remplacer par un appel API réel)
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Développeur React Native',
    company: 'TechCorp',
    location: 'Paris, France',
    type: JobType.FULL_TIME,
    description: 'Nous recherchons un développeur React Native expérimenté pour rejoindre notre équipe mobile.',
    salary: '50k-70k €',
    jobUrl: 'https://example.com/job/1',
    postedDate: new Date().toISOString(),
    source: 'LinkedIn',
    remote: true,
    requirements: ['React Native', 'TypeScript', 'Expo', '3+ ans d\'expérience'],
  },
  {
    id: '2',
    title: 'Ingénieur Full Stack',
    company: 'StartupXYZ',
    location: 'Lyon, France',
    type: JobType.FULL_TIME,
    description: 'Poste d\'ingénieur full stack pour développer notre plateforme web et mobile.',
    salary: '55k-75k €',
    jobUrl: 'https://example.com/job/2',
    postedDate: new Date(Date.now() - 86400000).toISOString(),
    source: 'Indeed',
    remote: false,
    requirements: ['React', 'Node.js', 'PostgreSQL', '2+ ans d\'expérience'],
  },
  {
    id: '3',
    title: 'Stage Développeur Frontend',
    company: 'DigitalAgency',
    location: 'Toulouse, France',
    type: JobType.INTERNSHIP,
    description: 'Stage de 6 mois pour un développeur frontend motivé.',
    salary: '800-1000 €/mois',
    jobUrl: 'https://example.com/job/3',
    postedDate: new Date(Date.now() - 172800000).toISOString(),
    source: 'Welcome to the Jungle',
    remote: false,
    requirements: ['React', 'JavaScript', 'HTML/CSS'],
  },
  {
    id: '4',
    title: 'Développeur Backend Python',
    company: 'DataTech',
    location: 'Remote',
    type: JobType.FULL_TIME,
    description: 'Développeur backend Python pour notre équipe de data engineering.',
    salary: '60k-80k €',
    jobUrl: 'https://example.com/job/4',
    postedDate: new Date(Date.now() - 259200000).toISOString(),
    source: 'LinkedIn',
    remote: true,
    requirements: ['Python', 'Django', 'PostgreSQL', 'Docker', '4+ ans d\'expérience'],
  },
  {
    id: '5',
    title: 'Designer UX/UI',
    company: 'CreativeStudio',
    location: 'Bordeaux, France',
    type: JobType.FULL_TIME,
    description: 'Designer UX/UI pour concevoir des interfaces utilisateur modernes.',
    salary: '45k-60k €',
    jobUrl: 'https://example.com/job/5',
    postedDate: new Date(Date.now() - 345600000).toISOString(),
    source: 'Indeed',
    remote: true,
    requirements: ['Figma', 'Design System', 'Prototypage', '3+ ans d\'expérience'],
  },
];

/**
 * Récupère la liste des offres d'emploi
 * @param params Paramètres de recherche et filtres
 * @returns Liste des offres d'emploi
 */
export const fetchJobs = async (params?: JobSearchParams): Promise<Job[]> => {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch(`${JOB_API_BASE_URL}?${new URLSearchParams(params as any)}`);
    // const data = await response.json();
    // return data.jobs;

    // Pour l'instant, utiliser les données mockées
    let jobs = [...MOCK_JOBS];

    // Appliquer les filtres
    if (params) {
      jobs = applyFilters(jobs, params);
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return jobs.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Impossible de charger les offres d\'emploi');
  }
};

/**
 * Recherche d'offres d'emploi avec un terme de recherche
 * @param query Terme de recherche
 * @param filters Filtres additionnels
 * @returns Liste des offres d'emploi correspondantes
 */
export const searchJobs = async (
  query: string,
  filters?: JobFilters
): Promise<Job[]> => {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch(`${JOB_API_BASE_URL}/search`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ query, ...filters }),
    // });
    // const data = await response.json();
    // return data.jobs;

    // Pour l'instant, utiliser les données mockées avec recherche locale
    let jobs = [...MOCK_JOBS];

    // Recherche par terme
    if (query) {
      const lowerQuery = query.toLowerCase();
      jobs = jobs.filter(
        job =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.company.toLowerCase().includes(lowerQuery) ||
          job.location.toLowerCase().includes(lowerQuery) ||
          job.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // Appliquer les autres filtres
    if (filters) {
      jobs = applyFilters(jobs, filters);
    }

    return jobs;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw new Error('Impossible de rechercher les offres d\'emploi');
  }
};

/**
 * Récupère une offre d'emploi par son ID
 * @param id ID de l'offre
 * @returns Offre d'emploi ou null
 */
export const getJobById = async (id: string): Promise<Job | null> => {
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await fetch(`${JOB_API_BASE_URL}/${id}`);
    // const data = await response.json();
    // return data.job;

    // Pour l'instant, utiliser les données mockées
    const job = MOCK_JOBS.find(j => j.id === id);
    return job || null;
  } catch (error) {
    console.error('Error fetching job by id:', error);
    return null;
  }
};

/**
 * Applique les filtres à une liste d'offres d'emploi
 */
function applyFilters(jobs: Job[], filters: JobFilters): Job[] {
  let filtered = [...jobs];

  if (filters.location) {
    const lowerLocation = filters.location.toLowerCase();
    filtered = filtered.filter(job =>
      job.location.toLowerCase().includes(lowerLocation)
    );
  }

  if (filters.type) {
    filtered = filtered.filter(job => job.type === filters.type);
  }

  if (filters.remote !== undefined) {
    filtered = filtered.filter(job => job.remote === filters.remote);
  }

  if (filters.source) {
    filtered = filtered.filter(job => job.source === filters.source);
  }

  if (filters.minSalary) {
    filtered = filtered.filter(job => {
      if (!job.salary) return false;
      // Extraction approximative du salaire minimum depuis la chaîne
      const match = job.salary.match(/(\d+)k/);
      if (match) {
        const salary = parseInt(match[1]) * 1000;
        return salary >= filters.minSalary!;
      }
      return false;
    });
  }

  return filtered;
}

