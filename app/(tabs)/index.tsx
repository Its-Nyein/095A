import {
  client,
  COLLECTION_ID,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { Habit } from "@/types/database.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
    const habitSubscription = client.subscribe(channel, (response: RealtimeResponse) => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        fetchHabits();
      } else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
        fetchHabits();
      } else if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
        fetchHabits();
      } else {
        fetchHabits();
      }
    });

    fetchHabits();

    return () => {
      habitSubscription();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [user]);

  const fetchHabits = async () => {
    if (!user) {
      return;
    }

    try {
      const habits = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("user_id", user.$id ?? ""),
      ]);
      setHabits(habits.documents as unknown as Habit[]);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("An unknown error occurred");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="headlineSmall" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => setError(null)} icon="refresh" className="mt-4">
          Retry
        </Button>
      </View>
    );
  }

  const handleDeleteHabit = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("An unknown error occurred");
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      const currentDate = new Date().toISOString();
      await databases.createDocument(DATABASE_ID, COMPLETIONS_COLLECTION_ID, ID.unique(), {
        habit_id: id,
        user_id: user.$id,
        completed_at: currentDate,
      });

      const habit = habits.find(habit => habit.$id === id);
      if (!habit) return;

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("An unknown error occurred");
    }
  };

  const renderLeftActions = () => (
    <View style={styles.leftActions}>
      <View style={styles.leftActionContent}>
        <MaterialCommunityIcons name="trash-can" size={28} color="#ffffff" />
        <Text style={styles.leftActionText}>DELETE</Text>
      </View>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <View style={styles.rightActionContent}>
        <MaterialCommunityIcons name="check-circle" size={28} color="#ffffff" />
        <Text style={styles.rightActionText}>COMPLETE</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Today&apos;s Habits
        </Text>
        <Button mode="contained" onPress={() => signOut()} icon="logout">
          Sign Out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.noHabits}>
            <Text variant="headlineSmall" style={styles.noHabitsText}>
              No habits found
            </Text>
          </View>
        ) : (
          habits.map((habit: Habit, idx: number) => (
            <Swipeable
              key={idx}
              ref={ref => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              containerStyle={styles.swipeableContainer}
              onSwipeableOpen={direction => {
                if (direction === "left") {
                  handleDeleteHabit(habit.$id);
                } else if (direction === "right") {
                  handleCompleteHabit(habit.$id);
                }

                swipeableRefs.current[habit.$id]?.close();
              }}
            >
              <Surface style={styles.surface} elevation={0}>
                <View style={styles.habitContainer}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitDescription}>{habit.description}</Text>
                  <View style={styles.habitStreakAndFrequencyContainer}>
                    <View style={styles.habitStreakItem}>
                      <MaterialCommunityIcons name="fire" size={24} color="#ff9800" />
                      <Text style={styles.habitStreakText}>{habit.streak_count} days streak</Text>
                    </View>
                    <View style={styles.habitFrequencyItem}>
                      <Text style={styles.habitFrequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.habitLastCompletedContainer}>
                    <View style={styles.habitLastCompletedItem}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#4caf50" />
                      <Text style={styles.habitLastCompletedLabel}>Last completed:</Text>
                      <Text style={styles.habitLastCompletedText}>
                        {formatDate(habit.last_completed)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },
  surface: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  habitContainer: {
    padding: 20,
  },
  habitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#22223b",
  },
  habitDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
  },
  habitStreakAndFrequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitStreakItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 5,
  },
  habitStreakText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  habitFrequencyItem: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  habitFrequencyText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  habitLastCompletedContainer: {
    marginTop: 12,
  },
  habitLastCompletedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4caf50",
  },
  habitLastCompletedLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  habitLastCompletedText: {
    fontSize: 13,
    color: "#2e7d32",
    fontWeight: "600",
  },
  noHabits: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noHabitsText: {
    color: "#6c757d",
  },
  errorText: {
    color: "#6c757d",
    marginBottom: 24,
  },
  swipeableContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  leftActions: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#ff5252",
    paddingLeft: 24,
  },
  rightActions: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    paddingRight: 24,
  },
  leftActionContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rightActionContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  leftActionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  rightActionText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
