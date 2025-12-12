import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getApplicationStats } from '@/services/jobApplication';
import { ApplicationStats, ApplicationStatus } from '@/types/jobApplication';
import { StatusConfig } from '@/constants';
import { Colors } from '@/constants/colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getApplicationStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>Aucune donnée disponible</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      {/* Statistiques principales */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total candidatures</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.interviews}</Text>
          <Text style={styles.statLabel}>Entretiens</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.successRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Taux de réussite</Text>
        </View>
      </View>

      {/* Répartition par statut */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Répartition par statut</Text>
        {Object.entries(stats.byStatus).map(([status, count]) => {
          const statusConfig = StatusConfig[status as ApplicationStatus];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

          return (
            <View key={status} style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: statusConfig.color },
                  ]}
                />
                <Text style={styles.statusLabel}>{statusConfig.label}</Text>
              </View>
              <View style={styles.statusBarContainer}>
                <View
                  style={[
                    styles.statusBar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: statusConfig.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.statusCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Évolution dans le temps */}
      {stats.evolution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Évolution</Text>
          <View style={styles.evolutionContainer}>
            {stats.evolution.map((item, index) => (
              <View key={index} style={styles.evolutionItem}>
                <Text style={styles.evolutionDate}>
                  {new Date(item.date + '-01').toLocaleDateString('fr-FR', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <View
                  style={[
                    styles.evolutionBar,
                    {
                      height: Math.max(20, (item.count / stats.total) * 100),
                    },
                  ]}
                />
                <Text style={styles.evolutionCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Actions rapides */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/applications' as any)}
        >
          <Text style={styles.actionButtonText}>Voir toutes les candidatures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/application/new' as any)}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
            Ajouter une candidature
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: Colors.background,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  statusBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    width: 30,
    textAlign: 'right',
  },
  evolutionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
    paddingVertical: 16,
  },
  evolutionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  evolutionDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  evolutionBar: {
    width: '80%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
    marginBottom: 4,
    minHeight: 20,
  },
  evolutionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  actionButtonTextPrimary: {
    color: Colors.background,
  },
});
