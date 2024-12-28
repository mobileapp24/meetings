import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../services/config';
import {APIProvider, Map, MapCameraChangedEvent, Marker  } from '@vis.gl/react-google-maps';

interface Meeting {
  id: string;
  title: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}





const MapScreen: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const q = query(collection(db, 'meetups'));
        const querySnapshot = await getDocs(q);
        const meetingsData: Meeting[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.coordinates?.latitude && data.coordinates?.longitude) {
            meetingsData.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              coordinates: {
                latitude: data.coordinates.latitude,
                longitude: data.coordinates.longitude,
              },
            });
          }
        });
        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };

    fetchMeetings();
  }, []);

  



  // Para web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <APIProvider apiKey={'AIzaSyDRWYupSy0PVuX6sGtCLneGI3qqJj3JCcE'} onLoad={() => console.log('Maps API has loaded.')}>
           <Map
               defaultZoom={13}
               defaultCenter={ { lat: 45.4642, lng: 9.1900 } }
               onCameraChanged={ (ev: MapCameraChangedEvent) =>
               console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
               }>
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
  }else{
    let MapView: any;
    let Marker: any;


    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  // Para dispositivos móviles.
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.4642, // Cambia esto a tu región predeterminada si es necesario.
          longitude: 9.1900,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      }
      zoomEnabled = {true}
      >
        {meetings.map((meeting) => (
          <Marker
            key={meeting.id}
            coordinate={meeting.coordinates}
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