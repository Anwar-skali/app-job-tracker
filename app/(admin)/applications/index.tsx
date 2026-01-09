import { useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, TextInput, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { JobApplication, ApplicationStatus } from '@/types/jobApplication';
import { getAllApplicationsGlobal } from '@/services/jobApplication';
import { getAllUsers } from '@/services/userService';
import { User } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
    [ApplicationStatus.TO_APPLY]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [ApplicationStatus.SENT]: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    [ApplicationStatus.INTERVIEW]: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    [ApplicationStatus.REFUSED]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
    [ApplicationStatus.TO_APPLY]: 'À postuler',
    [ApplicationStatus.SENT]: 'Envoyée',
    [ApplicationStatus.INTERVIEW]: 'Entretien',
    [ApplicationStatus.REFUSED]: 'Refusée',
    [ApplicationStatus.ACCEPTED]: 'Acceptée',
};

export default function ApplicationsScreen() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
    const [userMap, setUserMap] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [apps, users] = await Promise.all([
                getAllApplicationsGlobal(),
                getAllUsers()
            ]);

            const mapping: Record<string, User> = {};
            users.forEach(u => {
                mapping[u.id] = u;
            });
            setUserMap(mapping);

            setApplications(apps);
            filterApps(apps, searchQuery);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const filterApps = (data: JobApplication[], query: string) => {
        if (!query) {
            setFilteredApplications(data);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = data.filter((app) =>
            app.title.toLowerCase().includes(lowerQuery) ||
            app.company.toLowerCase().includes(lowerQuery) ||
            (userMap[app.userId]?.name || '').toLowerCase().includes(lowerQuery)
        );
        setFilteredApplications(filtered);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        filterApps(applications, text);
    };

    const renderItem = ({ item }: { item: JobApplication }) => {
        const user = userMap[item.userId];
        return (
            <View className="mb-4 rounded-xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
                <View className="mb-2 flex-row justify-between">
                    <Text className="text-xs text-secondary-500">
                        {format(new Date(item.applicationDate), 'dd MMM yyyy', { locale: fr })}
                    </Text>
                    <View className={`rounded-full px-2 py-0.5 ${STATUS_COLORS[item.status].split(' ')[0]}`}>
                        <Text className={`text-xs font-medium ${STATUS_COLORS[item.status].split(' ')[1]}`}>
                            {STATUS_LABELS[item.status]}
                        </Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                    {item.title}
                </Text>
                <Text className="mb-2 text-base font-medium text-secondary-600 dark:text-secondary-400">
                    {item.company}
                </Text>

                <View className="mt-2 flex-row items-center border-t border-secondary-100 pt-2 dark:border-secondary-800">
                    <Feather name="user" size={14} color="#64748B" />
                    <Text className="ml-1 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                        {user ? user.name : 'Utilisateur inconnu'}
                    </Text>
                </View>

                {item.jobUrl && (
                    <Pressable
                        className="mt-3 flex-row items-center"
                        onPress={() => Linking.openURL(item.jobUrl!)}
                    >
                        <Feather name="external-link" size={14} color="#4F46E5" />
                        <Text className="ml-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                            Voir l'offre
                        </Text>
                    </Pressable>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-background-light p-4 dark:bg-background-dark">
            <View className="mb-4">
                <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Candidatures Globales</Text>

                {/* Search */}
                <View className="mb-4 flex-row items-center rounded-xl bg-surface-light px-4 py-2 dark:bg-surface-dark">
                    <Feather name="search" size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Rechercher titre, entreprise, candidat..."
                        placeholderTextColor="#94A3B8"
                        className="ml-2 flex-1 text-base text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredApplications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                contentContainerClassName="pb-4"
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Text className="text-secondary-500">Aucune candidature trouvée</Text>
                    </View>
                }
            />
        </View>
    );
}
