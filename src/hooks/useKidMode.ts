import { useContext } from "react";
import { KidModeContext } from "../context/KidModeContextDefinition";

export const useKidMode = () => {
  const context = useContext(KidModeContext);
  if (!context) {
    throw new Error("useKidMode must be used within KidModeProvider");
  }
  return context;
};
