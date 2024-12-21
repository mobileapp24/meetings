import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Meetup } from '../types/meetup';
import { auth, db } from '../services/config';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import RateMeetupModal from './RateMeetupModal';

interface MeetupMyMeetingsProps {
  onMeetupPress: (meetup: Meetup) => void;
}

const MeetupMyMeetings: React.FC<MeetupMyMeetingsProps> = ({ onMeetupPress }) => {
  const [upcomingMeetups, setUpcomingMeetups] = useState<Meetup[]>([]);
  const [pastMeetups, setPastMeetups] = useState<Meetup[]>([]);
  const [createdMeetups, setCreatedMeetups] = useState<Meetup[]>([]);
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const updateMeetupLists = useCallback((meetups: Meetup[]) => {
    const now = new Date();
    const upcoming: Meetup[] = [];
    const past: Meetup[] = [];

    meetups.forEach(meetup => {
      if (new Date(meetup.date) > now) {
        upcoming.push(meetup);
      } else {
        past.push(meetup);
      }
    });

    setUpcomingMeetups(upcoming);
    setPastMeetups(past);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const meetupsRef = collection(db, 'meetups');

    const unsubscribeParticipating = onSnapshot(
      query(meetupsRef, where('participants', 'array-contains', user.uid)),
      (snapshot) => {
        const meetups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meetup));
        updateMeetupLists(meetups);
      }
    );

    const unsubscribeCreated = onSnapshot(
      query(meetupsRef, where('creatorId', '==', user.uid)),
      (snapshot) => {
        const meetups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meetup));
        setCreatedMeetups(meetups);
      }
    );

    // Set up an interval to check and update meetup lists every minute
   // const intervalId = setInterval(() => {
   //   updateMeetupLists([...upcomingMeetups, ...pastMeetups]);
   // }, 30000);

    return () => {
      unsubscribeParticipating();
      unsubscribeCreated();
      //clearInterval(intervalId);
    };
  }, [updateMeetupLists]);

  const handleJoinLeaveMeetup = async (meetup: Meetup) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const meetupRef = doc(db, 'meetups', meetup.id);

    const isUserInMeetup = meetup.participants && meetup.participants.includes(user.uid);

    try {
      if (isUserInMeetup) {
        await updateDoc(meetupRef, {
          participants: arrayRemove(user.uid)
        });
        await updateDoc(userRef, {
          eventsAttended: arrayRemove(meetup.id),
          activeParticipateEvents: arrayRemove(meetup.id)
        });

        // Update local state
        setUpcomingMeetups(prev => prev.filter(m => m.id !== meetup.id));
        setPastMeetups(prev => prev.filter(m => m.id !== meetup.id));
      } else {
        await updateDoc(meetupRef, {
          participants: arrayUnion(user.uid)
        });
        await updateDoc(userRef, {
          eventsAttended: arrayUnion(meetup.id),
          activeParticipateEvents: arrayUnion(meetup.id)
        });

        // Update local state
        const updatedMeetup = { ...meetup, participants: [...(meetup.participants || []), user.uid] };
        updateMeetupLists([...upcomingMeetups, ...pastMeetups, updatedMeetup]);
      }
    } catch (error) {
      console.error('Error updating meetup:', error);
    }
  };

  const handleDeleteMeetup = async (meetupId: string) => {
    try {
      const meetupRef = doc(db, 'meetups', meetupId);
      const meetupSnap = await getDoc(meetupRef);
    
      if (meetupSnap.exists()) {
        const meetupData = meetupSnap.data() as Meetup;
      
        const participantUpdates = meetupData.participants.map(async (userId) => {
          const userRef = doc(db, 'users', userId);
          return updateDoc(userRef, {
            eventsAttended: arrayRemove(meetupId),
            activeParticipateEvents: arrayRemove(meetupId)
          });
        });

        await Promise.all(participantUpdates);
        await deleteDoc(meetupRef);

        // Update local state
        setUpcomingMeetups(prev => prev.filter(m => m.id !== meetupId));
        setPastMeetups(prev => prev.filter(m => m.id !== meetupId));
        setCreatedMeetups(prev => prev.filter(m => m.id !== meetupId));

        console.log('Meetup deleted successfully and removed from all participants');
      } else {
        console.log('Meetup not found');
      }
    } catch (error) {
      console.error('Error deleting meetup:', error);
    }
  };

  const handleRateMeetup = (meetup: Meetup) => {
    setSelectedMeetup(meetup);
    setIsRatingModalVisible(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (selectedMeetup && auth.currentUser) {
      try {
        const meetupRef = doc(db, 'meetups', selectedMeetup.id);
        const updatedRatings = {
          ...selectedMeetup.ratings,
          [auth.currentUser.uid]: rating
        };
        const ratingValues = Object.values(updatedRatings);
        const averageRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;

        await updateDoc(meetupRef, {
          ratings: updatedRatings,
          averageRating: averageRating
        });

        // Update local state
        const updatedMeetup = { ...selectedMeetup, ratings: updatedRatings, averageRating };
        setPastMeetups(prev => prev.map(m => m.id === updatedMeetup.id ? updatedMeetup : m));

        console.log('Rating submitted successfully');
      } catch (error) {
        console.error('Error submitting rating:', error);
      }
    }
    setIsRatingModalVisible(false);
  };

  const renderMeetupItem = (meetup: Meetup, sectionType: 'upcoming' | 'past' | 'created') => {
    const user = auth.currentUser;
    const isUserInMeetup = user && meetup.participants && meetup.participants.includes(user.uid);
    const canRate = sectionType === 'past' && (!meetup.ratings || !meetup.ratings[user!.uid]);
    const meetupDate = new Date(meetup.date);

    return (
      <View style={styles.meetupItem}>
        <TouchableOpacity onPress={() => onMeetupPress(meetup)}>
          <Text style={styles.meetupTitle}>{meetup.title}</Text>
          <Text style={styles.meetupDetails}>{meetupDate.toLocaleString()}</Text>
          <Text style={styles.meetupDetails}>{meetup.location}</Text>
        </TouchableOpacity>
        {sectionType === 'upcoming' && (
          <TouchableOpacity
            style={[styles.button, isUserInMeetup ? styles.leaveButton : styles.joinButton]}
            onPress={() => handleJoinLeaveMeetup(meetup)}
          >
            <Text style={styles.buttonText}>{isUserInMeetup ? 'Leave' : 'Join'}</Text>
          </TouchableOpacity>
        )}
        {sectionType === 'past' && canRate && (
          <TouchableOpacity
            style={[styles.button, styles.rateButton]}
            onPress={() => handleRateMeetup(meetup)}
          >
            <Text style={styles.buttonText}>Rate</Text>
          </TouchableOpacity>
        )}
        {sectionType === 'created' && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => handleDeleteMeetup(meetup.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
      <FlatList
        data={upcomingMeetups}
        renderItem={({ item }) => renderMeetupItem(item, 'upcoming')}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming meetups</Text>}
      />

      <Text style={styles.sectionTitle}>Past Meetups</Text>
      <FlatList
        data={pastMeetups}
        renderItem={({ item }) => renderMeetupItem(item, 'past')}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No past meetups</Text>}
      />

      <Text style={styles.sectionTitle}>Created Meetups</Text>
      <FlatList
        data={createdMeetups}
        renderItem={({ item }) => renderMeetupItem(item, 'created')}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No created meetups</Text>}
      />

      <RateMeetupModal
        visible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  meetupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  meetupDetails: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  rateButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default MeetupMyMeetings;
