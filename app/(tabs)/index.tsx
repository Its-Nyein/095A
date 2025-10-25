import { client, COLLECTION_ID, DATABASE_ID, databases, RealtimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { Habbit } from "@/types/database.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button, Surface, Text } from "react-native-paper";

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const [habbits, setHabbits] = useState<Habbit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
    const habbitSubscription = client.subscribe(channel, (response: RealtimeResponse) => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        fetchHabbits();
      } else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
        fetchHabbits();
      } else if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
        fetchHabbits();
      } else {
        fetchHabbits();
      }
    });

    fetchHabbits();

    return () => {
      habbitSubscription();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [user]);

  const fetchHabbits = async () => {
    if (!user) {
      return;
    }

    try {
      const habbits = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("user_id", user.$id ?? ""),
      ]);
      setHabbits(habbits.documents as unknown as Habbit[]);
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
        <Text variant="headlineSmall" style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => setError(null)} icon="refresh" className="mt-4">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Today&apos;s Habbits
        </Text>
        <Button mode="contained" onPress={() => signOut()} icon="logout">
          Sign Out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {habbits.length === 0 ? (
          <View style={styles.noHabbits}>
            <Text variant="headlineSmall" style={styles.noHabbitsText}>
              No habbits found
            </Text>
          </View>
        ) : (
          habbits.map((habbit: Habbit, idx: number) => (
            <Surface key={idx} style={styles.surface} elevation={0}>
              <View key={idx} style={styles.habbitContainer}>
                <Text style={styles.habbitTitle}>{habbit.title}</Text>
                <Text style={styles.habbitDescription}>{habbit.description}</Text>
                <View style={styles.habbitStreakAndFrequencyContainer}>
                  <View style={styles.habbitStreakItem}>
                    <MaterialCommunityIcons name="fire" size={24} color="#ff9800" />
                    <Text style={styles.habbitStreakText}>{habbit.streak_count} days streak</Text>
                  </View>
                  <View style={styles.habbitFrequencyItem}>
                    <Text style={styles.habbitFrequencyText}>
                      {habbit.frequency.charAt(0).toUpperCase() + habbit.frequency.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.habbitLastCompletedContainer}>
                  <View style={styles.habbitLastCompletedItem}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4caf50" />
                    <Text style={styles.habbitLastCompletedLabel}>Last completed:</Text>
                    <Text style={styles.habbitLastCompletedText}>{formatDate(habbit.last_completed)}</Text>
                  </View>
                </View>
              </View>
            </Surface>
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
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#00000005",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  habbitContainer: {
    padding: 20,
  },
  habbitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#22223b",
  },
  habbitDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
  },
  habbitStreakAndFrequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habbitStreakItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 5,
  },
  habbitStreakText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  habbitFrequencyItem: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  habbitFrequencyText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  habbitLastCompletedContainer: {
    marginTop: 12,
  },
  habbitLastCompletedItem: {
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
  habbitLastCompletedLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  habbitLastCompletedText: {
    fontSize: 13,
    color: "#2e7d32",
    fontWeight: "600",
  },
  noHabbits: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noHabbitsText: {
    color: "#6c757d",
  },
  errorText: {
    color: "#6c757d",
    marginBottom: 24,
  },
});
