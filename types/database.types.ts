import { Models } from "react-native-appwrite";

export interface Habbit extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  user_id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  streak_count: number;
  last_completed: string;
}
