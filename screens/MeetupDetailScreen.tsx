import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../services/config';
import { Meetup } from '../types/meetup';
import CustomAlert from '../components/CustomAlert';

type RootStackParamList = {
  Profile: undefined;
  UserProfile: { userId: string };
};

type MeetupDetailScreenProps = {
  route: {
    params: {
      meetupId: string;
    };
  };
};

const MeetupDetailScreen: React.FC<MeetupDetailScreenProps> = ({ route }) => {
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const currentUser = auth.currentUser;
  const isUserInMeetup = currentUser && meetup?.participants.includes(currentUser.uid);
  const isMeetupFull = meetup?.participants?.length >= meetup?.maxParticipants || false;


  useEffect(() => {
    const fetchMeetupDetails = async () => {
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

  const handleParticipantPress = (userId: string) => {
    const currentUser = auth.currentUser;
    if (currentUser && userId === currentUser.uid) {
      navigation.navigate( 'Profile');
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  };

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleJoinLeaveMeetup = async () => {
    const user = auth.currentUser;
    if (!user || !meetup) return;

    const userRef = doc(db, 'users', user.uid);
    const meetupRef = doc(db, 'meetups', meetup.id);

    try {
      if (meetup.participants.includes(user.uid)) {
        await updateDoc(meetupRef, { participants: arrayRemove(user.uid) });
        await updateDoc(userRef, { eventsAttended: arrayRemove(meetup.id) });
        setMeetup({ ...meetup, participants: meetup.participants.filter(id => id !== user.uid) });
        setParticipants(participants.filter(p => p.id !== user.uid));
        showAlert('Success', 'Left meetup successfully');
      } else if (meetup.participants.length < meetup.maxParticipants) {
        await updateDoc(meetupRef, { participants: arrayUnion(user.uid) });
        await updateDoc(userRef, { eventsAttended: arrayUnion(meetup.id) });
        setMeetup({ ...meetup, participants: [...meetup.participants, user.uid] });
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setParticipants([...participants, { id: user.uid, name: userDoc.data()?.name || 'Unknown User' }]);
        showAlert('Success', 'Joined meetup successfully');
      } else {
        showAlert('Info', 'Meetup is full');
      }
    } catch (error) {
      console.error('Error updating meetup participation:', error);
      showAlert('Error', 'Failed to update meetup participation. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!meetup) {
    return (
      <View style={styles.centerContainer}>
        <Text>Meetup not found</Text>
      </View>
    );
  }

  return (
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
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  participantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MeetupDetailScreen;