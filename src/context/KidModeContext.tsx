import React, { useState } from "react";
import type { Kid } from "../types/auth";
import { KidModeContext } from "./KidModeContextDefinition";

export const KidModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isKidMode, setIsKidMode] = useState<boolean>(() => {
    const kidModeActive = sessionStorage.getItem("kidModeActive") === "true";
    const kidData = sessionStorage.getItem("selectedKid");
    return kidModeActive && !!kidData;
  });

  const [selectedKid, setSelectedKid] = useState<Kid | null>(() => {
    const kidModeActive = sessionStorage.getItem("kidModeActive") === "true";
    const kidData = sessionStorage.getItem("selectedKid");
    if (kidModeActive && kidData) {
      try {
        return JSON.parse(kidData);
      } catch (e) {
        console.error("Failed to parse selectedKid from sessionStorage", e);
        return null;
      }
    }
    return null;
  });

  const [showExitModal, setShowExitModal] = useState(false);

  const enterKidMode = (kid: Kid) => {
    setIsKidMode(true);
    setSelectedKid(kid);
    sessionStorage.setItem("kidModeActive", "true");
    sessionStorage.setItem("selectedKid", JSON.stringify(kid));
  };

  const exitKidMode = () => {
    setIsKidMode(false);
    setSelectedKid(null);
    setShowExitModal(false);
    sessionStorage.removeItem("kidModeActive");
    sessionStorage.removeItem("selectedKid");
  };

  return (
    <KidModeContext.Provider
      value={{
        isKidMode,
        selectedKid,
        showExitModal,
        enterKidMode,
        exitKidMode,
        setShowExitModal,
      }}
    >
      {children}
    </KidModeContext.Provider>
  );
};
