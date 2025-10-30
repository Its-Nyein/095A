import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
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

export interface HabitCompletion extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  user_id: string;
  habit_id: string;
  completed_at: string;
}
