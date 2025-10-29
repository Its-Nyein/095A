import { AuthProvider, useAuth } from "@/lib/authContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, useTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoadingUser } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const authGroup = segments[0] === "auth";
    if (!user && !authGroup && !isLoadingUser) {
      router.replace("/auth");
    } else if (user && authGroup && !isLoadingUser) {
      router.replace("/");
    }
  }, [user, segments, router, isLoadingUser]);

  return children;
};

export default function RootLayout() {
  const theme = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
