
// Récupérer tous les utilisateurs (Admin)
export const getAllUsers = async (): Promise<User[]> => {
    // Sur web, utiliser AsyncStorage
    if (Platform.OS === 'web') {
        const webDb = await import('./database.web');
        return await webDb.getAllUsers();
    }

    const database = getDatabase();
    try {
        const result = await database.getAllAsync<any>(
            'SELECT id, name, email, role, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
        );
        return result;
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
};
