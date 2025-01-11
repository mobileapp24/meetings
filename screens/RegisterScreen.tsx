import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { updateProfile, createUserWithEmailAndPassword } from 'firebase/auth'; // Functions to authenticate and update user data
import { setDoc, doc } from 'firebase/firestore'; // Functions to create and write documents
import { auth, db } from '../services/config'; // Firebase configuration
import CustomAlert from '../components/CustomAlert'; // Display messages to the user
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {

  // States for storing user's inputs (email, password and name)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // States to control the alerts (visibility, title and message)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Function to show a custom alert with a title and message
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Function to handle registration when the user presses the "Register" button
  const handleRegister = async () => {
    // Show an alert if email, password or name fields are empty
    if (!email || !password || !name) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('Attempting to create user...');
      // Create a user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }
      const user = userCredential.user; // Reference to the created user
      console.log('User created successfully:', user.uid);

      console.log('Attempting to create user profile...');
      const userDocRef = doc(db, 'users', user.uid); // Create a document in Firestore for the user
      console.log('User document reference created:', userDocRef);
      
      const userData = {
        name: name,
        email: email,
        // Profile information, initially empty, about insterests and events
        interests: [],
        eventsAttended: [],
        eventsCreated: [],
      };
      console.log('User data prepared:', userData);

      // Write the user data to the Firestore document
      await setDoc(userDocRef, userData);
      console.log('User profile created successfully');

      showAlert('Registration Successful', 'You can now login with your new account.'); // Alert in case of successful registration
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') { // Especific errors with Firebase
        showAlert('Registration Error', 'This email is already in use. Please use a different email or login to your existing account.');
      } else { // Generic error message
        showAlert('Registration Error', error.message);
      }
    }
  };

  // Close the alert, redirecting the user to the login screen if the registration was successful
  const handleAlertConfirm = () => {
    setAlertVisible(false);
    if (alertTitle === 'Registration Successful') {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName} // Update name state when the user types
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} // Update email state when the user types
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword} // Update password state when the user types
        secureTextEntry // Mask the input for security
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      <CustomAlert
        // Show the alert if 'true', and pass its information (title and message)
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
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
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
    elevation: 1, 
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, 
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    marginTop: 15,
    textDecorationLine: 'underline', 
  },
});


export default RegisterScreen;


