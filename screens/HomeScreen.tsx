import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Button, Text, Platform, SafeAreaView, FlatList, TouchableOpacity, Modal, useWindowDimensions} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/config';
import MeetupList from '../components/MeetupList';
import CreateMeetupForm from '../components/CreateMeetupForm';
import { Meetup } from '../types/meetup';
import { Picker, PickerIOS } from '@react-native-picker/picker';
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
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
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
    }else if(Platform.OS === 'ios'){
      
      return (
        <View>
          <TouchableOpacity style={styles.categoryButton} onPress={() => setShowCategoryPicker(true)}>
            <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
          </TouchableOpacity>
          <Modal
            visible={showCategoryPicker}
            animationType="fade"
            transparent={true}
            supportedOrientations={['portrait', 'landscape']}
          >
            <View style={styles.modalContainer}>
              <View style={[
                styles.pickerContainer,
                isLandscape && styles.pickerContainerLandscape
              ]}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => {
                    setSelectedCategory(itemValue);
                    setShowCategoryPicker(false);
                  }}
                  style={[styles.picker, isLandscape && styles.pickerLandscape]}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowCategoryPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );

    }else {
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
          <CreateMeetupForm onClose={() => setShowCreateForm(false)} />
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
                    title="Create New Meetup"
                    onPress={() => setShowCreateForm(true)}
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
  pickerLandscape: {
    width: '60%',
    height: 150,
  },
  pickerContainerLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  doneButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  categoryButtonText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;

function elseif(arg0: boolean) {
  throw new Error('Function not implemented.');
}
