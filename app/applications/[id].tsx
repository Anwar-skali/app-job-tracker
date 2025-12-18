import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Application } from '../../src/types';
import { getAllApplications } from '../../src/services';
import { Colors } from '../../src/constants';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const all = await getAllApplications();
        const found = all.find((app) => app.id === id);
        setApplication(found || null);
      } catch (error) {
        console.error('Error loading application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadApplication();
    }
  }, [id]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      case 'reviewing':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading application...</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Application not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(application.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(application.status) }]}
            >
              {application.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>
        <Text style={styles.applicationId}>ID: {application.id}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Job ID:</Text>
          <Text style={styles.infoValue}>{application.jobId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Submitted:</Text>
          <Text style={styles.infoValue}>{formatDate(application.submittedDate)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Applicant Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{application.applicantName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{application.applicantEmail}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{application.applicantPhone}</Text>
        </View>
      </View>

      {application.coverLetter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <Text style={styles.coverLetterText}>{application.coverLetter}</Text>
        </View>
      )}

      {(application.linkedInUrl || application.portfolioUrl || application.resume) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {application.linkedInUrl && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>LinkedIn:</Text>
              <Text style={[styles.infoValue, styles.link]}>{application.linkedInUrl}</Text>
            </View>
          )}
          {application.portfolioUrl && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Portfolio:</Text>
              <Text style={[styles.infoValue, styles.link]}>{application.portfolioUrl}</Text>
            </View>
          )}
          {application.resume && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Resume:</Text>
              <Text style={styles.infoValue}>Attached</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Applications</Text>
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
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  applicationId: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  coverLetterText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    padding: 12,
    backgroundColor: Colors.border,
    borderRadius: 8,
  },
  footer: {
    marginTop: 8,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
