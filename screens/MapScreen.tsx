import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';  // Utilities for querying data
import { db } from '../services/config'; // Firebase database configuration
import {APIProvider, Map, MapCameraChangedEvent, Marker  } from '@vis.gl/react-google-maps';

// Structure of a meeting object:
interface Meeting {
  id: string;
  title: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string | Date;
}


const MapScreen: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]); // State to store meetings
  // Fetch meetings from Firestore 
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Firestore query to obtain the 'active meetups' collection
        const now = new Date();
        const q = query(collection(db, 'meetups'));
        const querySnapshot = await getDocs(q);
        const meetingsData: Meeting[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Meeting;
          // Only include meetings with valid coordinates
          if (data.coordinates?.latitude && data.coordinates?.longitude) {
            const meetingDate = new Date(data.date);
            if (meetingDate > now) {
              meetingsData.push({
                id: doc.id,
                ...data,
              });
            }
          }
        });
        setMeetings(meetingsData); // Update state with previously fetched meetings
      } catch (error) {
        console.error('Error fetching meetings:', error); 
      }
    };
    fetchMeetings(); // Call the function
  }, []);

  
  // Render for web platform
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <APIProvider apiKey={'AIzaSyDRWYupSy0PVuX6sGtCLneGI3qqJj3JCcE'} onLoad={() => console.log('Maps API has been loaded.')}>
           <Map
               defaultZoom={13}
               defaultCenter={ { lat: 45.4642, lng: 9.1900 } } // By default, we place the map centered on the coordinates of the Duomo Square
               onCameraChanged={ (ev: MapCameraChangedEvent) =>
               console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
               }>
              {/* Add markers for each meeting */}
              {meetings.map((meeting) => (
                  <Marker
                      key={meeting.id}
                      position={{lat:meeting.coordinates.latitude, lng: meeting.coordinates.longitude}}
                      title={meeting.title}
                    />
              ))}
           </Map>
         </APIProvider>
     </View>
    );
  
  } else {
    // Dynamically import React Native Maps for mobile
    let MapView: any;
    let Marker: any;
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  // Render for mobile platforms
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          // By default, we place the map centered on the coordinates of the Duomo Square
          latitude: 45.4642, 
          longitude: 9.1900, 
          // Default map zoom levels
          latitudeDelta: 0.0922, 
          longitudeDelta: 0.0421, 
        }
      }
      zoomEnabled = {true} // Allow users to zoom
      >
        {/* Add markers for each meeting */}
        {meetings.map((meeting) => (
            <Marker
              key={meeting.id}
              coordinate={{
                latitude: meeting.coordinates.latitude,
                longitude: meeting.coordinates.longitude,
              }}
              title={meeting.title}
              description={meeting.description}
            />
        ))}
      </MapView>
    </View>
  );
      };
  }

const styles = StyleSheet.create({
  marker: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  meetingItem: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default MapScreen;