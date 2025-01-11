import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../services/config';
import { Meetup } from '../types/meetup';
import CustomAlert from '../components/CustomAlert';

// Define the navigation routes and their parameters
type RootStackParamList = {
  Profile: undefined;
  UserProfile: { userId: string };
};

// Define the props for the MeetupDetailScreen, including route parameters
type MeetupDetailScreenProps = {
  route: {
    params: {
      meetupId: string;
    };
  };
};

const MeetupDetailScreen: React.FC<MeetupDetailScreenProps> = ({ route }) => {
  const [meetup, setMeetup] = useState<Meetup | null>(null); // State for storing meetup details, initially null
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);  // State for storing the list of participants
  const [loading, setLoading] = useState(true);  // State for tracking whether data is loading
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();  // Typed navigation object for navigating to other screens
  const [alertVisible, setAlertVisible] = useState(false); // State for controlling the visibility of the custom alert
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');  // States for setting the title and message of the alert

  const currentUser = auth.currentUser;   // Retrieve the currently authenticated user
  const isUserInMeetup = currentUser && meetup?.participants.includes(currentUser.uid);
  const isMeetupFull = meetup?.participants?.length >= meetup?.maxParticipants || false;


  useEffect(() => {  // Effect to fetch meetup details when the component mounts or meetupId changes
    const fetchMeetupDetails = async () => { // Function to fetch details of a specific meetup
      try {
        const meetupDoc = await getDoc(doc(db, 'meetups', route.params.meetupId));
        if (meetupDoc.exists()) {
          const meetupData = { id: meetupDoc.id, ...meetupDoc.data() } as Meetup;
          setMeetup(meetupData);
          
          // Fetch participant names
          const participantPromises = meetupData.participants.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return { id: userId, name: userDoc.data()?.name || 'Unknown User' };
          });
          const participantData = await Promise.all(participantPromises);
          setParticipants(participantData);
        }
      } catch (error) {
        console.error('Error fetching meetup details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetupDetails();
  }, [route.params.meetupId]);

  // Navigate to the appropriate profile screen based on the user ID
  const handleParticipantPress = (userId: string) => {
    const currentUser = auth.currentUser;
    if (currentUser && userId === currentUser.uid) {
      navigation.navigate( 'Profile');
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  };

   // Helper function to display a custom alert
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

   // Function to handle joining or leaving a meetup
  const handleJoinLeaveMeetup = async () => {
    const user = auth.currentUser;
    if (!user || !meetup) return;

    const userRef = doc(db, 'users', user.uid);
    const meetupRef = doc(db, 'meetups', meetup.id);

    try {
      if (meetup.participants.includes(user.uid)) {// If the user is already part of the meetup, remove them
        await updateDoc(meetupRef, { participants: arrayRemove(user.uid) });
        await updateDoc(userRef, { eventsAttended: arrayRemove(meetup.id) });
        setMeetup({ ...meetup, participants: meetup.participants.filter(id => id !== user.uid) });
        setParticipants(participants.filter(p => p.id !== user.uid));
        showAlert('Success', 'Left meetup successfully');
      } else if (meetup.participants.length < meetup.maxParticipants) { // If there's space in the meetup, add the user
        await updateDoc(meetupRef, { participants: arrayUnion(user.uid) });
        await updateDoc(userRef, { eventsAttended: arrayUnion(meetup.id) });
        setMeetup({ ...meetup, participants: [...meetup.participants, user.uid] });
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setParticipants([...participants, { id: user.uid, name: userDoc.data()?.name || 'Unknown User' }]);
        showAlert('Success', 'Joined meetup successfully');
      } else {
        showAlert('Info', 'Meetup is full'); // Show alert if the meetup is full
      }
    } catch (error) {
      console.error('Error updating meetup participation:', error);
      showAlert('Error', 'Failed to update meetup participation. Please try again.');
    }
  };

  if (loading) {  // Render a loading spinner while fetching data
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!meetup) { // Render a fallback message if no meetup data is found
    return (
      <View style={styles.centerContainer}>
        <Text>Meetup not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{meetup.title}</Text>
      <Text style={styles.detail}>Category: {meetup.category}</Text>
      <Text style={styles.detail}>Description: {meetup.description}</Text>
      <Text style={styles.detail}>Date: {new Date(meetup.date).toLocaleString()}</Text>
      <Text style={styles.detail}>Location: {meetup.address}</Text>
      <Text style={styles.detail}>Created by: {meetup.creatorName}</Text>
      <Text style={styles.detail}>Participants: {participants.length}/{meetup.maxParticipants}</Text>
      
      {!meetup.isFinished && (
        <TouchableOpacity
          style={[
            styles.joinButton,
            isUserInMeetup ? styles.leaveButton : isMeetupFull ? styles.disabledButton : null
          ]}
          onPress={handleJoinLeaveMeetup}
          disabled={isMeetupFull && !isUserInMeetup}
        >
          <Text style={styles.joinButtonText}>
            {isUserInMeetup ? 'Leave' : isMeetupFull ? 'Full' : 'Join'}
          </Text>
        </TouchableOpacity>
      )}

      {meetup.isFinished && (
        <Text style={styles.detail}>
          Average Rating: {meetup.averageRating ? meetup.averageRating.toFixed(1) : 'Not rated'}
        </Text>
      )}

      <Text style={styles.subtitle}>Participants:</Text>
      {participants.map((participant) => (
        <TouchableOpacity
          key={participant.id}
          style={styles.participantItem}
          onPress={() => handleParticipantPress(participant.id)}
        >
          <Text>{participant.name}</Text>
        </TouchableOpacity>
      ))}
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#34495e',
  },
  detail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  participantItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  participantName: {
    fontSize: 16,
    color: '#2980b9',
  },
  joinButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    marginVertical: 15,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

export default MeetupDetailScreen;