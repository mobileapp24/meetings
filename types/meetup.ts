export interface Meetup {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  maxParticipants: number;
  participants: string[]; // Array of user IDs
  creatorId: string;
  creatorName: string;
  category: string;
}
