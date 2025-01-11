import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Handle email-password authentication
import { auth } from '../services/config'; // Firebase configuration
import CustomAlert from '../components/CustomAlert'; // Display messages to the user


const LoginScreen = ({ navigation }) => {

  // States for storing user's inputs (email and password)
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');

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

  // Function to handle login when the user presses the login button
  const handleLogin = async () => {
    // Show an alert if email or password fields are empty
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password.');
      return;
    }
    
    // Attempt to sign in with email and password using Firebase
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('MainApp'); // Navigate to "main app" screen if the login was successful
    } catch (error) {
      console.error('Login error:', error); // Log error for debugging
      let errorMessage = 'An unexpected error occurred. Please try again.'; // default message

      // Handle specific Firebase error codes and return user-friendly messages
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address. Please check and try again.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact for support.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please complete the previous registration step.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
      }

      showAlert('Login Error', errorMessage);
    }
  };

  // Handle the closing of the alert dialog
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
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


export default LoginScreen;

