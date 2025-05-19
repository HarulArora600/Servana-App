import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.serviceIcon, { color: theme.primary }]}>
          {service.icon}
        </Text>
        <Text style={[styles.serviceTitle, { color: theme.text }]}>
          {service.title}
        </Text>
      </View>

      <View
        style={[styles.detailsContainer, { backgroundColor: theme.cardBackground }]}
      >
        <Text style={[styles.description, { color: theme.text }]}>
          {service.description}
        </Text>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            About this service
          </Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            Our professional {service.title.toLowerCase()} services include all
            types of repairs, installations, and maintenance work. Certified
            professionals available 24/7.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Pricing
          </Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            Starting from $50 depending on the scope of work. Free estimates
            available.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => alert('Service requested!')}
      >
        <Text style={styles.buttonText}>Request Service</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  serviceIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  detailsContainer: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});