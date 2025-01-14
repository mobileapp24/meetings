import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc, writeBatch, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/config';
import CustomAlert from '../components/CustomAlertWithOptions';
import EditInterestsModal from '../components/EditInterestsModal';
import { Meetup } from '../types/meetup';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  // State variables to manage user information (name, email and list of interests)
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  // State variables to manage alerts (title, message, vissibility and confirmation)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState(''); 
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
 
  const [isEditInterestsVisible, setIsEditInterestsVisible] = useState(false); // Controls the visibility of the interests editing modal
  const [createdMeetups, setCreatedMeetups] = useState<Meetup[]>([]); // Stores the list of meetups created by the user

  // Fetches user data from Firestore and updates the state
  const fetchUserData = useCallback(async () => {
    const user = auth.currentUser; // Gets the current logged-in user
    if (user) {
      setUserEmail(user.email || ''); 
      const userDoc = await getDoc(doc(db, 'users', user.uid)); // Fetches the user document from Firestore
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name || ''); 
        setUserInterests(userData.interests || []); 
        await fetchCreatedMeetups(user.uid, userData.eventsCreated || []); // Fetches meetups created by the user
      }
    }
  }, []);

  // Fetches meetups created by the user from Firestore
  const fetchCreatedMeetups = async (userId: string, eventsCreated: string[]) => {
    const meetupsPromises = eventsCreated.map(meetupId => 
      getDoc(doc(db, 'meetups', meetupId))
    );
    // List of promises to fetch each meetup
    const meetupDocs = await Promise.all(meetupsPromises); // Resolves all promises
    const meetups: Meetup[] = meetupDocs
      .filter(doc => doc.exists()) // Filters out non-existent documents
      .map(doc => {
        const data = doc.data() as Meetup; 
        return { ...data, id: doc.id }; // Converts Firestore documents into Meetup objects
      });
    setCreatedMeetups(meetups); // Updates the state with the fetched meetups
  };

  // Calculates the average rating of the user's finished meetups
  const averageRating = useMemo(() => {
    const finishedMeetups = createdMeetups.filter(meetup => meetup.isFinished && meetup.averageRating>0); // Filters only finished meetups
    if (finishedMeetups.length === 0) return 0; // If no meetups are finished
    const totalRating = finishedMeetups.reduce((sum, meetup) => sum + (meetup.averageRating || 0), 0);
    // Total rating of finished meetups (average)
    return totalRating / finishedMeetups.length; 
  }, [createdMeetups]);

  // Fetches user data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  // Shows a custom alert dialog (with title, message and optional delete confirmation)
  const showAlert = (title: string, message: string, isDelete = false) => {
    setAlertTitle(title); 
    setAlertMessage(message); 
    setIsConfirmDelete(isDelete); 
    setAlertVisible(true); 
  };

  // Logs out the user and redirects to the login screen
  const handleLogout = async () => {
    try {
      await signOut(auth); // Signs out the user
      navigation.replace('Login'); 
    } catch (error) {
      console.error('Logout error:', error); 
      showAlert('Error', 'Failed to log out. Please try again.'); 
    }
  };

  // Shows an alert in order for the user to confirm their account deletion
  const handleDeleteUser = async () => {
    showAlert(
      'Confirm Delete', 
      'Are you sure you want to delete your account? This action cannot be undone.', 
      true);
  }; 

  const deleteUserMeetups = async (userId: string) => {
    try {
      const userMeetupsQuery = query(collection(db, 'meetups'), where('creatorId', '==', userId));
      const userMeetupsDocs = await getDocs(userMeetupsQuery);
      
      const batch = writeBatch(db);
      userMeetupsDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('All user meetups deleted successfully');
    } catch (error) {
      console.error('Error deleting user meetups:', error);
      throw error;
    }
  };

  const removeUserFromAllMeetups = async (userId: string) => {
    try {
      // Query all meetups where the user is a participant
      const meetupsRef = collection(db, 'meetups');
      const q = query(meetupsRef, where('participants', 'array-contains', userId));
      const querySnapshot = await getDocs(q);
  
      // Update each meetup to remove the user and their rating
      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const meetupRef = doc(db, 'meetups', docSnapshot.id);
        const meetupData = docSnapshot.data();
        
        // Remove user from participants
        const updatedParticipants = meetupData.participants.filter((id: string) => id !== userId);
        
        // Remove user's rating
        const updatedRatings = { ...meetupData.ratings };
        delete updatedRatings[userId];
        
        // Recalculate average rating
        const ratingValues = Object.values(updatedRatings) as number[];
        const averageRating = ratingValues.length > 0
          ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
          : 0;
  
        await updateDoc(meetupRef, {
          participants: updatedParticipants,
          ratings: updatedRatings,
          averageRating: averageRating
        });
      });
  
      await Promise.all(updatePromises);
      console.log(`User ${userId} removed from all meetups and their ratings deleted`);
    } catch (error) {
      console.error('Error removing user from meetups:', error);
      throw error;
    }
  };
  
  
  // Deletes the user's account from Firestore and Firebase Auth and redirects to the login screen
  const performDeleteUser = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Delete all meetups created by the user
        await deleteUserMeetups(user.uid);

        // Remove user from all active meetups
        await removeUserFromAllMeetups(user.uid);

        // Delete the user document
        await deleteDoc(doc(db, 'users', user.uid));

        // Delete the user from Firebase Auth
        await deleteUser(user);

        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      if (error instanceof Error) {
        showAlert('Error', `Failed to delete account: ${error.message}`);
      } else {
        showAlert('Error', 'Failed to delete account. Please try again.');
      }
    }
  };

  // Confirms the alert, canceling it (it hides again the dialog)
  const handleAlertConfirm = () => {
    setAlertVisible(false); 
    if (isConfirmDelete) {
      performDeleteUser(); // Proceeds with account deletion if confirmed by the user
    }
  };

  // Updates the user's interests in Firestore and the local state
  const handleUpdateInterests = async (newInterests: string[]) => {
    try {
      const user = auth.currentUser; // Gets the current logged-in user
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { interests: newInterests }); // Updates the user's interests in Firestore
        setUserInterests(newInterests); // Updates the local state with the new interests
        setIsEditInterestsVisible(false); // Hides the edit interests modal
      }
    } catch (error) {
      console.error('Update interests error:', error); 
      showAlert('Error', 'Failed to update interests. Please try again.'); 
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Display user's information */}
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Name: {userName}</Text>
      <Text style={styles.info}>Email: {userEmail}</Text>
      <Text style={styles.info}>
        Rating: {averageRating > 0 ? averageRating.toFixed(1) : 'Not rated yet'}
      </Text>
      
      {/* Display and edit user's interests */}
      <Text style={styles.sectionTitle}>Interests</Text>
      <View style={styles.interestsContainer}>
        {userInterests.map((interest, index) => (
          <Text key={index} style={styles.interestItem}>{interest}</Text>
        ))}
        {userInterests.length === 0 && (
          <Text style={styles.emptyInterests}>No interests added yet</Text>
        )}
      </View>
      
      {/* Edit interests button */}
      <TouchableOpacity style={styles.button} onPress={() => setIsEditInterestsVisible(true)}>
        <Text style={styles.buttonText}>Edit Interests</Text>
      </TouchableOpacity>
      
      {/* Logout button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
      
      {/* Delete account button */}
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteUser}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>

      {/* Custom alert dialog */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
        onCancel={() => setAlertVisible(false)}
        showCancelButton={isConfirmDelete}
      />

      {/* Modal for editing interests */}
      <EditInterestsModal
        visible={isEditInterestsVisible}
        interests={userInterests}
        onSave={handleUpdateInterests}
        onCancel={() => setIsEditInterestsVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestItem: {
    fontSize: 16,
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: '#E1E8EE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    color: '#2C3E50',
  },
  emptyInterests: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#999',
  },
  button: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;