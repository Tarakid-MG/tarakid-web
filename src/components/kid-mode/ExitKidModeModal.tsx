import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Lock, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "../../context/AuthContextDefinition";
import { useKidMode } from "../../hooks/useKidMode";

export const ExitKidModeModal: React.FC = () => {
  const navigate = useNavigate();
  const { verifyPassword } = useAuth();
  const { exitKidMode, setShowExitModal } = useKidMode();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    setError("");
    setLoading(true);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        exitKidMode();
        navigate("/dashboard");
      } else {
        setError("Mot de passe incorrect");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-8 relative">
        <button
          onClick={() => setShowExitModal(false)}
          className="absolute top-4 right-4 text-navy/40 hover:text-navy transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-orange" />
          </div>
          <h2 className="text-2xl font-black text-navy mb-2">
            Sortir du Mode Enfant 🔒
          </h2>
          <p className="text-navy/60 font-medium">
            Entrez le mot de passe parent pour continuer
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold mb-4">
            {error}
          </div>
        )}

        <Input
          label="Mot de passe parent"
          name="password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyPress={(e) => e.key === "Enter" && handleExit()}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-navy/30 hover:text-navy/50 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowExitModal(false)}
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExit}
            loading={loading}
            className="flex-1 bg-orange hover:bg-orange/90"
          >
            Sortir
          </Button>
        </div>
      </Card>
    </div>
  );
};
