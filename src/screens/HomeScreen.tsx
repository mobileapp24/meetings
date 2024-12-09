import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Datos de ejemplo para las reuniones
const meetingsData = [
  { id: '1', title: 'Sesión de estudio: Matemáticas', type: 'Estudio', location: 'Biblioteca Central' },
  { id: '2', title: 'Coworking: Desarrolladores', type: 'Trabajo', location: 'Café Emprendedor' },
  { id: '3', title: 'Partido de fútbol', type: 'Deporte', location: 'Parque Municipal' },
  { id: '4', title: 'Club de lectura', type: 'Ocio', location: 'Librería Ateneo' },
  // Añade más reuniones aquí
];

const HomeScreen = () => {
  const [meetings, setMeetings] = useState(meetingsData);
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filterMeetings = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === 'Todos') {
      setMeetings(meetingsData);
    } else {
      const filtered = meetingsData.filter(meeting => meeting.type === filterType);
      setMeetings(filtered);
    }
  };

  const renderMeetingItem = ({ item }) => (
    <View style={styles.meetingItem}>
      <Text style={styles.meetingTitle}>{item.title}</Text>
      <Text style={styles.meetingInfo}>{item.type} - {item.location}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['Todos', 'Estudio', 'Trabajo', 'Deporte', 'Ocio'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, activeFilter === filter && styles.activeFilter]}
            onPress={() => filterMeetings(filter)}
          >
            <Text style={styles.filterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  meetingItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meetingInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;