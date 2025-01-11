import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, useWindowDimensions } from 'react-native';

// Properties of the Custom Alert component (title, message, confirmation and whether it is visible)
interface CustomAlertProps {
  visible: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; // Callback function triggered when the user confirms
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onConfirm }) => {
  const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
  return (
    <Modal
    supportedOrientations={['portrait', 'landscape']} 
      transparent={true} // Background of the modal is partially visible
      visible={visible} // Control the visibility of the modal
      animationType="fade" // Fade animation when the modal appears or disappears
    >
      {/* Center modal in the screen */}
      <View style={styles.centeredView}>
        <View style={[styles.modalView,  isLandscape && styles.pickerContainerLandscape]}>
          {/* Alert Title */}
          <Text style={styles.modalTitle}>{title}</Text>
          {/* Alert Message */}
          <Text style={styles.modalText}>{message}</Text>
          {/* Confirmation Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onConfirm} 
          >
            <Text style={styles.buttonText}>OK</Text>
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerContainerLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
});

export default CustomAlert;

