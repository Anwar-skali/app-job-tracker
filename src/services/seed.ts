import { User, UserRole } from '@/types';
import { JobApplication, ApplicationStatus, ContractType } from '@/types/jobApplication';
import { createApplication } from './database';
import { createUser, getUserByEmail } from './userService';

const MOCK_USERS: any[] = [
    {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password',
        role: UserRole.ADMIN,
    },
    {
        name: 'Recruteur Demo',
        email: 'recruteur@test.com',
        password: 'password',
        role: UserRole.RECRUITER,
        companyName: 'TechCorp',
        companySector: 'IT',
    },
    {
        name: 'Candidat Demo',
        email: 'candidat@test.com',
        password: 'password',
        role: UserRole.CANDIDATE,
        skills: ['React', 'TypeScript', 'Node.js'],
    },
    {
        name: 'Alice Dubois',
        email: 'alice@test.com',
        password: 'password',
        role: UserRole.CANDIDATE,
        skills: ['Python', 'Django', 'AWS'],
    },
    {
        name: 'Bob Martin',
        email: 'bob@test.com',
        password: 'password',
        role: UserRole.CANDIDATE,
        skills: ['Java', 'Spring', 'Angular'],
    },
];

const MOCK_APPLICATIONS = [
    {
        title: 'Développeur Fullstack React/Node',
        company: 'TechStarts',
        location: 'Paris',
        contractType: ContractType.CDI,
        status: ApplicationStatus.INTERVIEW,
        applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Premier entretien technique réussi.',
    },
    {
        title: 'Frontend Engineer',
        company: 'CreativeAgency',
        location: 'Lyon (Remote)',
        contractType: ContractType.FREELANCE,
        status: ApplicationStatus.SENT,
        applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        jobUrl: 'https://example.com/jobs/123',
    },
    {
        title: 'Backend Developer',
        company: 'FinTech Co',
        location: 'Paris',
        contractType: ContractType.CDI,
        status: ApplicationStatus.REJECTED,
        applicationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Refus par email. Profil ne correspond pas aux attentes séniors.',
    },
    {
        title: 'Lead Developer',
        company: 'Big Corp',
        location: 'Toulouse',
        contractType: ContractType.CDI,
        status: ApplicationStatus.ACCEPTED,
        applicationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Offre reçue ! Salaire 55k.',
    },
    {
        title: 'Stage React Native',
        company: 'StartupMobile',
        location: 'Bordeaux',
        contractType: ContractType.INTERNSHIP,
        status: ApplicationStatus.TO_APPLY,
        applicationDate: new Date().toISOString(),
        notes: 'À postuler avant vendredi.',
        jobUrl: 'https://startup.io/careers',
    },
];

export const seedDatabase = async () => {
    console.log('Starting database seeding...');

    try {
        // 1. Create Users
        for (const userData of MOCK_USERS) {
            const existing = await getUserByEmail(userData.email);
            let userId = existing?.id;

            if (!existing) {
                console.log(`Creating user: ${userData.email}`);
                const newUser = await createUser({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    ...userData,
                });
                userId = newUser.id;
            } else {
                console.log(`User already exists: ${userData.email}`);
            }

            // 2. Create Applications for Candidates
            if (userData.role === UserRole.CANDIDATE && userId) {
                // Assign some random applications to this user
                const appsToAssign = MOCK_APPLICATIONS.slice(0, 3 + Math.floor(Math.random() * 3)); // 3 to 5 apps

                for (const appTemplate of appsToAssign) {
                    // Add some randomness to the dates and status
                    const randomDays = Math.floor(Math.random() * 30);
                    const randomStatus = Object.values(ApplicationStatus)[Math.floor(Math.random() * Object.values(ApplicationStatus).length)];

                    await createApplication({
                        userId,
                        ...appTemplate,
                        status: randomStatus, // Overwrite with random status for variety
                        applicationDate: new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000).toISOString(),
                        // Slightly modify title to avoid duplicates looking identical
                        title: `${appTemplate.title} ${Math.floor(Math.random() * 100)}`,
                    });
                }
                console.log(`Created applications for ${userData.email}`);
            }
        }

        console.log('Database seeding completed successfully!');
        return true;
    } catch (error) {
        console.error('Seed error:', error);
        throw error;
    }
};
