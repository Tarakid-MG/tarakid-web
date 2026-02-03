import { createContext } from "react";
import type { Kid } from "../types/auth";

export interface KidModeContextType {
  isKidMode: boolean;
  selectedKid: Kid | null;
  showExitModal: boolean;
  enterKidMode: (kid: Kid) => void;
  exitKidMode: () => void;
  setShowExitModal: (show: boolean) => void;
}

export const KidModeContext = createContext<KidModeContextType | undefined>(
  undefined,
);
