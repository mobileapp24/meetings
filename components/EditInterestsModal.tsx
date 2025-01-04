import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

// Properties for the Edit interests modal component 
// (list of interests, whether it is visible, saving and canceling updated interests)
interface EditInterestsModalProps {
  visible: boolean; 
  interests: string[]; 
  onSave: (interests: string[]) => void; 
  onCancel: () => void; 
}

const EditInterestsModal: React.FC<EditInterestsModalProps> = ({ visible, interests, onSave, onCancel }) => {
  const [newInterests, setNewInterests] = useState<string[]>(interests); // State for the list of interests
  const [newInterest, setNewInterest] = useState(''); // State for the new interest input field

  // Adds a new interest to the list if it is not empty and if it doesn't already exist
  const addInterest = () => {
    if (newInterest.trim() !== '' && !newInterests.includes(newInterest.trim())) {
      setNewInterests([...newInterests, newInterest.trim()]);
      setNewInterest(''); // Clear the input field after adding it
    }
  };

  // Removes an interest from the list
  const removeInterest = (interest: string) => {
    setNewInterests(newInterests.filter(i => i !== interest));
  };

  // Saves the updated list of interests (calling property "onSave" with the updated interests)
  const handleSave = () => {
    onSave(newInterests); 
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      {/* Modal background with centered content */}
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Interests</Text>
          {/* Input field and button for adding a new interest */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newInterest}
              onChangeText={setNewInterest} // Updates the new interest when the user types
              placeholder="Add new interest"
            />
            <TouchableOpacity style={styles.addButton} onPress={addInterest}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* List of current interests with an option to remove each individual item */}
          <FlatList
            data={newInterests}
            renderItem={({ item }) => (
              <View style={styles.interestItem}>
                <Text>{item}</Text>
                <TouchableOpacity onPress={() => removeInterest(item)}>
                  <Text style={styles.removeButton}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.interestsList}
          />

          <View style={styles.buttonContainer}>
            {/* Button for canceling changes */}
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            {/* Button for saving changes */}
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
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
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  interestsList: {
    maxHeight: 200,
    width: '100%',
  },
  interestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditInterestsModal;

