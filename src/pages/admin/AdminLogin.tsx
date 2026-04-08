import React, { useState } from "react";
import { Lock, Mail, ShieldCheck, ArrowRight, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContextDefinition";
import api from "../../api/client";
import { type User } from "../../types/auth";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(formData);
      const profileResponse = await api.get<User>("/users/profile", {
        headers: { Authorization: `Bearer ${response.access_token}` },
      });
      const user = profileResponse.data;
      console.log("DEBUG: AdminLogin - User data received:", user);
      console.log("DEBUG: AdminLogin - User role:", user.role);

      if (user.role?.toString().toLowerCase() !== "admin") {
        console.warn("DEBUG: AdminLogin - Access denied. Role is not admin.");
        setError(
          "Accès refusé. Ce portail est réservé aux administrateurs uniquement.",
        );
        setLoading(false);
        return;
      }

      setAuthToken(response.access_token);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue via-lightBlue to-blue" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lightBlue/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue/20 rounded-3xl mb-6 border border-blue/30">
            <ShieldCheck className="w-10 h-10 text-blue" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-white/40 font-medium text-sm">
            Accès réservé aux administrateurs TaraKid
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-semibold">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@tarakid.com"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:border-blue/50 focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl px-4 py-3 pl-12 pr-12 focus:outline-none focus:border-blue/50 focus:bg-white/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue hover:bg-deepBlue text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all mt-2 shadow-lg shadow-blue/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Connexion Admin</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-white/20 text-xs font-semibold tracking-widest uppercase">
          TaraKid Admin · Accès Sécurisé
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
