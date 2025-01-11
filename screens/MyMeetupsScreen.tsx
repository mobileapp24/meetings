import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import MeetupMyMeetings from '../components/MeetupListMyMeetings'; // Component for displaying meetups
import { Meetup } from '../types/meetup';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MeetupDetail: { meetupId: string };
};

// Component definition for displaying user's meetups
const MyMeetingsV2: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // Handler for when a meetup is pressed
  const handleMeetupPress = (meetup: Meetup) => {
    // Implement navigation to meetup details screen
    navigation.navigate('MeetupDetail', { meetupId: meetup.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        {/* Displaying active and finished meetups */}
        <MeetupMyMeetings onMeetupPress={handleMeetupPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensures the component takes up the full screen height
  },
  container: {
    flex: 1, // Allows the child components to flexibly occupy space
  },
});

export default MyMeetingsV2;