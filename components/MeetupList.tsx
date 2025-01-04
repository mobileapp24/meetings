import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Meetup } from '../types/meetup'; 
import { auth, db } from '../services/config'; // Firebase authentication and database services
import { updateDoc, doc, arrayUnion, arrayRemove,  } from 'firebase/firestore'; // Firestore utilities

// Properties for MeetupList component
interface MeetupListProps {
  meetups: Meetup[]; // List of meetup objects to display
  onMeetupPress: (meetup: Meetup) => void; // Callback when a meetup is pressed
  isFinishedList: boolean; // Whether the list displays finished meetups
}


const MeetupList: React.FC<MeetupListProps> = ({ meetups, onMeetupPress, isFinishedList }) => {
  // Function to handle joining or leaving a meetup (ensuring the current user is authenticated and the meetup not finished)
  const handleJoinMeetup = async (meetup: Meetup) => {
    const user = auth.currentUser; 
    if (!user || meetup.isFinished) { 
      return;
    }

    // Ensure the participants array is initialized
    if (!meetup.participants) {
      meetup.participants = [];
    }

    // References to the user and meetup documents in Firestore
    const userRef = doc(db, 'users', user.uid);
    const meetupRef = doc(db, 'meetups', meetup.id);

    if (meetup.participants.includes(user.uid)) {
      // If the user is already in the meetup, remove
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
      // If there is space, add the user
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
      // The number of maximum participants has been reached
      console.log('Meetup is full');
    }
  };
  
  // Function to render a single Meetup item
  const renderMeetupItem = ({ item }: { item: Meetup }) => {
    const user = auth.currentUser; // Get current user
    const isUserInMeetup = user && item.participants?.includes(user.uid); // Check if user is in the meetup
    const isMeetupFull = item.participants && item.participants.length >= item.maxParticipants; // Check if meetup is full
    const userRating = user && item.ratings ? item.ratings[user.uid] : null; // Get user's rating if available
    const meetupDate = new Date(item.date); // Parse the meetup date
    const formattedTime = meetupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format time

    return (
      <TouchableOpacity style={styles.meetupItem} onPress={() => onMeetupPress(item)}>
        {/* Show the basic and important information of the meeting in the main page */}
        <View style={styles.meetupInfo}>
          <Text style={styles.meetupTitle}>{item.title}</Text>
          <Text style={styles.meetupCategory}>Category: {item.category}</Text>
          <Text style={styles.meetupDetails}>Description: {item.description}</Text>
          <Text style={styles.meetupDetails}>
            Date: {meetupDate.toLocaleDateString()} at {formattedTime}
          </Text>
          <Text style={styles.meetupDetails}>Location: {item.location}</Text>
          <Text style={styles.meetupDetails}>
            Participants: {item.participants ? item.participants.length : 0}/{item.maxParticipants}
          </Text>
          <Text style={styles.meetupCreator}>Created by: {item.creatorName}</Text>
          {/* In the case of finished meetups, show also the average rating and the user's rating */}
          {isFinishedList && (
            <Text style={styles.meetupRating}>
              Average Rating: {item.averageRating ? item.averageRating.toFixed(1) : 'Not rated'}
            </Text>
          )}
          {isUserInMeetup && userRating !== null && isFinishedList&& (
            <Text style={styles.userRating}>Your Rating: {userRating}</Text>
          )}

        </View>
        {/* For the active meetups, if there is still space (not 'Full'), show also the option to join 
        or to leave (if previously joined) */}
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
        data={meetups} // List of meetups to display
        renderItem={renderMeetupItem} // Render the function for each item
        keyExtractor={(item) => item.id} // Key extractor for list items
        style={styles.list}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    width: '98%',
  },
  meetupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
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
    backgroundColor: '#F44336',
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



