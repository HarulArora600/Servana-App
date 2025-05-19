import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ServiceCard from '../../components/ServiceCard';
import { useTheme } from '../context/ThemeContext';
import LoadingIndicator from '../../components/LoadingIndicator';

const servicesData = [
  {
    id: '1',
    title: 'Electrician',
    description: 'Wiring, repairs, installations',
    icon: '⚡',
  },
  {
    id: '2',
    title: 'Plumber',
    description: 'Leaks, installations, repairs',
    icon: '🚿',
  },
  {
    id: '3',
    title: 'Carpenter',
    description: 'Furniture, repairs, installations',
    icon: '🪚',
  },
  {
    id: '4',
    title: 'AC Repair',
    description: 'Installation and maintenance',
    icon: '❄️',
  },
  {
    id: '5',
    title: 'Painter',
    description: 'Interior and exterior painting',
    icon: '🎨',
  },
  {
    id: '6',
    title: 'Cleaning',
    description: 'Home and office cleaning',
    icon: '🧹',
  },
];

export default function ServicesScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Available Services
      </Text>
      <FlatList
        data={servicesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onPress={() =>
              navigation.navigate('ServiceDetail', { service: item })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});