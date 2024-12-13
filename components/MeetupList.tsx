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
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const handleJoinMeetup = async (meetup: Meetup) => {
    const user = auth.currentUser;
    if (!user || meetup.isFinished) {
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

  const handleDeleteMeetup = async (meetupId: string) => {
    try {
      await deleteDoc(doc(db, 'meetups', meetupId));
      console.log('Meetup deleted successfully');
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

        console.log('Rating submitted successfully');
      } catch (error) {
        console.error('Error submitting rating:', error);
      }
    }
    setIsRatingModalVisible(false);
  };

  const renderMeetupItem = ({ item }: { item: Meetup }) => {
    const user = auth.currentUser;
    const isUserInMeetup = user && item.participants && item.participants.includes(user.uid);
    const isMeetupFull = item.participants && item.participants.length >= item.maxParticipants;
    const isCreator = user && user.uid === item.creatorId;
    const canRate = isFinishedList && isUserInMeetup && (!item.ratings || !item.ratings[user!.uid]);

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
          {isFinishedList && (
            <Text style={styles.meetupRating}>
              Average Rating: {item.averageRating ? item.averageRating.toFixed(1) : 'Not rated'}
            </Text>
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
  meetupRating: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
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

