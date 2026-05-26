import React, { useCallback, useMemo, useState } from "react";
import type { Kid } from "../types/auth";
import { KidModeContext } from "./KidModeContextDefinition";

export const KidModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isKidMode, setIsKidMode] = useState<boolean>(() => {
    return localStorage.getItem("kidModeActive") === "true";
  });

  const [selectedKid, setSelectedKid] = useState<Kid | null>(() => {
    const kidData = localStorage.getItem("selectedKid");
    if (kidData) {
      try {
        return JSON.parse(kidData);
      } catch (e) {
        console.error("Failed to parse selectedKid from localStorage", e);
        return null;
      }
    }
    return null;
  });

  const [showExitModal, setShowExitModal] = useState(false);

  const enterKidMode = useCallback((kid: Kid) => {
    sessionStorage.removeItem("kidModeJustExited");
    setIsKidMode(true);
    setSelectedKid(kid);
    localStorage.setItem("kidModeActive", "true");
    localStorage.setItem("selectedKid", JSON.stringify(kid));
  }, []);

  const exitKidMode = useCallback(() => {
    sessionStorage.setItem("kidModeJustExited", "true");
    setIsKidMode(false);
    setSelectedKid(null);
    setShowExitModal(false);
    localStorage.removeItem("kidModeActive");
    localStorage.removeItem("selectedKid");
  }, []);

  const updateSelectedKid = useCallback((kid: Kid) => {
    setSelectedKid(kid);
    localStorage.setItem("selectedKid", JSON.stringify(kid));
  }, []);

  const contextValue = useMemo(
    () => ({
      isKidMode,
      selectedKid,
      showExitModal,
      enterKidMode,
      exitKidMode,
      setShowExitModal,
      updateSelectedKid,
    }),
    [
      isKidMode,
      selectedKid,
      showExitModal,
      enterKidMode,
      exitKidMode,
      updateSelectedKid,
    ],
  );

  return (
    <KidModeContext.Provider value={contextValue}>
      {children}
    </KidModeContext.Provider>
  );
};
