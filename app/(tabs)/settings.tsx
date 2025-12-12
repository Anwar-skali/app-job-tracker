import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isDark, toggleTheme, theme } = useThemeStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apparence</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="moon" size={24} color={theme.colors.text} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Mode sombre</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Activer le thème sombre
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={isDark ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>À propos</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Version</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>SDK Expo</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>54</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

