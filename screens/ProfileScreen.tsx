import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../services/config';
import CustomAlert from '../components/CustomAlertWithOptions';
import EditInterestsModal from '../components/EditInterestsModal';

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isEditInterestsVisible, setIsEditInterestsVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email || '');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || '');
          setUserInterests(userData.interests || []);
        }
      }
    };
    fetchUserData();
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Name: {userName}</Text>
      <Text style={styles.info}>Email: {userEmail}</Text>
      
      <Text style={styles.sectionTitle}>Interests</Text>
      <FlatList
        data={userInterests}
        renderItem={({ item }) => <Text style={styles.interestItem}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
        style={styles.interestsList}
        ListEmptyComponent={<Text style={styles.emptyInterests}>No interests added yet</Text>}
      />
      
      <TouchableOpacity style={styles.button} onPress={() => setIsEditInterestsVisible(true)}>
        <Text style={styles.buttonText}>Edit Interests</Text>
      </TouchableOpacity>
      
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
    </View>
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
  interestsList: {
    maxHeight: 100,
    marginBottom: 20,
  },
  interestItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  emptyInterests: {
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




