import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

// Properties of the CustomAlert component with options: 
// (title, message, cancellation, confirmation and whether it is visible)
interface CustomAlertProps {
  visible: boolean; 
  title: string; 
  message: string;
  onConfirm: () => void; // Function called when the user confirms 
  onCancel: () => void; // Function called when the user cancels
  showCancelButton: boolean; // Determines if the cancel button is displayed
}

const CustomAlert: React.FC<CustomAlertProps> = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  showCancelButton 
}) => {
  return (
    <Modal
      transparent={true} // Background of the modal is partially visible
      visible={visible} // Control the visibility of the modal.
      animationType="fade" // Fade animation when the modal appears or disappears
    >
      {/* Center modal in the screen */}
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Alert Title */}
          <Text style={styles.modalTitle}>{title}</Text>
          {/* Alert Message */}
          <Text style={styles.modalText}>{message}</Text>
          {/* Button container for organizing the buttons horizontally */}
          <View style={styles.buttonContainer}>
            {/* Confirmation button */}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm} 
            >
              <Text style={styles.buttonText}>Sí</Text>
            </TouchableOpacity>
            {/* Conditionally render the cancel button */}
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel} 
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            )}
          </View>
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 80,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomAlert;

