import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function Auth() {
  const { signUp, signIn } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSwitch = () => {
    setIsSignUp(prev => !prev);
  };

  const handleAuthSubmit = async () => {
    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      setError(null);

      if (isSignUp) {
        await signUp(email, password);
        // setIsSignUp(false);
      } else {
        await signIn(email, password);
        router.replace("/");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create an account" : "Sign in"}
        </Text>
        <TextInput
          label="Email"
          placeholder="email@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
          onChangeText={setEmail}
        />
        <TextInput
          label="Password"
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry={true}
          mode="outlined"
          style={styles.input}
          onChangeText={setPassword}
        />
        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
        <Button mode="contained" style={styles.button} onPress={handleAuthSubmit}>
          {isSignUp ? "Sign up" : "Sign in"}
        </Button>
        <Button mode="text" onPress={handleSwitch} style={styles.switchButton}>
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  switchButton: {
    marginTop: 16,
  },
});
