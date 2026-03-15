import React, { useState } from "react";
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

  const enterKidMode = (kid: Kid) => {
    setIsKidMode(true);
    setSelectedKid(kid);
    localStorage.setItem("kidModeActive", "true");
    localStorage.setItem("selectedKid", JSON.stringify(kid));
  };

  const exitKidMode = () => {
    setIsKidMode(false);
    setSelectedKid(null);
    setShowExitModal(false);
    localStorage.removeItem("kidModeActive");
    localStorage.removeItem("selectedKid");
  };

  const updateSelectedKid = (kid: Kid) => {
    setSelectedKid(kid);
    localStorage.setItem("selectedKid", JSON.stringify(kid));
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
        updateSelectedKid,
      }}
    >
      {children}
    </KidModeContext.Provider>
  );
};
