import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Meetup } from '../types/meetup';
import { auth, db } from '../services/config';
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface MeetupListProps {
  meetups: Meetup[];
  onMeetupPress: (meetup: Meetup) => void;
}

const MeetupList: React.FC<MeetupListProps> = ({ meetups, onMeetupPress }) => {
  const handleJoinMeetup = async (meetup: Meetup) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    if (!meetup.participants) {
      meetup.participants = [];
    }

    if (meetup.participants.includes(user.uid)) {
      try {
        await updateDoc(doc(db, 'meetups', meetup.id), {
          participants: arrayRemove(user.uid)
        });
        console.log('Left meetup successfully');
      } catch (error) {
        console.error('Error leaving meetup:', error);
      }
    } else if (meetup.participants.length < meetup.maxParticipants) {
      try {
        await updateDoc(doc(db, 'meetups', meetup.id), {
          participants: arrayUnion(user.uid)
        });
        console.log('Joined meetup successfully');
      } catch (error) {
        console.error('Error joining meetup:', error);
      }
    } else {
      console.log('Meetup is full');
    }
  };

  const renderMeetupItem = ({ item }: { item: Meetup }) => {
    const user = auth.currentUser;
    const isUserInMeetup = user && item.participants && item.participants.includes(user.uid);
    const isMeetupFull = item.participants && item.participants.length >= item.maxParticipants;

    return (
      <TouchableOpacity style={styles.meetupItem} onPress={() => onMeetupPress(item)}>
        <View style={styles.meetupInfo}>
          <Text style={styles.meetupTitle}>{item.title}</Text>
          <Text style={styles.meetupCategory}>Category: {item.category}</Text>
          <Text style={styles.meetupDetails}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.meetupDetails}>{item.location}</Text>
          <Text style={styles.meetupDetails}>
            Participants: {item.participants ? item.participants.length : 0}/{item.maxParticipants}
          </Text>
          <Text style={styles.meetupCreator}>Created by: {item.creatorName}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.joinButton,
            isUserInMeetup ? styles.leaveButton : (isMeetupFull ? styles.disabledButton : null)
          ]}
          onPress={() => handleJoinMeetup(item)}
          disabled={isMeetupFull && !isUserInMeetup}
        >
          <Text style={styles.joinButtonText}>
            {isUserInMeetup ? 'Leave' : (isMeetupFull ? 'Full' : 'Join')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={meetups}
      renderItem={renderMeetupItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  meetupItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meetupCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  meetupDetails: {
    fontSize: 14,
    color: '#666',
  },
  meetupCreator: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MeetupList;

