import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import MeetupMyMeetings from '../components/MeetupListMyMeetings';
import { Meetup } from '../types/meetup';

const MyMeetingsV2: React.FC = () => {
  const handleMeetupPress = (meetup: Meetup) => {
    // TODO: Implement navigation to meetup details screen
    console.log('Meetup pressed:', meetup);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MeetupMyMeetings onMeetupPress={handleMeetupPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default MyMeetingsV2;



