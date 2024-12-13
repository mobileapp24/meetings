import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, Platform } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/config';
import MeetupList from '../components/MeetupList';
import CreateMeetupForm from '../components/CreateMeetupForm';
import { Meetup } from '../types/meetup';
import { Picker } from '@react-native-picker/picker';

const categories = ['All', 'Sports', 'Study', 'Social', 'Work', 'Other'];

const HomeScreen: React.FC = () => {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [filteredMeetups, setFilteredMeetups] = useState<Meetup[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'meetups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const meetupsData: Meetup[] = [];
      querySnapshot.forEach((doc) => {
        meetupsData.push({ id: doc.id, ...doc.data() } as Meetup);
      });
      setMeetups(meetupsData);
      setFilteredMeetups(meetupsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredMeetups(meetups);
    } else {
      setFilteredMeetups(meetups.filter(meetup => meetup.category === selectedCategory));
    }
  }, [selectedCategory, meetups]);

  const handleMeetupPress = (meetup: Meetup) => {
    // TODO: Implement navigation to meetup details screen
    console.log('Meetup pressed:', meetup);
  };

  const renderCategoryPicker = () => {
    if (Platform.OS === 'web') {
      return (
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.webSelect}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      );
    } else {
      return (
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      );
    }
  };

  return (
    <View style={styles.container}>
      {showCreateForm ? (
        <CreateMeetupForm />
      ) : (
        <>
          <Text style={styles.filterLabel}>Filter by Category:</Text>
          {renderCategoryPicker()}
          <MeetupList meetups={filteredMeetups} onMeetupPress={handleMeetupPress} />
          <Button
            title="Create New Meetup"
            onPress={() => setShowCreateForm(true)}
          />
        </>
      )}
      {showCreateForm && (
        <Button
          title="Back to Meetups"
          onPress={() => setShowCreateForm(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  webSelect: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
});

export default HomeScreen;

