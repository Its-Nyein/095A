import { AuthProvider, useAuth } from "@/lib/authContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

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
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}
