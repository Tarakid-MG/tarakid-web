import { createContext, useContext } from "react";
import { type User } from "../types/auth";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
