import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { collection, addDoc, updateDoc, doc, arrayUnion, GeoPoint } from 'firebase/firestore';
import { db, auth } from '../services/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import CustomAlert from './CustomAlert';
import {APIProvider, Map, MapCameraChangedEvent, MapMouseEvent, Marker  } from '@vis.gl/react-google-maps';




const categories = ['Sports', 'Study', 'Social', 'Work', 'Other'];

const CreateMeetupForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [date, setDate] = useState(new Date());
  const [maxParticipants, setMaxParticipants] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const mapRef = useRef(null);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const validateForm = () => {
    if (!title.trim()) {
      showAlert('Please enter a title');
      return false;
    }
    if (!description.trim()) {
      showAlert('Please enter a description');
      return false;
    }
    if (!address.trim()) {
      showAlert('Please enter an address');
      return false;
    }
    if (!coordinates) {
      showAlert('Please select a location on the map');
      return false;
    }
    if (date <= new Date()) {
      showAlert('Please select a future date and time');
      return false;
    }
    if (!maxParticipants || !Number.isInteger(Number(maxParticipants)) || Number(maxParticipants) <= 0) {
      showAlert('Please enter a valid positive integer for max participants');
      return false;
    }
    return true;
  };

  const handleCreateMeetup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        showAlert('No user logged in');
        return;
      }

      const meetupData = {
        title,
        description,
        address,
        coordinates,
        date: date.toISOString(),
        maxParticipants: parseInt(maxParticipants, 10),
        participants: [user.uid],
        creatorId: user.uid,
        creatorName: user.displayName || 'Anonymous',
        category,
        createdAt: new Date(),
        isFinished: false,
        ratings: {},
        averageRating: 0,
      };

      const docRef = await addDoc(collection(db, 'meetups'), meetupData);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        eventsAttended: arrayUnion(docRef.id),
        eventsCreated: arrayUnion(docRef.id)
      });

      showAlert('Meetup created successfully');
      
      // Clear form fields
      setTitle('');
      setDescription('');
      setAddress('');
      setCoordinates(null);
      setDate(new Date());
      setMaxParticipants('');
      setCategory(categories[0]);
    } catch (error) {
      console.error('Error creating meetup:', error);
      showAlert('Failed to create meetup. Please try again.');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentDate = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDate(new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      ));
    }
  };

  const renderDateTimePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="datetime-local"
          value={date.toISOString().slice(0, 16)}
          onChange={(e) => setDate(new Date(e.target.value))}
          style={styles.webDateInput}
        />
      );
    } else {
      return (
        <>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text>{date.toLocaleTimeString()}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={date}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </>
      );
    }
  };

  const renderCategoryPicker = () => {
    if (Platform.OS === 'web') {
      return (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.webSelect}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      );
    } else {
      return (
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      );
    }
  };

  const renderMap = () => {
    console.log("mapa")
    if (Platform.OS === 'web') {
      console.log("mapa web")
      return (
        <View style={styles.mapContainer}>
        <APIProvider apiKey={'AIzaSyDRWYupSy0PVuX6sGtCLneGI3qqJj3JCcE'} onLoad={() => console.log('Maps API has loaded.')}>
           <Map
  
               defaultZoom={13}
               defaultCenter={ { lat: 45.4642, lng: 9.1900 } }
               onCameraChanged={ (ev: MapCameraChangedEvent) =>
               console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
               }
               onClick = {(e: MapMouseEvent) => {
                const  latitude = e.detail.latLng.lat;
                const longitude = e.detail.latLng.lng;
                
                setCoordinates(new GeoPoint(latitude, longitude));
                }}>
               
                {coordinates && (
                  <Marker
                  position={{lat:coordinates.latitude, lng: coordinates.longitude}}
                 />
                )}
    
           </Map>
         </APIProvider>
         </View>
      );
    } else {

      let MapView: any;
      let Marker: any;
  
  
      const Maps = require('react-native-maps');
      MapView = Maps.default;
      Marker = Maps.Marker;

      return (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 45.4642,
              longitude: 9.1900,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setCoordinates(new GeoPoint(latitude, longitude));
            }}
          >
            {coordinates && (
              <Marker
                coordinate={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                }}
              />
            )}
          </MapView>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Meetup</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      {renderMap()}
      {coordinates && (
        <Text style={styles.coordinatesText}>
          Selected location: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
        </Text>
      )}
      {renderDateTimePicker()}
      <TextInput
        style={styles.input}
        placeholder="Max Participants"
        value={maxParticipants}
        onChangeText={(text) => {
          const integer = parseInt(text);
          if (!isNaN(integer) && integer > 0) {
            setMaxParticipants(integer.toString());
          } else if (text === '') {
            setMaxParticipants('');
          }
        }}
        keyboardType="numeric"
      />
      {renderCategoryPicker()}
      <TouchableOpacity style={styles.button} onPress={handleCreateMeetup}>
        <Text style={styles.buttonText}>Create Meetup</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={alertVisible}
        title="Alert"
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  webSelect: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  mapContainer: {
    height: 300,
    marginBottom: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  coordinatesText: {
    marginBottom: 10,
  },
});

export default CreateMeetupForm;