import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Button, Text, Platform, ScrollView, SafeAreaView } from 'react-native';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../services/config';
import MeetupList from '../components/MeetupList';
import CreateMeetupForm from '../components/CreateMeetupForm';
import { Meetup } from '../types/meetup';
import { Picker } from '@react-native-picker/picker';
import { updateMeetupStatus } from '../utils/meetupUtils';
import { useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Sports', 'Study', 'Social', 'Work', 'Other'];

const HomeScreen: React.FC = () => {
  const [activeMeetups, setActiveMeetups] = useState<Meetup[]>([]);
  const [finishedMeetups, setFinishedMeetups] = useState<Meetup[]>([]);
  const [filteredActiveMeetups, setFilteredActiveMeetups] = useState<Meetup[]>([]);
  const [filteredFinishedMeetups, setFilteredFinishedMeetups] = useState<Meetup[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchMeetups = useCallback(() => {
    const now = new Date();
    const activeMeetupsQuery = query(
      collection(db, 'meetups'),
      where('isFinished', '==', false),
      orderBy('date', 'asc')
    );
    const finishedMeetupsQuery = query(
      collection(db, 'meetups'),
      where('isFinished', '==', true),
      orderBy('date', 'desc')
    );

    const unsubscribeActive = onSnapshot(activeMeetupsQuery, (querySnapshot) => {
      const meetupsData: Meetup[] = [];
      querySnapshot.forEach((doc) => {
        meetupsData.push({ id: doc.id, ...doc.data() } as Meetup);
      });
      setActiveMeetups(meetupsData);
      setFilteredActiveMeetups(meetupsData);
    });

    const unsubscribeFinished = onSnapshot(finishedMeetupsQuery, (querySnapshot) => {
      const meetupsData: Meetup[] = [];
      querySnapshot.forEach((doc) => {
        meetupsData.push({ id: doc.id, ...doc.data() } as Meetup);
      });
      setFinishedMeetups(meetupsData);
      setFilteredFinishedMeetups(meetupsData);
    });

    return () => {
      unsubscribeActive();
      unsubscribeFinished();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateMeetupStatus().then(() => {
        fetchMeetups();
      });
    }, [fetchMeetups])
  );

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredActiveMeetups(activeMeetups);
      setFilteredFinishedMeetups(finishedMeetups);
    } else {
      setFilteredActiveMeetups(activeMeetups.filter(meetup => meetup.category === selectedCategory));
      setFilteredFinishedMeetups(finishedMeetups.filter(meetup => meetup.category === selectedCategory));
    }
  }, [selectedCategory, activeMeetups, finishedMeetups]);

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showCreateForm ? (
          <CreateMeetupForm />
        ) : (
          <ScrollView style={styles.scrollView}>
            <Text style={styles.filterLabel}>Filter by Category:</Text>
            {renderCategoryPicker()}
            <Text style={styles.sectionTitle}>Active Meetups</Text>
            <MeetupList
              meetups={filteredActiveMeetups}
              onMeetupPress={handleMeetupPress}
              isFinishedList={false}
            />
            <Text style={styles.sectionTitle}>Finished Meetups</Text>
            <MeetupList
              meetups={filteredFinishedMeetups}
              onMeetupPress={handleMeetupPress}
              isFinishedList={true}
            />
          </ScrollView>
        )}
        <View style={styles.buttonContainer}>
          <Button
            title={showCreateForm ? "Back to Meetups" : "Create New Meetup"}
            onPress={() => setShowCreateForm(!showCreateForm)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
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
  buttonContainer: {
    marginTop: 10,
  },
});

export default HomeScreen;


