import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Meetup } from '../types/meetup';
import { auth, db } from '../services/config';
import { updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import RateMeetupModal from './RateMeetupModal';

interface MeetupListProps {
  meetups: Meetup[];
  onMeetupPress: (meetup: Meetup) => void;
  isFinishedList: boolean;
}

const MeetupList: React.FC<MeetupListProps> = ({ meetups, onMeetupPress, isFinishedList }) => {

  const handleJoinMeetup = async (meetup: Meetup) => {
    const user = auth.currentUser;
    if (!user || meetup.isFinished) {
      return;
    }

    if (!meetup.participants) {
      meetup.participants = [];
    }

    const userRef = doc(db, 'users', user.uid);
    const meetupRef = doc(db, 'meetups', meetup.id);

    if (meetup.participants.includes(user.uid)) {
      try {
        await updateDoc(meetupRef, {
          participants: arrayRemove(user.uid)
        });
        await updateDoc(userRef, {
          eventsAttended: arrayRemove(meetup.id)
        });
        console.log('Left meetup successfully');
      } catch (error) {
        console.error('Error leaving meetup:', error);
      }
    } else if (meetup.participants.length < meetup.maxParticipants) {
      try {
        await updateDoc(meetupRef, {
          participants: arrayUnion(user.uid)
        });
        await updateDoc(userRef, {
          eventsAttended: arrayUnion(meetup.id)
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
    const isUserInMeetup = user && item.participants?.includes(user.uid);
    const isMeetupFull = item.participants && item.participants.length >= item.maxParticipants;
   
    const userRating = user && item.ratings ? item.ratings[user.uid] : null;

    const meetupDate = new Date(item.date);
    const formattedTime = meetupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={styles.meetupItem} onPress={() => onMeetupPress(item)}>
        <View style={styles.meetupInfo}>
          <Text style={styles.meetupTitle}>{item.title}</Text>
          <Text style={styles.meetupCategory}>Category: {item.category}</Text>
          <Text style={styles.meetupDetails}>
            {meetupDate.toLocaleDateString()} at {formattedTime}
          </Text>
          <Text style={styles.meetupDetails}>{item.location}</Text>
          <Text style={styles.meetupDetails}>
            Participants: {item.participants ? item.participants.length : 0}/{item.maxParticipants}
          </Text>
          <Text style={styles.meetupCreator}>Created by: {item.creatorName}</Text>
          {isFinishedList && (
            <Text style={styles.meetupRating}>
              Average Rating: {item.averageRating ? item.averageRating.toFixed(1) : 'Not rated'}
            </Text>
          )}
          {isUserInMeetup && userRating !== null && (
            <Text style={styles.userRating}>Your Rating: {userRating}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {!isFinishedList && (
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
          )}
          
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        data={meetups}
        renderItem={renderMeetupItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </>
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
    marginBottom: 2,
  },
  meetupCreator: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  meetupRating: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  userRating: {
    fontSize: 14,
    color: '#4CD964',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    marginBottom: 5,
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  rateButton: {
    backgroundColor: '#4CD964',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MeetupList;



