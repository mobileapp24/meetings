import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Button, Text, Platform, ScrollView, SafeAreaView } from 'react-native';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'; // Utilities for querying data
import { db } from '../services/config'; // Firebase database configuration
import MeetupList from '../components/MeetupList'; // To display a list of meetups
import CreateMeetupForm from '../components/CreateMeetupForm'; // Form for creating a new meetup
import { Meetup } from '../types/meetup'; // TypeScript type definition for meetups
import { Picker } from '@react-native-picker/picker'; // For category filtering
import { updateMeetupStatus } from '../utils/meetupUtils'; // To update the status of meetups
import { useFocusEffect } from '@react-navigation/native'; // Perform actions when the screen gains focus

const categories = ['All', 'Sports', 'Study', 'Social', 'Work', 'Other']; // Predefined to filter meetups

const HomeScreen: React.FC = () => {
  // Manage states of active, finished or filtered meetups
  const [activeMeetups, setActiveMeetups] = useState<Meetup[]>([]);
  const [finishedMeetups, setFinishedMeetups] = useState<Meetup[]>([]);
  const [filteredActiveMeetups, setFilteredActiveMeetups] = useState<Meetup[]>([]);
  const [filteredFinishedMeetups, setFilteredFinishedMeetups] = useState<Meetup[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Function to fetch meetups from Firestore based on their status 
  const fetchMeetups = useCallback(() => {
    const now = new Date();
    const activeMeetupsQuery = query(
      collection(db, 'meetups'),
      where('isFinished', '==', false),  // Filter only for active meetups
      orderBy('date', 'asc') // Order by ascending date (the closest ones appear closer)
    );
    const finishedMeetupsQuery = query(
      collection(db, 'meetups'),
      where('isFinished', '==', true),  // Filter only for finished meetups
      orderBy('date', 'desc') // Order by descending date (most recently expired meetups appear above)
    );

    // Real-time updates for active meetups
    const unsubscribeActive = onSnapshot(activeMeetupsQuery, (querySnapshot) => {
      const meetupsData: Meetup[] = [];
      querySnapshot.forEach((doc) => {
        meetupsData.push({ id: doc.id, ...doc.data() } as Meetup);  // Map documents to the Meetup type
      });
      setActiveMeetups(meetupsData);
      setFilteredActiveMeetups(meetupsData);
    });
    
    // Real-time updates for finished meetups
    const unsubscribeFinished = onSnapshot(finishedMeetupsQuery, (querySnapshot) => {
      const meetupsData: Meetup[] = [];
      querySnapshot.forEach((doc) => {
        meetupsData.push({ id: doc.id, ...doc.data() } as Meetup);  // Map documents to the Meetup type
      });
      setFinishedMeetups(meetupsData);
      setFilteredFinishedMeetups(meetupsData);
    });

    // Cleanup subscriptions when the component unmounts
    return () => {
      unsubscribeActive();
      unsubscribeFinished();
    };
  }, []);

  // Update the status of meetups when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      updateMeetupStatus().then(() => {
        fetchMeetups(); // Fetch updated meetups after statuses are updated
      });
    }, [fetchMeetups])
  );

  // Filter meetups (both active and finished) based on the selected category
  useEffect(() => {
    if (selectedCategory === 'All') { // Show all meetups, without filtering
      setFilteredActiveMeetups(activeMeetups);
      setFilteredFinishedMeetups(finishedMeetups);
    } else {
      setFilteredActiveMeetups(activeMeetups.filter(meetup => meetup.category === selectedCategory));
      setFilteredFinishedMeetups(finishedMeetups.filter(meetup => meetup.category === selectedCategory));
    }
  }, [selectedCategory, activeMeetups, finishedMeetups]);

  // Handle the press action for a meetup
  const handleMeetupPress = (meetup: Meetup) => {
    console.log('Meetup pressed:', meetup);
  };

  // Render a category picker or dropdown based on the used platform (web or mobile phone)
  const renderCategoryPicker = () => {
    // Category picker for web
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
    // Category picker for mobile phones
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
          <CreateMeetupForm /> // Show the meetup creation formulary if selected
        ) : ( 
          // Otherwise, show the meetups list
          <ScrollView style={styles.scrollView}> 
            <Text style={styles.filterLabel}>Filter by Category:</Text>
            {/* // Display the category picker */}
            {renderCategoryPicker()} 

            {/* Active Meetups */}
            <Text style={styles.sectionTitle}>Active Meetups</Text>
            <MeetupList
              meetups={filteredActiveMeetups}
              onMeetupPress={handleMeetupPress}
              isFinishedList={false}
            />
            
            {/* Finished Meetups */}
            <Text style={styles.sectionTitle}>Finished Meetups</Text>
            <MeetupList
              meetups={filteredFinishedMeetups}
              onMeetupPress={handleMeetupPress}
              isFinishedList={true}
            />
          </ScrollView>
        )}

        {/* Button to select the meetups list screen or the creation meetup form */}
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
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fffff',
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
    backgroundColor: '#f3f4f6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    borderRadius: 12,
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


