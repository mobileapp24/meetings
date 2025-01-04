import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/config';

type UserProfileScreenProps = {
  route: {
    params: {
      userId: string;
    };
  };
};

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = route.params.userId;
        const currentUser = auth.currentUser;

        if (currentUser && userId === currentUser.uid) {
          // If it's the current user's profile, fetch from auth
          setProfile({
            name: currentUser.displayName || 'No Name',
            email: currentUser.email || 'No Email',
            // Add any other fields you want to display
          });
        } else {
          // Fetch other user's profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          } else {
            setError('User not found');
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('An error occurred while fetching the user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [route.params.userId]);

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

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No profile data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{profile.name}</Text>
      <Text style={styles.info}>Email: {profile.email}</Text>
      <Text style={styles.info}>
        Rating: {profile.rating ? profile.rating.toFixed(1) : 'Not rated yet'}
      </Text>
      
      <Text style={styles.sectionTitle}>Interests</Text>
      <View style={styles.interestsContainer}>
        {profile.interests && profile.interests.length > 0 ? (
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