import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLoadingUser: boolean;
  signUp: (email: string, password: string) => Promise<string | undefined>;
  signIn: (email: string, password: string) => Promise<string | undefined>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      //   console.error(error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await account.createEmailPasswordSession(email, password);
      await fetchCurrentUser();
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occurred during sign up";
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await fetchCurrentUser();
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occurred during sign in";
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingUser, signUp, signIn, signOut }}>
      {isLoadingUser ? (
        <ActivityIndicator style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
