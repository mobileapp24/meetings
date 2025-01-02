import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Meetup } from '../types/meetup';
import { auth, db, functions } from '../services/config';
import { updateDoc, doc, arrayUnion, arrayRemove, deleteDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import RateMeetupModal from './RateMeetupModal';

interface MeetupListProps {
  meetups: Meetup[];
  onMeetupPress: (meetup: Meetup) => void;
  isFinishedList: boolean;
}

const MeetupList: React.FC<MeetupListProps> = ({ meetups, onMeetupPress, isFinishedList }) => {
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const sendJoinMeetupEmail = httpsCallable(functions, 'sendJoinMeetupEmail');
  const sendMeetupDeletedEmail = httpsCallable(functions, 'sendMeetupDeletedEmail');

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
        Alert.alert('Error', 'Failed to leave the meetup. Please try again.');
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

        // Send email notification
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        if (userData && userData.email) {
          try {
            await sendJoinMeetupEmail({ userEmail: userData.email, meetupTitle: meetup.title });
            console.log('Join meetup email sent successfully');
          } catch (emailError) {
            console.error('Error sending join meetup email:', emailError);
            Alert.alert(
              'Warning',
              'Joined the meetup, but failed to send confirmation email. Please check your internet connection.'
            );
          }
        }
      } catch (error) {
        console.error('Error joining meetup:', error);
        Alert.alert('Error', 'Failed to join the meetup. Please try again.');
      }
    } else {
      Alert.alert('Error', 'This meetup is full.');
    }
  };

  const handleDeleteMeetup = async (meetupId: string) => {
    try {
      const meetupRef = doc(db, 'meetups', meetupId);
      const meetupDoc = await getDoc(meetupRef);
      const meetupData = meetupDoc.data() as Meetup;

      if (meetupData && meetupData.participants) {
        // Send email to all participants
        for (const participantId of meetupData.participants) {
          const userRef = doc(db, 'users', participantId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          if (userData && userData.email) {
            try {
              await sendMeetupDeletedEmail({ userEmail: userData.email, meetupTitle: meetupData.title });
            } catch (emailError) {
              console.error('Error sending meetup deleted email:', emailError);
            }
          }
        }
      }

      await deleteDoc(meetupRef);
      console.log('Meetup deleted successfully');
      Alert.alert('Success', 'Meetup deleted successfully');
    } catch (error) {
      console.error('Error deleting meetup:', error);
      Alert.alert('Error', 'Failed to delete the meetup. Please try again.');
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

        console.log('Rating submitted successfully');
        Alert.alert('Success', 'Your rating has been submitted.');
      } catch (error) {
        console.error('Error submitting rating:', error);
        Alert.alert('Error', 'Failed to submit rating. Please try again.');
      }
    }
    setIsRatingModalVisible(false);
  };

  const renderMeetupItem = ({ item }: { item: Meetup }) => {
    const user = auth.currentUser;
    const isUserInMeetup = user && item.participants?.includes(user.uid);
    const isMeetupFull = item.participants && item.participants.length >= item.maxParticipants;
    const isCreator = user && user.uid === item.creatorId;
    const canRate = isFinishedList && isUserInMeetup && (!item.ratings || !item.ratings[user!.uid]);
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
          {isCreator && !isFinishedList && (
            <TouchableOpacity
              style={[styles.deleteButton]}
              onPress={() => handleDeleteMeetup(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          {canRate && (
            <TouchableOpacity
              style={[styles.rateButton]}
              onPress={() => handleRateMeetup(item)}
            >
              <Text style={styles.rateButtonText}>Rate</Text>
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
      <RateMeetupModal
        visible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  meetupItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meetupInfo: {
    flex: 1,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  meetupDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  meetupCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  meetupCreator: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  meetupRating: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  userRating: {
    fontSize: 14,
    color: 'green',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  leaveButton: {
    backgroundColor: 'red',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rateButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    marginBottom: 80,
  },
});

export default MeetupList;

