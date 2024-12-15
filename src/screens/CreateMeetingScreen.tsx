// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const CreateMeetingScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Crear Nueva Reunión</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     fontSize: 18,
//   },
// });

// export default CreateMeetingScreen;


// Creamos un formulario con campos para título, descripción, ubicación, fecha y hora, número máximo de participantes y categoría.
// Utilizamos el componente DateTimePicker para seleccionar la fecha y hora.
// Implementamos validación básica para asegurarnos de que todos los campos estén llenos.
// Cuando se crea una nueva quedada, se navega de vuelta a la pantalla de inicio pasando los datos de la nueva quedada.


import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type RootStackParamList = {
  Home: { newMeeting?: Meeting } | undefined;
  // Añade aquí otros tipos de rutas si es necesario
};

type Meeting = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  maxParticipants: number;
  category: string;
};

const CreateMeetingScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [category, setCategory] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCreateMeeting = () => {
    if (!title || !description || !location || !maxParticipants || !category) {
      Alert.alert('Error', 'Por favor, rellena todos los campos');
      return;
    }

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title,
      description,
      location,
      date,
      maxParticipants: parseInt(maxParticipants),
      category,
    };

    // Aquí normalmente enviarías los datos a tu backend
    // Por ahora, simularemos esto actualizando el estado global
    // y navegando de vuelta a la pantalla de inicio
    Alert.alert('Éxito', 'Quedada creada con éxito');
    navigation.navigate('Home', { newMeeting });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Nueva Quedada</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la quedada"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu quedada"
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Lugar de la quedada"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha y Hora</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text>{date.toLocaleString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Número máximo de participantes</Text>
        <TextInput
          style={styles.input}
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          placeholder="Ej: 10"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Ej: Deportes, Estudio, Ocio"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreateMeeting}>
        <Text style={styles.buttonText}>Crear Quedada</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateMeetingScreen;

