import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { JobList } from '@/components/JobList';
import { fetchJobs, searchJobs } from '@/services/job';
import { Job, JobFilters, JobType } from '@/types/job';
import { Colors } from '@/constants/colors';

const JobTypeLabels: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Temps plein',
  [JobType.PART_TIME]: 'Temps partiel',
  [JobType.CONTRACT]: 'Contrat',
  [JobType.INTERNSHIP]: 'Stage',
  [JobType.FREELANCE]: 'Freelance',
  [JobType.TEMPORARY]: 'Temporaire',
};

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        loadJobs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs({
        ...filters,
        limit: 50,
      });
      setJobs(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les offres d\'emploi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const data = await searchJobs(searchQuery, filters);
      setJobs(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rechercher les offres d\'emploi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobPress = (job: Job) => {
    // Ouvrir le lien de l'offre dans le navigateur
    Linking.openURL(job.jobUrl).catch(err => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      console.error('Error opening URL:', err);
    });
  };

  const toggleFilter = (key: keyof JobFilters, value: any) => {
    setFilters(prev => {
      if (prev[key] === value) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un emploi, une entreprise..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather
            name="filter"
            size={20}
            color={showFilters ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Lieu</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Paris, Lyon..."
                placeholderTextColor={Colors.textSecondary}
                value={filters.location || ''}
                onChangeText={(text) => toggleFilter('location', text || undefined)}
              />
            </View>

            {/* Remote Filter */}
            <TouchableOpacity
              style={[
                styles.filterChip,
                filters.remote && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter('remote', !filters.remote)}
            >
              <Feather
                name="home"
                size={14}
                color={filters.remote ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filters.remote && styles.filterChipTextActive,
                ]}
              >
                Télétravail
              </Text>
            </TouchableOpacity>

            {/* Job Type Filters */}
            {Object.values(JobType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  filters.type === type && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('type', filters.type === type ? undefined : type)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.type === type && styles.filterChipTextActive,
                  ]}
                >
                  {JobTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Feather name="x-circle" size={16} color={Colors.error} />
                <Text style={styles.clearFiltersText}>Effacer</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {Object.keys(filters).length} filtre(s) actif(s)
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersLink}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Jobs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des offres...</Text>
        </View>
      ) : (
        <JobList
          jobs={jobs}
          onJobPress={handleJobPress}
          emptyMessage={
            searchQuery.trim()
              ? 'Aucune offre ne correspond à votre recherche'
              : 'Aucune offre d\'emploi disponible'
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  filtersPanel: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterSection: {
    marginRight: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    minWidth: 120,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
    marginRight: 8,
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activeFiltersText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  clearFiltersLink: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

