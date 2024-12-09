import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CreateMeetingScreen from './src/screens/CreateMeetingScreen';
import MyMeetingsScreen from './src/screens/MyMeetingsScreen';
import MeetingsMapScreen from './src/screens/MeetingsMapScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Create') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'MyMeetings') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'MeetingsMap') {
              iconName = focused ? 'map' : 'map-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Create" component={CreateMeetingScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="MyMeetings" component={MyMeetingsScreen} />
        <Tab.Screen name="MeetingsMap" component={MeetingsMapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

