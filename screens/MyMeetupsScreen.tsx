import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

const MyMeetupsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>My Meetups Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default MyMeetupsScreen;

