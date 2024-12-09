import React, { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type Meeting = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  maxParticipants: number;
  category: string;
};

type RootStackParamList = {
  Home: { newMeeting?: Meeting } | undefined;
};

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const [meetingsData, setMeetingsData] = useState<Meeting[]>([
    { id: '1', title: 'Meeting 1', description: 'Meeting 1 description', location: 'Office', date: '2024-03-15T10:00', maxParticipants: 10, category: 'Work' },
    { id: '2', title: 'Meeting 2', description: 'Meeting 2 description', location: 'Home', date: '2024-03-16T14:00', maxParticipants: 5, category: 'Personal' },
    { id: '3', title: 'Meeting 3', description: 'Meeting 3 description', location: 'Client Site', date: '2024-03-17T09:00', maxParticipants: 8, category: 'Work' },
  ]);
  const [meetings, setMeetings] = useState<Meeting[]>(meetingsData);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const route = useRoute<HomeScreenRouteProp>();

  useEffect(() => {
    if (route.params?.newMeeting) {
      const newMeetingId = route.params.newMeeting.id;
      setMeetingsData(prevMeetings => {
        if (!prevMeetings.some(meeting => meeting.id === newMeetingId)) {
          const updatedMeetings = [route.params.newMeeting, ...prevMeetings];
          setMeetings(updatedMeetings);
          return updatedMeetings;
        }
        return prevMeetings;
      });
    }
  }, [route.params?.newMeeting]);

  useEffect(() => {
    setMeetings(meetingsData);
  }, [meetingsData]);

  const filterMeetings = (filterType: string) => {
    setActiveFilter(filterType);
    if (filterType === 'Todos') {
      setMeetings(meetingsData);
    } else {
      const filtered = meetingsData.filter(meeting => meeting.category === filterType);
      setMeetings(filtered);
    }
  };

  const renderMeetingItem = ({ item }: { item: Meeting }) => (
    <View style={styles.meetingItem}>
      <Text style={styles.meetingTitle}>{item.title}</Text>
      <Text style={styles.meetingInfo}>{item.category} - {item.location}</Text>
      <Text style={styles.meetingDate}>{new Date(item.date).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text onPress={() => filterMeetings('Todos')}>Todos</Text>
        <Text onPress={() => filterMeetings('Work')}>Work</Text>
        <Text onPress={() => filterMeetings('Personal')}>Personal</Text>
      </View>
      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#fff',
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
    marginTop: 5,
  },
  meetingDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default HomeScreen;


