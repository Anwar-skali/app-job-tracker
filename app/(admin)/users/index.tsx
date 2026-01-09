import { useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Alert, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { User, UserRole } from '@/types';
import { getAllUsers, updateUserRole, deleteUser } from '@/services/userService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            filterUsers(allUsers, searchQuery, roleFilter);
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUsers();
        }, [])
    );

    const filterUsers = (data: User[], query: string, role: 'all' | UserRole) => {
        let result = data;

        if (query) {
            const lowerQuery = query.toLowerCase();
            result = result.filter(
                (u) =>
                    u.name.toLowerCase().includes(lowerQuery) ||
                    u.email.toLowerCase().includes(lowerQuery)
            );
        }

        if (role !== 'all') {
            result = result.filter((u) => u.role === role);
        }

        setFilteredUsers(result);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        filterUsers(users, text, roleFilter);
    };

    const handleRoleFilter = (role: 'all' | UserRole) => {
        setRoleFilter(role);
        filterUsers(users, searchQuery, role);
    };

    const handleDelete = (userId: string) => {
        Alert.alert(
            'Supprimer l\'utilisateur',
            'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await deleteUser(userId);
                            if (success) {
                                Alert.alert('Succès', 'Utilisateur supprimé');
                                loadUsers();
                            } else {
                                Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
                            }
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            Alert.alert('Erreur', 'Une erreur est survenue');
                        }
                    },
                },
            ]
        );
    };

    const toggleAdminRole = (userId: string, currentRole: UserRole) => {
        const newRole = currentRole === UserRole.ADMIN ? UserRole.CANDIDATE : UserRole.ADMIN;
        const action = newRole === UserRole.ADMIN ? 'promouvoir admin' : 'rétrograder utilisateur';

        Alert.alert(
            'Modifier le rôle',
            `Voulez-vous ${action} cet utilisateur ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        try {
                            const success = await updateUserRole(userId, newRole);
                            if (success) {
                                loadUsers();
                            } else {
                                Alert.alert('Erreur', 'Impossible de modifier le rôle');
                            }
                        } catch (error) {
                            console.error('Error updating role:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: User }) => (
        <View className="mb-4 rounded-xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</Text>
                    <Text className="text-sm text-secondary-500">{item.email}</Text>
                    <View className="mt-2 flex-row gap-2">
                        <View className={`rounded-full px-2 py-1 ${item.role === UserRole.ADMIN
                                ? 'bg-purple-100 dark:bg-purple-900'
                                : item.role === UserRole.RECRUITER
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                            <Text className={`text-xs font-semibold ${item.role === UserRole.ADMIN
                                    ? 'text-purple-700 dark:text-purple-300'
                                    : item.role === UserRole.RECRUITER
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {item.role === UserRole.ADMIN ? 'Admin' : item.role === UserRole.RECRUITER ? 'Recruteur' : 'Candidat'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-2">
                    <Pressable
                        className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
                        onPress={() => toggleAdminRole(item.id, item.role)}
                    >
                        <Feather
                            name={item.role === UserRole.ADMIN ? "shield-off" : "shield"}
                            size={20}
                            color={item.role === UserRole.ADMIN ? "#EF4444" : "#4F46E5"}
                        />
                    </Pressable>
                    <Pressable
                        className="rounded-full bg-red-100 p-2 dark:bg-red-900"
                        onPress={() => handleDelete(item.id)}
                    >
                        <Feather name="trash-2" size={20} color="#EF4444" />
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background-light p-4 dark:bg-background-dark">
            <View className="mb-4">
                <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Utilisateurs</Text>

                {/* Search */}
                <View className="mb-4 flex-row items-center rounded-xl bg-surface-light px-4 py-2 dark:bg-surface-dark">
                    <Feather name="search" size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Rechercher..."
                        placeholderTextColor="#94A3B8"
                        className="ml-2 flex-1 text-base text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                {/* Filters */}
                <View className="flex-row gap-2">
                    <Pressable
                        className={`rounded-full px-4 py-2 ${roleFilter === 'all' ? 'bg-primary-600' : 'bg-surface-light dark:bg-surface-dark'}`}
                        onPress={() => handleRoleFilter('all')}
                    >
                        <Text className={roleFilter === 'all' ? 'text-white' : 'text-gray-900 dark:text-white'}>Tous</Text>
                    </Pressable>
                    <Pressable
                        className={`rounded-full px-4 py-2 ${roleFilter === UserRole.CANDIDATE ? 'bg-primary-600' : 'bg-surface-light dark:bg-surface-dark'}`}
                        onPress={() => handleRoleFilter(UserRole.CANDIDATE)}
                    >
                        <Text className={roleFilter === UserRole.CANDIDATE ? 'text-white' : 'text-gray-900 dark:text-white'}>Cand.</Text>
                    </Pressable>
                    <Pressable
                        className={`rounded-full px-4 py-2 ${roleFilter === UserRole.ADMIN ? 'bg-primary-600' : 'bg-surface-light dark:bg-surface-dark'}`}
                        onPress={() => handleRoleFilter(UserRole.ADMIN)}
                    >
                        <Text className={roleFilter === UserRole.ADMIN ? 'text-white' : 'text-gray-900 dark:text-white'}>Admin</Text>
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
                contentContainerClassName="pb-4"
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Text className="text-secondary-500">Aucun utilisateur trouvé</Text>
                    </View>
                }
            />
        </View>
    );
}
