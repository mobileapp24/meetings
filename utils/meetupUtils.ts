import { doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../services/config';
import { Meetup } from '../types/meetup';

// Update the status of meetups in Firestore that have already passed their scheduled date (mark them as "finished")
export const updateMeetupStatus = async () => {
  const now = new Date();
  const meetupsRef = collection(db, 'meetups'); // Access to Firestore meetups collection
  const q = query(meetupsRef, where('isFinished', '==', false)); // query the active meetups

  try {
    const querySnapshot = await getDocs(q);
    const batch = [];

    querySnapshot.forEach((document) => {
      const meetup = document.data() as Meetup;
      // If the meetup date is earlier than the current date, an update operation is added to the batch
      if (new Date(meetup.date) < now) {
        batch.push(updateDoc(doc(db, 'meetups', document.id), { isFinished: true }));
      }
    });

    await Promise.all(batch); // Runs all cumulative updates concurrently
    console.log('Meetup statuses updated successfully');
  } catch (error) {
    console.error('Error updating meetup statuses:', error);
  }
};

