import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Home,
  Trophy,
  HelpCircle,
  LogOut,
  Plus,
  ChevronDown,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { ConfirmModal } from "../ui/ConfirmModal";
import { useAuth } from "../../context/AuthContextDefinition";
import { useKidMode } from "../../hooks/useKidMode";
import type { Kid } from "../../types/auth";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedKid, enterKidMode } = useKidMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showKidModeConfirm, setShowKidModeConfirm] = useState(false);
  const [pendingKid, setPendingKid] = useState<Kid | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Active link helper (supports subroutes)
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItemClasses = (path: string) => {
    return isActive(path)
      ? "flex items-center gap-2 text-blue font-black bg-blue/10 px-4 py-2 rounded-xl transition-all shadow-sm"
      : "flex items-center gap-2 text-navy/60 font-bold hover:text-blue hover:bg-slate-50 transition-all px-4 py-2 rounded-xl";
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown / mobile nav on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock scroll when mobile nav is open
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileNavOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddKid = () => {
    sessionStorage.removeItem("tarakid_onboarding");
    navigate("/quiz");
    setIsMenuOpen(false);
    setIsMobileNavOpen(false);
  };

  const handleKidSelect = (kid: Kid) => {
    setPendingKid(kid);
    setShowKidModeConfirm(true);
  };

  const handleConfirmKidSelect = () => {
    if (pendingKid) {
      enterKidMode(pendingKid);
    }
    setIsMenuOpen(false);
    setIsMobileNavOpen(false);
    setShowKidModeConfirm(false);
    setPendingKid(null);
    navigate("/dashboard");
  };

  const handleCancelKidSelect = () => {
    setShowKidModeConfirm(false);
    setPendingKid(null);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsMobileNavOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4 md:gap-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center"
            aria-label="Accueil"
          >
            <Logo className="h-8" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className={navItemClasses("/dashboard")}
              type="button"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => navigate("/schedule")}
              className={navItemClasses("/schedule")}
              type="button"
            >
              <Calendar className="w-5 h-5" />
              <span>Emploi du temps</span>
            </button>

            <button
              onClick={() => navigate("/history")}
              className={navItemClasses("/history")}
              type="button"
            >
              <Trophy className="w-5 h-5" />
              <span>Historique</span>
            </button>

            <button
              onClick={() => navigate("/help")}
              className={navItemClasses("/help")}
              type="button"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Aide</span>
            </button>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile nav button */}
          <button
            type="button"
            className="md:hidden h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition"
            onClick={() => {
              setIsMobileNavOpen((v) => !v);
              setIsMenuOpen(false);
            }}
            aria-label="Ouvrir le menu"
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? (
              <X className="w-5 h-5 text-navy/70" />
            ) : (
              <Menu className="w-5 h-5 text-navy/70" />
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setIsMenuOpen((v) => !v);
                setIsMobileNavOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              type="button"
              className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div className="px-3 py-2 bg-yellow/10 rounded-2xl flex items-center space-x-3 border border-yellow/20">
                <div className="w-8 h-8 bg-yellow rounded-full flex items-center justify-center text-white text-xs font-black ring-2 ring-white">
                  {selectedKid
                    ? selectedKid.name[0].toUpperCase()
                    : user?.firstName?.[0]?.toUpperCase() || "P"}
                </div>

                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-black text-navy truncate max-w-[160px] leading-none">
                    {selectedKid ? selectedKid.name : user?.firstName || "Parent"}
                  </span>
                  <span className="text-[11px] text-navy/40 leading-none mt-1">
                    {selectedKid ? "Profil enfant" : "Profil parent"}
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-navy/40 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200 z-50"
                role="menu"
              >
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-sm font-bold text-navy">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-navy/40 truncate">{user?.email}</p>
                </div>

                <div className="mb-2">
                  <h4 className="px-4 py-1 text-xs font-black text-navy/30 uppercase tracking-wider">
                    Changer de profil
                  </h4>

                  <div className="space-y-1 mt-1">
                    {user?.kids && user.kids.length > 0 ? (
                      user.kids.map((kid) => (
                        <button
                          key={kid.id}
                          onClick={() => handleKidSelect(kid)}
                          type="button"
                          className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                            selectedKid?.id === kid.id
                              ? "bg-yellow/10 text-navy"
                              : "text-navy/60 hover:bg-slate-50 hover:text-navy"
                          }`}
                          role="menuitem"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                              selectedKid?.id === kid.id
                                ? "bg-yellow text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {kid.name[0]}
                          </div>
                          <span className="truncate">{kid.name}</span>
                          {selectedKid?.id === kid.id && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-navy/40 italic">
                        Aucun enfant ajouté
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleAddKid}
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-sm font-bold text-blue hover:bg-blue/5 rounded-xl transition-colors mt-2"
                    role="menuitem"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Ajouter un enfant
                  </button>
                </div>

                <div className="border-t border-slate-50 mt-2 pt-2">
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setIsMenuOpen(false);
                    }}
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-navy/60 hover:text-navy hover:bg-slate-50 rounded-xl transition-colors"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Paramètres
                  </button>

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 grid gap-2">
            <button
              onClick={() => {
                navigate("/dashboard");
                closeAll();
              }}
              className={navItemClasses("/dashboard")}
              type="button"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => {
                navigate("/schedule");
                closeAll();
              }}
              className={navItemClasses("/schedule")}
              type="button"
            >
              <Calendar className="w-5 h-5" />
              <span>Emploi du temps</span>
            </button>

            <button
              onClick={() => {
                navigate("/history");
                closeAll();
              }}
              className={navItemClasses("/history")}
              type="button"
            >
              <Trophy className="w-5 h-5" />
              <span>Historique</span>
            </button>

            <button
              onClick={() => {
                navigate("/help");
                closeAll();
              }}
              className={navItemClasses("/help")}
              type="button"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Aide</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showKidModeConfirm}
        title="Passer en mode enfant ?"
        message={
          pendingKid
            ? `Le profil de ${pendingKid.name} va s'ouvrir avec une interface enfant.`
            : "Le mode enfant va s'ouvrir."
        }
        confirmLabel="Continuer"
        cancelLabel="Annuler"
        variant="info"
        onConfirm={handleConfirmKidSelect}
        onCancel={handleCancelKidSelect}
      />
    </header>
  );
};
