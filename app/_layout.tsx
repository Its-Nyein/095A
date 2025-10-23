import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";

export default function RootLayout() {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = false;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isNavigationReady, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}
