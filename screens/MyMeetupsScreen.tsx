import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import MeetupMyMeetings from '../components/MeetupListMyMeetings'; // Component for displaying meetups
import { Meetup } from '../types/meetup';

// Component definition for displaying user's meetups
const MyMeetingsV2: React.FC = () => {
  // Handler for when a meetup is pressed
  const handleMeetupPress = (meetup: Meetup) => {
    // Implement navigation to meetup details screen
    console.log('Meetup pressed:', meetup);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Displaying active meetups (not finished) */}
        <MeetupMyMeetings onMeetupPress={handleMeetupPress} isFinishedList={false} />
        {/* Displaying finished meetups */}
        <MeetupMyMeetings onMeetupPress={handleMeetupPress} isFinishedList={true} />
      </View>
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



