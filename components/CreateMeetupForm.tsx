import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { collection, addDoc, updateDoc, doc, arrayUnion, GeoPoint } from 'firebase/firestore';
import { db, auth } from '../services/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import CustomAlert from './CustomAlert';

const categories = ['Sports', 'Study', 'Social', 'Work', 'Other'];

const CreateMeetupForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [date, setDate] = useState(new Date());
  const [maxParticipants, setMaxParticipants] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
    if (!latitude.trim() || !longitude.trim() || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      showAlert('Please enter valid latitude and longitude');
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

      const coordinates = new GeoPoint(Number(latitude), Number(longitude));

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
        eventosCreados: arrayUnion(docRef.id)
      });

      showAlert('Meetup created successfully');
      
      // Clear form fields
      setTitle('');
      setDescription('');
      setAddress('');
      setLatitude('');
      setLongitude('');
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
      <View style={styles.coordinatesContainer}>
        <TextInput
          style={[styles.input, styles.coordinateInput]}
          placeholder="Latitude"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.coordinateInput]}
          placeholder="Longitude"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />
      </View>
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
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateInput: {
    flex: 1,
    marginRight: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
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
});

export default CreateMeetupForm;