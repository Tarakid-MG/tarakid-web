import React from "react";
import { useKidMode } from "../hooks/useKidMode";
import {
  Video,
  Gamepad,
  PenTool,
  LogOut,
  Star,
  Trophy,
  Flame,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { ExitKidModeModal } from "../components/kid-mode/ExitKidModeModal";
import { KidProfileSelector } from "../components/kid-mode/KidProfileSelector";
import { useAuth } from "../context/AuthContextDefinition";

const KidDashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedKid, isKidMode, showExitModal, setShowExitModal } =
    useKidMode();

  if (!isKidMode || !selectedKid) {
    return <KidProfileSelector kids={user?.kids || []} />;
  }

  const getKidAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-lightBlue/30 via-white to-yellow/10 font-sans relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow/20 rounded-full blur-3xl -ml-32 -mt-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue/10 rounded-full blur-3xl -mr-48 -mb-48"></div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-2 pr-6 rounded-full shadow-lg border-2 border-white">
          <div className="w-12 h-12 rounded-full border-2 border-orange overflow-hidden bg-orange/10">
            <img
              src={getKidAvatar(selectedKid.name)}
              alt={selectedKid.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-navy leading-none">
              {selectedKid.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-orange uppercase tracking-wider bg-orange/10 px-2 py-0.5 rounded-full">
                Niveau 1
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border-2 border-white">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow fill-current animate-bounce" />
              <span className="text-xl font-black text-navy">124</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-blue" />
              <span className="text-xl font-black text-navy">3</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange fill-current" />
              <span className="text-xl font-black text-navy">5</span>
            </div>
          </div>

          <button
            onClick={() => setShowExitModal(true)}
            className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 p-3 rounded-full shadow-lg border-2 border-white transition-colors group"
            title="Sortir du mode enfant"
          >
            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Welcome Banner */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-navy mb-4 drop-shadow-sm">
            Bonjour <span className="text-blue">{selectedKid.name}</span> ! 👋
          </h1>
          <p className="text-xl text-navy/60 font-medium">
            Prêt pour l'aventure ?
          </p>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Speak Up! Card */}
          <Card
            className="group cursor-pointer overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-linear-to-br from-[#4ADE80] to-[#22C55E] p-0 h-64 relative"
            onClick={() => console.log("Speak Up clicked")}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
            <div className="h-full flex flex-col items-center justify-center relative p-8">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-6xl">🗣️</span>
              </div>
              <h3 className="text-3xl font-black text-white drop-shadow-md text-center">
                PARLER !
              </h3>
              <span className="mt-2 text-white/90 font-bold bg-white/20 px-4 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </Card>

          {/* Magic Academy Game (Featured Center) */}
          <Card
            className="lg:row-span-2 group cursor-pointer overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-linear-to-br from-[#A855F7] to-[#9333EA] p-0 relative min-h-[500px]"
            onClick={() => console.log("Game clicked")}
          >
            <div className="absolute top-4 right-4 bg-yellow text-navy font-black text-sm px-3 py-1 rounded-full transform rotate-12 shadow-lg z-20 animate-pulse">
              NOUVEAU !
            </div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="h-full flex flex-col items-center justify-center relative p-8 text-center">
              <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm border-4 border-white/20 group-hover:scale-110 transition-transform duration-500">
                <span className="text-8xl filter drop-shadow-2xl">🏰</span>
              </div>
              <h3 className="text-4xl lg:text-5xl font-black text-white mb-4 drop-shadow-lg leading-tight">
                MAGIC
                <br />
                ACADEMY
              </h3>
              <button className="bg-yellow hover:bg-yellow/90 text-navy font-black text-xl px-8 py-3 rounded-2xl shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1 transition-all">
                JOUER MAINTENANT
              </button>
            </div>
          </Card>

          {/* Videos Card */}
          <Card
            className="group cursor-pointer overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-linear-to-br from-[#F472B6] to-[#DB2777] p-0 h-64 relative"
            onClick={() => console.log("Videos clicked")}
          >
            <div className="h-full flex flex-col items-center justify-center relative p-8">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                <Video className="w-12 h-12 text-[#DB2777] fill-current" />
              </div>
              <h3 className="text-3xl font-black text-white drop-shadow-md">
                VIDÉOS
              </h3>
            </div>
          </Card>

          {/* Practice Card */}
          <Card
            className="group cursor-pointer overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-linear-to-br from-[#FACC15] to-[#EAB308] p-0 h-64 relative"
            onClick={() => console.log("Practice clicked")}
          >
            <div className="h-full flex flex-col items-center justify-center relative p-8">
              <div className="relative mb-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="w-12 h-12 text-[#EAB308]" />
                </div>
                <div className="absolute -right-2 -top-2 bg-blue text-white w-8 h-8 flex items-center justify-center rounded-full font-black border-2 border-white">
                  ∞
                </div>
              </div>
              <h3 className="text-3xl font-black text-white drop-shadow-md text-center">
                EXERCICES
              </h3>
            </div>
          </Card>

          {/* Games Card */}
          <Card
            className="group cursor-pointer overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-linear-to-br from-[#60A5FA] to-[#2563EB] p-0 h-64 relative"
            onClick={() => console.log("Games clicked")}
          >
            <div className="h-full flex flex-col items-center justify-center relative p-8">
              <div className="w-32 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Gamepad className="w-12 h-12 text-[#2563EB]" />
              </div>
              <h3 className="text-3xl font-black text-white drop-shadow-md">
                JEUX
              </h3>
            </div>
          </Card>
        </div>
      </main>

      {/* Exit Modal - Always rendered but conditionally shown by context */}
      {showExitModal && <ExitKidModeModal />}
    </div>
  );
};

export default KidDashboard;
