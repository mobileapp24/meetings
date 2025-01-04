import { GeoPoint } from 'firebase/firestore';

// Defines the Meetup interface that describes the data structure of an event:
export interface Meetup {
  id: string; //unique identifier for the meetup
  title: string;
  description: string;
  location: string;
  coordinates: GeoPoint;
  date: string; // Event date in ISO format
  maxParticipants: number;
  participants: string[]; // Array of user IDs that joined the meetup
  creatorId: string;
  creatorName: string;
  category: string;
  isFinished: boolean;
  ratings: { [userId: string]: number };
  averageRating: number;
}

