import React, { useState, useEffect, useCallback } from "react";
import { type User } from "../types/auth";
import api from "../api/client";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<User>("/users/profile");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      // Don't call setToken(null) here to avoid potential race conditions or loops
      // if this runs on mount. Instead just clear the user and let the token stay
      // (or clear it if that's the desired behavior for Auth failure).
      // Assuming 401/Invalid token means we should logout:
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line
      fetchProfile();
    }
  }, [token, fetchProfile]);

  const setOnlineStatus = useCallback(
    (isOnline: boolean, authToken?: string) => {
      const activeToken = authToken || token;
      if (!activeToken) return;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      if (
        window.location.protocol === "https:" &&
        apiUrl.startsWith("http://")
      ) {
        return;
      }

      fetch(`${apiUrl}/users/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ isOnline }),
        keepalive: true,
      }).catch(console.error);
    },
    [token],
  );

  useEffect(() => {
    if (user && token) {
      setOnlineStatus(true);

      const handleUnload = () => {
        setOnlineStatus(false);
      };

      window.addEventListener("beforeunload", handleUnload);
      return () => {
        window.removeEventListener("beforeunload", handleUnload);
        setOnlineStatus(false);
      };
    }
  }, [user, token, setOnlineStatus]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    if (token) {
      setOnlineStatus(false, token);
    }
    setToken(null);
    setUser(null);
    // localStorage and sessionStorage clearing handled by effects or explicit calls if needed beyond token
    localStorage.removeItem("kidModeActive");
    localStorage.removeItem("selectedKid");
    sessionStorage.clear();
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await api.post<{ valid: boolean }>(
        "/auth/verify-password",
        {
          userId: user.id,
          password,
        },
      );
      return response.data.valid;
    } catch (error) {
      console.error("Password verification failed:", error);
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshProfile,
        verifyPassword,
        isAuthenticated: !!token,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
