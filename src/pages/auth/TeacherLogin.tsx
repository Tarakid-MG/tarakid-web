import React, { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Logo } from "../../components/ui/Logo";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContextDefinition";
import api from "../../api/client";
import { type User } from "../../types/auth";

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    let err = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) err = "L'email est requis";
      else if (!emailRegex.test(value)) err = "Email invalide";
    } else if (name === "password") {
      if (!value) err = "Le mot de passe est requis";
    }
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
    if (error) setError("");
  };

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
      setAuthToken(response.access_token);
      const role = String(user.role || "").toLowerCase().trim();
      if (role !== "teacher" && role !== "admin") {
        setError("Accès réservé aux enseignants.");
        setLoading(false);
        return;
      }
      if (role === "admin") navigate("/admin/sessions");
      else navigate("/teacher/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Email ou mot de passe incorrect";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ background: "var(--color-navy)" }}>

      {/* ── Background orbs ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "var(--color-blue)", opacity: 0.07, filter: "blur(80px)" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "var(--color-teal)", opacity: 0.07, filter: "blur(70px)" }} />
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "var(--color-gold)", opacity: 0.04, filter: "blur(60px)" }} />

      {/* ── Left decorative panel ────────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-16">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(76,201,240,1) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Floating cards decoration */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Stat card mockups */}
          <div className="rounded-3xl p-6 mb-4 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(33,158,188,0.2)" }}>
                <Zap className="w-6 h-6" style={{ color: "var(--color-lightBlue)" }} />
              </div>
              <div>
                <div className="h-2.5 w-20 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="h-5 w-14 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              </div>
            </div>
            <div className="flex gap-1.5">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-2 rounded-full flex-1"
                  style={{ background: i < 5 ? "var(--color-blue)" : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-8 h-8 rounded-xl shrink-0"
                    style={{ background: i === 1 ? "var(--color-blue)" : i === 2 ? "var(--color-teal)" : "rgba(255,255,255,0.1)" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)", width: `${70 - i * 10}%` }} />
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", width: `${50 - i * 5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-12 left-0 right-0 px-16 text-center">
          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.2)" }}>
            <span className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> Excellence Pédagogique
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Support 24/7
            </span>
          </div>
        </div>
      </div>

      {/* ── Right login panel ────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">

          {/* Logo + badge */}
          <div className="flex flex-col items-center mb-10">
            <Logo className="h-12 mb-6" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: "rgba(33,158,188,0.12)",
                border: "1px solid rgba(33,158,188,0.25)",
              }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-teal)" }} />
              <GraduationCap className="w-4 h-4" style={{ color: "var(--color-lightBlue)" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--color-lightBlue)" }}>
                Espace Enseignant
              </span>
            </div>
            <h1 className="text-4xl font-black text-center text-white leading-tight mb-2">
              Prêt pour{" "}
              <span className="italic" style={{ color: "var(--color-lightBlue)" }}>enseigner ?</span>
            </h1>
            <p className="text-sm font-medium text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              Connectez-vous pour accéder à vos cours
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-8"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-1"
                  style={{ color: "rgba(76,201,240,0.6)" }}>
                  Adresse Professionnelle
                </label>
                <Input
                  name="email"
                  icon={Mail}
                  iconClassName="text-white/30"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nom@ecole.com"
                  error={fieldErrors.email}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue rounded-2xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-1"
                  style={{ color: "rgba(76,201,240,0.6)" }}>
                  Mot de Passe
                </label>
                <Input
                  name="password"
                  icon={Lock}
                  iconClassName="text-white/30"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={fieldErrors.password}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue rounded-2xl"
                  required
                  rightAction={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="transition-colors focus:outline-none"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-lightBlue)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  className="group h-14 text-base rounded-2xl text-white font-black flex items-center justify-center gap-2 transition-all"
                >
                  <span>Se Connecter</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.18)" }}>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" /> Excellence Pédagogique
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Support 24/7
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
