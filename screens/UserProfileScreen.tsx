import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/config';

// Define TypeScript type for the route parameters, expecting a `userId` string
type UserProfileScreenProps = {
  route: {
    params: {
      userId: string;
    };
  };
};

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route }) => {
  const [profile, setProfile] = useState<any>(null);  // State for storing the user's profile data, initially null
  const [loading, setLoading] = useState(true); // State to track whether the data is still loading
  const [error, setError] = useState<string | null>(null); // State for storing error messages, initially null

  useEffect(() => { // useEffect runs when the component mounts or when `route.params.userId` changes
    const fetchProfile = async () => { // Function to fetch user profile data
      try {
        const userId = route.params.userId; // Extract userId from route parameters
        const currentUser = auth.currentUser; // Get the currently authenticated user

        if (currentUser && userId === currentUser.uid) {
          // If it's the current user's profile, fetch from auth
          setProfile({
            name: currentUser.displayName || 'No Name',
            email: currentUser.email || 'No Email',
          });
        } else {
           // If fetching a profile other than the current user's
          const userDoc = await getDoc(doc(db, 'users', userId)); // Retrieve the document from the Firestore database
          if (userDoc.exists()) {
            setProfile(userDoc.data()); // Set profile data if the document exists
          } else {
            setError('User not found');
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('An error occurred while fetching the user profile');
      } finally {
        setLoading(false);  // Mark loading as complete
      }
    };

    fetchProfile(); // Invoke the function to fetch profile data
  }, [route.params.userId]); // Dependency array: Re-run when `userId` changes


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {// Render a fallback message if no profile data is available
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No profile data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
       {/* Display the user's name */}
      <Text style={styles.title}>{profile.name}</Text>
      {/* Display the user's email */}
      <Text style={styles.info}>Email: {profile.email}</Text>
       {/* Display the user's rating, if available */}
      <Text style={styles.info}>
        Rating: {profile.rating ? profile.rating.toFixed(1) : 'Not rated yet'}
      </Text>
      
      <Text style={styles.sectionTitle}>Interests</Text>
      <View style={styles.interestsContainer}>
        {profile.interests && profile.interests.length > 0 ? (
           // Check if interests exist and are non-empty
          profile.interests.map((interest: string, index: number) => (
            <Text key={index} style={styles.interestItem}>{interest}</Text>
          ))
        ) : (
          <Text style={styles.emptyInterests}>No interests added</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default UserProfileScreen;