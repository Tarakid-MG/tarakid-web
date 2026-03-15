import React, { useState } from "react";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Logo } from "../../components/ui/Logo";
import { authService } from "../../services/auth.service";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setError("Jeton de réinitialisation manquant");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.resetPassword({ token, password });
      setSuccess(response.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-lightBlue/10 via-white to-yellow/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <h2 className="text-2xl font-black text-navy mb-4">Lien invalide</h2>
          <p className="text-navy/60 mb-6">
            Ce lien de réinitialisation est manquant ou incorrect.
          </p>
          <Link to="/forgot-password">
            <Button fullWidth>Demander un nouveau lien</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-lightBlue/10 via-white to-yellow/10 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 -right-10 w-48 h-48 bg-lightBlue rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        <Logo className="h-16 mb-8" />

        <Card className="w-full p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-navy mb-3">Réussi !</h2>
              <p className="text-navy/60 text-sm font-medium">{success}</p>
              <p className="mt-4 text-xs text-blue font-bold italic">
                Redirection vers la connexion...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-black text-navy mb-2">
                  Nouveau mot de passe
                </h1>
                <p className="text-navy/60 text-sm font-medium">
                  Choisissez un mot de passe fort et mémorable.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                    {error}
                  </div>
                )}

                <Input
                  label="Nouveau mot de passe"
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Confirmer le mot de passe"
                  icon={Lock}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  className="group"
                >
                  <span>Réinitialiser</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
