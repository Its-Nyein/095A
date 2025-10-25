import { COLLECTION_ID, DATABASE_ID, databases } from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

type frequencyType = (typeof frequencyOptions)[number]["value"];

export default function AddHabbitScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<frequencyType>("daily");
  const [error, setError] = useState<string | null>(null);

  const handleAddHabbit = async () => {
    if (!user) {
      return;
    }

    try {
      const habbit = {
        title,
        description,
        frequency,
        streak_count: 0,
        last_completed: new Date().toISOString(),
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        ...habbit,
        user_id: user.$id,
      });
      // clear the form
      setTitle("");
      setDescription("");
      setFrequency("daily");

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("An unknown error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput label="Title" mode="outlined" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput
        label="Description"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <View style={styles.segmentedButtonsContainer}>
        <SegmentedButtons
          buttons={frequencyOptions.map(freq => ({
            value: freq.value,
            label: freq.label.charAt(0).toUpperCase() + freq.label.slice(1),
          }))}
          value={frequency}
          onValueChange={setFrequency}
        />
      </View>
      <Button
        mode="contained"
        disabled={!title || !description}
        onPress={handleAddHabbit}
        style={styles.button}
      >
        Add Habbit
      </Button>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  segmentedButtonsContainer: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
