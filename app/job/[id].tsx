import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Job, Application } from '../../src/types';
import { ApplicationForm, ApplicationSuccessScreen } from '../../src/components';
import { Colors } from '../../src/constants';
import { getJobById } from '../../src/services/jobService';
import { getApplications } from '../../src/services/jobApplication';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useAuth } from '../../src/hooks/useAuth';
import { StatusConfig } from '../../src/constants';
import { ApplicationStatus } from '../../src/types/jobApplication';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isRecruiter } = usePermissions();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);

  useEffect(() => {
    const loadJobAndApplication = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [fetchedJob] = await Promise.all([getJobById(id)]);
        setJob(fetchedJob);

        if (user && !isRecruiter) {
          const userApps = await getApplications(user.id);
          const found = userApps.find(app => app.jobId === id);
          if (found) {
            setExistingApplication(found as any);
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobAndApplication();
  }, [id, user, isRecruiter, submittedApplication]); // Re-run if a new app is submitted

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (submittedApplication) {
    return (
      <ApplicationSuccessScreen
        application={submittedApplication}
        jobTitle={job.title}
      />
    );
  }

  if (showApplicationForm) {
    return (
      <ApplicationForm
        jobId={job.id}
        jobTitle={job.title}
        recruiterId={job.recruiterId}
        company={job.company}
        location={job.location}
        onSubmitSuccess={(application) => {
          setShowApplicationForm(false);
          setSubmittedApplication(application);
        }}
        onCancel={() => setShowApplicationForm(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.company}</Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Location</Text>
            <Text style={styles.metaValue}>
              {job.location} {job.remote && '(Remote)'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{job.type}</Text>
          </View>
          {job.salary && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Salary</Text>
              <Text style={styles.metaValue}>{job.salary}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Description</Text>
        <Text style={styles.sectionContent}>{job.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        {job.requirements.map((requirement, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{requirement}</Text>
          </View>
        ))}
      </View>

      {job.benefits && job.benefits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          {job.benefits.map((benefit, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{benefit}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>Posted: {new Date(job.postedDate).toLocaleDateString()}</Text>
          {job.applicationDeadline && (
            <Text style={styles.dateText}>
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </Text>
          )}
        </View>
        {!isRecruiter && (
          existingApplication ? (
            <View style={[styles.applyButton, { backgroundColor: StatusConfig[existingApplication.status].color + '20' }]}>
              <Text style={[styles.applyButtonText, { color: StatusConfig[existingApplication.status].color }]}>
                {StatusConfig[existingApplication.status].label}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowApplicationForm(true)}
            >
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          )
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  company: {
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    minWidth: 120,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
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
  sectionContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  footer: {
    marginTop: 8,
    marginBottom: 32,
  },
  dateInfo: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.background,
    fontSize: 18,
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
