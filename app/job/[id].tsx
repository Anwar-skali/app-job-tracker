import React, { useState } from 'react';
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

const mockJob: Job = {
  id: '1',
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  type: 'full-time',
  salary: '$120,000 - $150,000',
  description:
    'We are looking for an experienced Senior Software Engineer to join our dynamic team. You will be responsible for designing and developing scalable web applications, collaborating with cross-functional teams, and mentoring junior developers.',
  requirements: [
    '5+ years of experience in software development',
    'Proficiency in React, TypeScript, and Node.js',
    'Experience with cloud platforms (AWS, Azure, or GCP)',
    'Strong problem-solving and communication skills',
    'Bachelor\'s degree in Computer Science or related field',
  ],
  benefits: [
    'Health, dental, and vision insurance',
    '401(k) matching',
    'Flexible work hours',
    'Remote work options',
    'Professional development budget',
  ],
  postedDate: '2024-01-15',
  applicationDeadline: '2024-02-15',
  remote: true,
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [isLoading] = useState(false);

  const job = mockJob;

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
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => setShowApplicationForm(true)}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
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
