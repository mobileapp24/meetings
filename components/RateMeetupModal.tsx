import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet,useWindowDimensions} from 'react-native';

// Properties for the RateMeetupModal component (visibility, callback to close modal and to submit the rating)
interface RateMeetupModalProps {
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (rating: number) => void; 
}

const RateMeetupModal: React.FC<RateMeetupModalProps> = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0); // State to track the user's selected rating
   const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  // Handles the submission of the selected rating 
  const handleSubmit = () => {
    onSubmit(rating);  
    setRating(0); // Reset the rating after submission
  };

  return (
    <Modal
      animationType="slide" 
      transparent={true}
      supportedOrientations={['portrait', 'landscape']} 
      visible={visible} // Controls visibility based on the 'visible' prop
      onRequestClose={onClose} // Android back button closes the modal
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView,  isLandscape && styles.pickerContainerLandscape]}>
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
  
  pickerContainerLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Elevation for iOS
    minWidth: 300, // Minimum width for the modal
    maxWidth: 600, // Max width for large screens
  },
  
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22, // Larger font size for better readability
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  starButton: {
    padding: 10,
  },
  starText: {
    fontSize: 40, // Larger stars for better user experience
    color: '#ccc', // Default star color
  },
  selectedStar: {
    color: '#FFD700', // Gold color for selected stars
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
    minWidth: 100, // Ensures the button has a minimum size
  },
  submitButton: {
    backgroundColor: '#2196F3', // Blue color for submit
  },
  cancelButton: {
    backgroundColor: '#FF3B30', // Red color for cancel
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },

});

export default RateMeetupModal;

