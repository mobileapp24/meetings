import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

// Properties for the RateMeetupModal component (visibility, callback to close modal and to submit the rating)
interface RateMeetupModalProps {
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (rating: number) => void; 
}

const RateMeetupModal: React.FC<RateMeetupModalProps> = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0); // State to track the user's selected rating

  // Handles the submission of the selected rating 
  const handleSubmit = () => {
    onSubmit(rating);  
    setRating(0); // Reset the rating after submission
  };

  return (
    <Modal
      animationType="slide" 
      transparent={true} 
      visible={visible} // Controls visibility based on the 'visible' prop
      onRequestClose={onClose} // Android back button closes the modal
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Rate this Meetup</Text>
          {/* Star rating system */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star} // Unique key for each star
                onPress={() => setRating(star)} // Updates the rating state on star click
                style={styles.starButton}
              >
                <Text style={[styles.starText, star <= rating && styles.selectedStar]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit rating button */}
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit} 
            disabled={rating === 0} // Disabled if no rating is selected
          >
            <Text style={styles.textStyle}>Submit Rating</Text>
          </TouchableOpacity>

          {/* Cancel button that closes the modal */}
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose} 
          >
            <Text style={styles.textStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  starText: {
    fontSize: 30,
    color: '#ccc',
  },
  selectedStar: {
    color: '#FFD700',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
    minWidth: 100,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RateMeetupModal;

