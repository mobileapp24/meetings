import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../services/config';
import CustomAlert from '../components/CustomAlertWithOptions';
import EditInterestsModal from '../components/EditInterestsModal';
import { Meetup } from '../types/meetup';

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isEditInterestsVisible, setIsEditInterestsVisible] = useState(false);
  const [attendedMeetups, setAttendedMeetups] = useState<Meetup[]>([]);

  const fetchUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email || '');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name || '');
        setUserInterests(userData.interests || []);
        setProfileImageUri(userData.profileImageUrl || null);
        await fetchAttendedMeetups(user.uid, userData.eventsAttended || []);
      }
    }
  }, []);

  const fetchAttendedMeetups = async (userId: string, eventsAttended: string[]) => {
    const meetupsPromises = eventsAttended.map(meetupId => 
      getDoc(doc(db, 'meetups', meetupId))
    );
    
    const meetupDocs = await Promise.all(meetupsPromises);
    const meetups: Meetup[] = meetupDocs
      .filter(doc => doc.exists())
      .map(doc => {
        const data = doc.data() as Meetup;
        return { ...data, id: doc.id };
      });
    
    console.log('Fetched attended meetups:', meetups);
    setAttendedMeetups(meetups);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const showAlert = (title: string, message: string, isDelete = false) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsConfirmDelete(isDelete);
    setAlertVisible(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      showAlert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    showAlert('Confirm Delete', 'Are you sure you want to delete your account? This action cannot be undone.', true);
  };

  const performDeleteUser = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(user);
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      showAlert('Error', 'Failed to delete account. Please try again.');
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
    if (isConfirmDelete) {
      performDeleteUser();
    }
  };

  const handleUpdateInterests = async (newInterests: string[]) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { interests: newInterests });
        setUserInterests(newInterests);
        setIsEditInterestsVisible(false);
      }
    } catch (error) {
      console.error('Update interests error:', error);
      showAlert('Error', 'Failed to update interests. Please try again.');
    }
  };



  const renderAttendedMeetup = ({ item }: { item: Meetup }) => (
    <View style={styles.meetupItem}>
      <Text style={styles.meetupTitle}>{item.title}</Text>
      <Text style={styles.meetupDetails}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.meetupDetails}>{item.location}</Text>
      <Text style={styles.meetupCategory}>Category: {item.category}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Name: {userName}</Text>
      <Text style={styles.info}>Email: {userEmail}</Text>
      
      <Text style={styles.sectionTitle}>Interests</Text>
      <View style={styles.interestsContainer}>
        {userInterests.map((interest, index) => (
          <Text key={index} style={styles.interestItem}>{interest}</Text>
        ))}
        {userInterests.length === 0 && (
          <Text style={styles.emptyInterests}>No interests added yet</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => setIsEditInterestsVisible(true)}>
        <Text style={styles.buttonText}>Edit Interests</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Attended Meetups</Text>
      <ScrollView style={styles.meetupsScrollView}>
        {attendedMeetups.length > 0 ? (
          attendedMeetups.map((meetup) => renderAttendedMeetup({ item: meetup }))
        ) : (
          <Text style={styles.emptyMeetups}>No attended meetups yet</Text>
        )}
      </ScrollView>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteUser}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
        onCancel={() => setAlertVisible(false)}
        showCancelButton={isConfirmDelete}
      />

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
  },
  emptyInterests: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  meetupsScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  meetupItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  meetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meetupDetails: {
    fontSize: 14,
    color: '#666',
  },
  meetupCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
  },
  emptyMeetups: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;






