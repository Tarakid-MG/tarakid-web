import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { UserPlus } from "lucide-react";
import type { Kid } from "../../types/auth";
import { useKidMode } from "../../hooks/useKidMode";

interface KidProfileSelectorProps {
  kids: Kid[];
  onAddKid?: () => void;
}

export const KidProfileSelector: React.FC<KidProfileSelectorProps> = ({
  kids,
  onAddKid,
}) => {
  const navigate = useNavigate();
  const { enterKidMode } = useKidMode();

  const handleSelectKid = (kid: Kid) => {
    enterKidMode(kid);
    navigate("/kid-dashboard");
  };

  const getKidAvatar = (kid: Kid) => {
    if (kid.avatarUrl) return kid.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.name}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-lightBlue/20 via-yellow/10 to-orange/10 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-navy mb-4">
            Choisis ton <span className="text-orange italic">profil</span> ! 🎨
          </h1>
          <p className="text-navy/60 font-bold text-lg">
            Quel enfant va apprendre aujourd'hui ?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kids.map((kid) => (
            <Card
              key={kid.id}
              className="p-0 overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-transparent hover:border-blue"
              onClick={() => handleSelectKid(kid)}
            >
              <div className="bg-linear-to-br from-blue to-lightBlue p-8 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow/20 rounded-full -mr-16 -mt-16"></div>
                <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative z-10">
                  <img
                    src={getKidAvatar(kid)}
                    alt={kid.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">
                  {kid.name}
                </h3>
                <p className="text-white/90 font-bold text-lg">{kid.age} ans</p>
              </div>
              <div className="p-6 bg-white text-center">
                <Button
                  className="w-full bg-orange hover:bg-orange/90 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectKid(kid);
                  }}
                >
                  C'est parti ! 🚀
                </Button>
              </div>
            </Card>
          ))}

          {/* Add Kid Card */}
          {onAddKid && (
            <Card
              className="p-0 overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-4 border-dashed border-navy/20 hover:border-blue"
              onClick={onAddKid}
            >
              <div className="bg-linear-to-br from-beige to-yellow/20 p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-dashed border-navy/30 flex items-center justify-center bg-white/50">
                  <UserPlus className="w-16 h-16 text-navy/40" />
                </div>
                <h3 className="text-2xl font-black text-navy mb-2">
                  Ajouter un enfant
                </h3>
                <p className="text-navy/60 font-bold">
                  Créer un nouveau profil
                </p>
              </div>
            </Card>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-navy/60 hover:text-blue font-bold transition-colors"
          >
            ← Retour au tableau de bord parent
          </button>
        </div>
      </div>
    </div>
  );
};
