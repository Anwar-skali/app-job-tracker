import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ApplicationStats } from '@/types/jobApplication';

interface StatisticsCardsProps {
    stats: ApplicationStats;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
    return (
        <View className="flex-row gap-3">
            {/* Total Applications */}
            <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <Feather name="briefcase" size={20} color="#2563EB" />
                </View>
                <Text className="mb-1 text-3xl font-bold text-gray-900">{stats.total}</Text>
                <Text className="text-xs font-medium text-gray-500">Candidatures</Text>
            </View>

            {/* Interviews */}
            <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                    <Feather name="users" size={20} color="#9333EA" />
                </View>
                <Text className="mb-1 text-3xl font-bold text-gray-900">{stats.interviews}</Text>
                <Text className="text-xs font-medium text-gray-500">Entretiens</Text>
            </View>

            {/* Success Rate */}
            <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    <Feather name="trending-up" size={20} color="#10B981" />
                </View>
                <Text className="mb-1 text-3xl font-bold text-gray-900">{stats.successRate.toFixed(0)}%</Text>
                <Text className="text-xs font-medium text-gray-500">Succès</Text>
            </View>
        </View>
    );
};
