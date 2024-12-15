import { doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../services/config';
import { Meetup } from '../types/meetup';

export const updateMeetupStatus = async () => {
  const now = new Date();
  const meetupsRef = collection(db, 'meetups');
  const q = query(meetupsRef, where('isFinished', '==', false));

  try {
    const querySnapshot = await getDocs(q);
    const batch = [];

    querySnapshot.forEach((document) => {
      const meetup = document.data() as Meetup;
      if (new Date(meetup.date) < now) {
        batch.push(updateDoc(doc(db, 'meetups', document.id), { isFinished: true }));
      }
    });

    await Promise.all(batch);
    console.log('Meetup statuses updated successfully');
  } catch (error) {
    console.error('Error updating meetup statuses:', error);
  }
};

