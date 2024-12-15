//En una aplicación real, estos datos deberían obtenerse de una API o de un almacenamiento local.
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Datos de ejemplo del usuario
const userData = {
  name: 'Mireia Torrente',
  photo: 'https://example.com/ana-garcia.jpg', // Reemplaza con una URL de imagen real
  interests: ['Tecnología', 'Deportes', 'Clarinete'],
  rating: 4.5,
  meetingsAttended: 15,
  bio: 'Entusiasta de la tecnología y amante de los deportes al aire libre.',
};

const ProfileScreen = () => {
  return (
    // ScrollView para asegurar que todo el contenido sea accesible en pantallas más pequeñas.
    <ScrollView style={styles.container}> 
      <View style={styles.header}>
        <Image
          source={{ uri: userData.photo }}
          style={styles.profilePhoto}
        />
        <Text style={styles.name}>{userData.name}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Intereses</Text>
        <View style={styles.interestsContainer}>
          {userData.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Puntuación</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={24} color="#FFD700" />
          <Text style={styles.ratingText}>{userData.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Reuniones Asistidas</Text>
        <Text style={styles.meetingsText}>{userData.meetingsAttended}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Biografía</Text>
        <Text style={styles.bioText}>{userData.bio}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Historial de Reuniones</Text>
        {/* Aquí puedes agregar una lista de reuniones pasadas */}
        <Text style={styles.historyText}>Próximamente: Lista de reuniones pasadas</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    marginLeft: 5,
  },
  meetingsText: {
    fontSize: 18,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  historyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;




