import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function ProfileScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch user data
    setTimeout(() => {
      setUser({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Service St, City',
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.profileHeader, { backgroundColor: theme.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          Account Information
        </Text>
        <ProfileItem label="Email" value={user.email} theme={theme} />
        <ProfileItem label="Phone" value={user.phone} theme={theme} />
        <ProfileItem label="Address" value={user.address} theme={theme} />
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          Settings
        </Text>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            thumbColor={theme.primary}
            trackColor={{ false: '#767577', true: theme.primary }}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          About
        </Text>
        <Text style={[styles.aboutText, { color: theme.text }]}>
          Servana Home Services App v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const ProfileItem = ({ label, value, theme }) => (
  <View style={styles.profileItem}>
    <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3498db',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  value: {
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingText: {
    fontSize: 16,
  },
  aboutText: {
    fontSize: 14,
    opacity: 0.8,
  },
});