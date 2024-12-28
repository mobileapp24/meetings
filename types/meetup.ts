import { GeoPoint } from 'firebase/firestore';

export interface Meetup {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: GeoPoint;
  date: string;
  maxParticipants: number;
  participants: string[]; // Array of user IDs
  creatorId: string;
  creatorName: string;
  category: string;
  isFinished: boolean;
  ratings: { [userId: string]: number };
  averageRating: number;
}

