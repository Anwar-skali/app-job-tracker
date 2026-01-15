import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, StatusConfig } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Feather } from '@expo/vector-icons';
import { getApplicationStats, getApplications } from '@/services/jobApplication';
import { getJobsByRecruiter } from '@/services/jobService';
import { JobApplication, ApplicationStats, ApplicationStatus } from '@/types/jobApplication';
import { Job } from '@/types/job';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [candidateStats, setCandidateStats] = useState<ApplicationStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [recruiterJobStats, setRecruiterJobStats] = useState({ active: 0, archived: 0, total: 0 });

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (user.role === UserRole.CANDIDATE) {
        // Load Candidate Data
        const stats = await getApplicationStats(user.id);
        setCandidateStats(stats);

        const apps = await getApplications(user.id);
        const sortedApps = apps.sort((a, b) =>
          new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
        );
        setRecentApplications(sortedApps.slice(0, 3));
      } else if (user.role === UserRole.RECRUITER) {
        // Load Recruiter Data
        const jobs = await getJobsByRecruiter(user.id);
        setRecruiterJobs(jobs.slice(0, 3));

        const active = jobs.filter(j => !j.archived).length;
        const archived = jobs.filter(j => j.archived).length;
        setRecruiterJobStats({ active, archived, total: jobs.length });
      } else if (user.role === UserRole.ADMIN) {
        // Admin redirect? Or show simple stats?
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bonne après-midi';
    return 'Bonsoir';
  };

  if (loading && !refreshing && !candidateStats && !recruiterJobStats.total) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderCandidateView = () => (
    <>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Feather name="send" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{candidateStats?.total || 0}</Text>
          <Text style={styles.statLabel}>Candidatures</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
            <Feather name="calendar" size={24} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>{candidateStats?.interviews || 0}</Text>
          <Text style={styles.statLabel}>Entretiens</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.success + '20' }]}>
            <Feather name="check-circle" size={24} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>
            {candidateStats?.byStatus[ApplicationStatus.ACCEPTED] || 0}
          </Text>
          <Text style={styles.statLabel}>Offres</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/application/new' as any)}
        >
          <Feather name="plus-circle" size={20} color="white" />
          <Text style={styles.actionButtonText}>Ajouter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => router.push('/(tabs)/search' as any)}
        >
          <Feather name="search" size={20} color={Colors.text} />
          <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Applications */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activités récentes</Text>
        <TouchableOpacity onPress={() => router.push('/applications')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {recentApplications.map((app) => (
        <TouchableOpacity
          key={app.id}
          style={styles.recentItem}
          onPress={() => router.push(`/application/${app.id}` as any)}
        >
          <View style={styles.recentItemContent}>
            <Text style={styles.recentTitle}>{app.title}</Text>
            <Text style={styles.recentSubtitle}>{app.company}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: StatusConfig[app.status]?.color + '20' }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: StatusConfig[app.status]?.color }
              ]}
            >
              {StatusConfig[app.status]?.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {recentApplications.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune candidature récente</Text>
        </View>
      )}
    </>
  );

  const renderRecruiterView = () => (
    <>
      {/* Recruiter Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Feather name="briefcase" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{recruiterJobStats.active}</Text>
          <Text style={styles.statLabel}>Offres Actives</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.warning + '20' }]}>
            <Feather name="archive" size={24} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>{recruiterJobStats.archived}</Text>
          <Text style={styles.statLabel}>Archivées</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
            <Feather name="users" size={24} color={Colors.secondary} />
          </View>
          {/* Note: Total applications would require another fetch, simplifying for now */}
          <Text style={styles.statValue}>{recruiterJobStats.total}</Text>
          <Text style={styles.statLabel}>Total Offres</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/job/new' as any)}
        >
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.actionButtonText}>Publier une offre</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={() => router.push('/recruiter/applications' as any)}
        >
          <Feather name="list" size={20} color={Colors.text} />
          <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Candidatures</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Jobs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vos dernières offres</Text>
        <TouchableOpacity onPress={() => router.push('/recruiter/jobs' as any)}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {recruiterJobs.map((job) => (
        <TouchableOpacity
          key={job.id}
          style={styles.recentItem}
          onPress={() => router.push(`/job/${job.id}` as any)}
        >
          <View style={styles.recentItemContent}>
            <Text style={styles.recentTitle}>{job.title}</Text>
            <Text style={styles.recentSubtitle}>{job.location} • {job.type}</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Feather name="chevron-right" size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      ))}

      {recruiterJobs.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune offre publiée</Text>
        </View>
      )}
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
          {/* Avatar placeholder or image */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {user?.role === UserRole.CANDIDATE && renderCandidateView()}
      {user?.role === UserRole.RECRUITER && renderRecruiterView()}
      {user?.role === UserRole.ADMIN && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Dashboard Admin accessible via le menu</Text>
          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={() => router.push('/admin/dashboard' as any)}
          >
            <Text style={styles.buttonText}>Aller au Dashboard Admin</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryActionText: {
    color: '#374151',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  recentItemContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

