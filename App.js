import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Navigation context
import { createStackNavigator } from '@react-navigation/stack'; // For the stack-based navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyMeetupsScreen from './screens/MyMeetupsScreen';
import MapScreen from './screens/MapScreen';
import MeetupDetailScreen from './screens/MeetupDetailScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createStackNavigator(); // Stack navigator (different sections)
const Tab = createBottomTabNavigator(); // Tab navigator (main app)


// Define a home stack to be able to navigate with the main bar also from these screens
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MeetupDetail" 
      component={MeetupDetailScreen} 
      options={{ headerTitle: 'Meetup Details' }}
    />
    <Stack.Screen 
      name="UserProfile" 
      component={UserProfileScreen} 
      options={{ headerTitle: 'User Profile' }}
    />
  </Stack.Navigator>
);

const MyMeetupsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="My Meetups" 
      component={MyMeetupsScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MeetupDetail" 
      component={MeetupDetailScreen} 
      options={{ headerTitle: 'Meetup Details' }}
    />
    <Stack.Screen 
      name="UserProfile" 
      component={UserProfileScreen} 
      options={{ headerTitle: 'User Profile' }}
    />
  </Stack.Navigator>
);

const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Map" 
      component={MapScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MeetupDetail" 
      component={MeetupDetailScreen} 
      options={{ headerTitle: 'Meetup Details' }}
    />
    <Stack.Screen 
      name="UserProfile" 
      component={UserProfileScreen} 
      options={{ headerTitle: 'User Profile' }}
    />
  </Stack.Navigator>
  );


// Define the appropriate tab icon and style based on the currently active route
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'My Meetups') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="My Meetups" component={MyMeetupsStack} />
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      {/* Definition of the stack screens for authentication of the users and main app */}
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;