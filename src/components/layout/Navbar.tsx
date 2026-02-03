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
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../context/AuthContextDefinition";
import { useKidMode } from "../../hooks/useKidMode";
import type { Kid } from "../../types/auth";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedKid, enterKidMode } = useKidMode(); // Use kid mode context
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active link helper
  const isActive = (path: string) => location.pathname === path;

  const navItemClasses = (path: string) => {
    return isActive(path)
      ? "flex items-center space-x-2 text-blue font-black bg-blue/10 px-4 py-2 rounded-xl transition-all shadow-sm"
      : "flex items-center space-x-2 text-navy/60 font-bold hover:text-blue hover:bg-slate-50 transition-all px-4 py-2 rounded-xl";
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddKid = () => {
    // Clear previous quiz data to start fresh for new kid
    sessionStorage.removeItem("tarakid_onboarding");
    navigate("/quiz");
    setIsMenuOpen(false);
  };

  const handleKidSelect = (kid: Kid) => {
    enterKidMode(kid);
    setIsMenuOpen(false);
    navigate("/dashboard");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <Logo className="h-8" />
        <nav className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => navigate("/dashboard")}
            className={navItemClasses("/dashboard")}
          >
            <Home className="w-5 h-5" />
            <span>Accueil</span>
          </button>
          <button
            onClick={() => navigate("/schedule")}
            className={navItemClasses("/schedule")}
          >
            <Calendar className="w-5 h-5" />
            <span>Emploi du temps</span>
          </button>
          <button className={navItemClasses("/history")}>
            <Trophy className="w-5 h-5" />
            <span>Historique</span>
          </button>
          <button className={navItemClasses("/help")}>
            <HelpCircle className="w-5 h-5" />
            <span>Aide</span>
          </button>
        </nav>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-3 px-2 py-1 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <div className="px-4 py-2 bg-yellow/10 rounded-2xl flex items-center space-x-3 border border-yellow/20">
            <div className="w-8 h-8 bg-yellow rounded-full flex items-center justify-center text-white text-xs font-black ring-2 ring-white">
              {selectedKid
                ? selectedKid.name[0].toUpperCase()
                : user?.firstName?.[0]?.toUpperCase() || "P"}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-navy/40 uppercase tracking-wider">
                {selectedKid ? "Espace Enfant" : "Espace Parent"}
              </span>
              <span className="text-sm font-black text-navy truncate max-w-[150px] hidden sm:block leading-none">
                {selectedKid ? selectedKid.name : user?.firstName || "Parent"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-navy/40 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="px-4 py-3 border-b border-slate-50 mb-2">
              <p className="text-sm font-bold text-navy">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-navy/40 truncate">{user?.email}</p>
            </div>

            <div className="mb-2">
              <h4 className="px-4 py-1 text-xs font-black text-navy/30 uppercase tracking-wider flex items-center justify-between">
                <span>Changer de profil</span>
              </h4>

              {/* Parent Profile Option */}
              {/* <button
                                  onClick={() => {
                                      // Logic to exit kid mode or select parent profile if we implement strict separation
                                      // For now, parent is the 'default' view but we want to emphasize kids
                                      navigate('/dashboard');
                                      setIsMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!selectedKid ? 'bg-blue/10 text-blue' : 'text-navy/80 hover:bg-slate-50'}`}
                              >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${!selectedKid ? 'bg-blue text-white' : 'bg-slate-100 text-slate-500'}`}>
                                      <UserIcon className="w-3 h-3" />
                                  </div>
                                  Espace Parent
                              </button> */}

              <div className="space-y-1 mt-1">
                {user?.kids && user.kids.length > 0 ? (
                  user.kids.map((kid) => (
                    <button
                      key={kid.id}
                      onClick={() => handleKidSelect(kid)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedKid?.id === kid.id ? "bg-yellow/10 text-navy" : "text-navy/60 hover:bg-slate-50 hover:text-navy"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${selectedKid?.id === kid.id ? "bg-yellow text-white" : "bg-slate-100 text-slate-400"}`}
                      >
                        {kid.name[0]}
                      </div>
                      {kid.name}
                      {selectedKid?.id === kid.id && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
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
                className="w-full flex items-center px-4 py-2 text-sm font-bold text-blue hover:bg-blue/5 rounded-xl transition-colors mt-2"
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
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-navy/60 hover:text-navy hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Paramètres
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
