import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../services/config';
import { Meetup } from '../types/meetup';

type RootStackParamList = {
  MainApp: undefined; // Representa las tabs principales
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

  useEffect(() => {
    const fetchMeetupDetails = async () => {
      try {
        const meetupDoc = await getDoc(doc(db, 'meetups', route.params.meetupId));
        if (meetupDoc.exists()) {
          const meetupData = { id: meetupDoc.id, ...meetupDoc.data() } as Meetup;
          setMeetup(meetupData);

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
      navigation.navigate('MainApp', { screen: 'Profile' });
    } else {
      navigation.navigate('UserProfile', { userId });
    }
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
        setMeetup({ ...meetup, participants: meetup.participants.filter((id) => id !== user.uid) });
      } else if (meetup.participants.length < meetup.maxParticipants) {
        await updateDoc(meetupRef, { participants: arrayUnion(user.uid) });
        await updateDoc(userRef, { eventsAttended: arrayUnion(meetup.id) });
        setMeetup({ ...meetup, participants: [...meetup.participants, user.uid] });
      }
    } catch (error) {
      console.error('Error updating meetup participation:', error);
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

  const currentUser = auth.currentUser;
  const isUserInMeetup = currentUser && meetup.participants.includes(currentUser.uid);
  const isMeetupFull = meetup.participants.length >= meetup.maxParticipants;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{meetup.title}</Text>
      <Text style={styles.meetupCategory}>Category: {meetup.category}</Text>
      <Text style={styles.detail}>Description: {meetup.description}</Text>
      <Text style={styles.detail}>Date: {new Date(meetup.date).toLocaleString()}</Text>
      <Text style={styles.detail}>Location: {meetup.address}</Text>
      <Text style={styles.detail}>Created by: {meetup.creatorName}</Text>
      <Text style={styles.detail}>Participants: {participants.length}/{meetup.maxParticipants}</Text>

      {meetup.isFinished && (
        <Text style={styles.detail}>
          Average Rating: {meetup.averageRating ? meetup.averageRating.toFixed(1) : 'Not rated'}
        </Text>
      )}

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
  meetupCategory: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 10,
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
