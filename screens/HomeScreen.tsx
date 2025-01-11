import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Button, Text, Platform, SafeAreaView, FlatList } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/config';
import MeetupList from '../components/MeetupList';
import CreateMeetupForm from '../components/CreateMeetupForm';
import { Meetup } from '../types/meetup';
import { Picker } from '@react-native-picker/picker';
import { updateMeetupStatus } from '../utils/meetupUtils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AccordionSection from '../components/AccordionSection';

type RootStackParamList = {
  MeetupDetail: { meetupId: string };
};

const categories = ['All', 'Sports', 'Study', 'Social', 'Work', 'Other'];

const HomeScreen: React.FC = () => {
  const [activeMeetups, setActiveMeetups] = useState<Meetup[]>([]);
  const [finishedMeetups, setFinishedMeetups] = useState<Meetup[]>([]);
  const [filteredActiveMeetups, setFilteredActiveMeetups] = useState<Meetup[]>([]);
  const [filteredFinishedMeetups, setFilteredFinishedMeetups] = useState<Meetup[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const fetchMeetups = useCallback(async () => {
    setLoading(true);
    const q = query(
      collection(db, 'meetups'),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetupsData: Meetup[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Meetup,
      }));
      setActiveMeetups(meetupsData.filter((meetup) => !meetup.isFinished));
      setFinishedMeetups(meetupsData.filter((meetup) => meetup.isFinished));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const filteredActive = selectedCategory === 'All'
      ? activeMeetups
      : activeMeetups.filter((meetup) => meetup.category === selectedCategory);
    const filteredFinished = selectedCategory === 'All'
      ? finishedMeetups
      : finishedMeetups.filter((meetup) => meetup.category === selectedCategory);
    setFilteredActiveMeetups(filteredActive);
    setFilteredFinishedMeetups(filteredFinished);
  }, [activeMeetups, finishedMeetups, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      updateMeetupStatus().then(() => {
        fetchMeetups();
      });
    }, [fetchMeetups])
  );

  const handleMeetupPress = (meetup: Meetup) => {
    navigation.navigate('MeetupDetail', { meetupId: meetup.id });
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

  const renderSection = useCallback(({ item }: { item: { title: string; data: Meetup[]; isFinished: boolean } }) => (
    <AccordionSection title={`${item.title} (${item.data.length})`}>
      <MeetupList
        meetups={item.data}
        onMeetupPress={handleMeetupPress}
        isFinishedList={item.isFinished}
      />
    </AccordionSection>
  ), [handleMeetupPress]);

  const sections = [
    { title: 'Active Meetups', data: filteredActiveMeetups, isFinished: false },
    { title: 'Finished Meetups', data: filteredFinishedMeetups, isFinished: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showCreateForm ? (
          <CreateMeetupForm />
        ) : (
          <>
            <Text style={styles.filterLabel}>Filter by Category:</Text>
            {renderCategoryPicker()}
            <FlatList
              data={sections}
              renderItem={renderSection}
              keyExtractor={(item) => item.title}
              ListFooterComponent={
                <View style={styles.buttonContainer}>
                  <Button
                    title={showCreateForm ? "Back to Meetups" : "Create New Meetup"}
                    onPress={() => setShowCreateForm(!showCreateForm)}
                  />
                </View>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  scrollViewContent: {
    flexGrow: 1,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default HomeScreen;