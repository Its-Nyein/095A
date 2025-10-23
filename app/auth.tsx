import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const handleSwitch = () => {
    setIsSignUp(prev => !prev);
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
        />
        <TextInput
          label="Password"
          placeholder="Password"
          autoCapitalize="none"
          keyboardType="visible-password"
          mode="outlined"
          style={styles.input}
        />
        <Button mode="contained" style={styles.button}>
          {isSignUp ? "Create account" : "Sign in"}
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
