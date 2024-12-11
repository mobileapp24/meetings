import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../services/config';
import CustomAlert from '../components/CustomAlertWithOptions';

const ProfileScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.displayName || '');
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
     
        console.log('Attempting to delete user account...');
        await deleteUser(user);
        console.log('User account deleted successfully');
        
        navigation.replace('Login');
      } else {
        console.log('No current user found');
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

  const handleAlertCancel = () => {
    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Name: {userName}</Text>
      <Text style={styles.info}>Email: {userEmail}</Text>
      
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
        onCancel={handleAlertCancel}
        showCancelButton={isConfirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
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

