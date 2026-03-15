import React from "react";
import {
  Gamepad2,
  Music,
  Palette,
  Trophy,
  BookOpen,
  Camera,
  ChefHat,
  Heart,
} from "lucide-react";
import { type QuizStepProps } from "../../../types/quiz";

const HobbiesStep: React.FC<QuizStepProps> = ({ data, updateData }) => {
  const hobbiesList = [
    {
      id: "Gaming",
      icon: Gamepad2,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    { id: "Music", icon: Music, color: "text-pink-500", bg: "bg-pink-50" },
    { id: "Art", icon: Palette, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "Sports", icon: Trophy, color: "text-blue-500", bg: "bg-blue-50" },
    {
      id: "Reading",
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      id: "Photography",
      icon: Camera,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      id: "Cooking",
      icon: ChefHat,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    { id: "Animals", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-black text-navy mb-4 text-center text-balance">
        Qu'est-ce que {data.childName || "votre enfant"} aime ? ❤️
      </h2>
      <p className="text-navy/40 font-bold text-center mb-8">
        Choisissez autant que vous voulez !
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {hobbiesList.map((hobby) => {
          const isSelected = data.hobbies.includes(hobby.id);
          const HobbyIcon = hobby.icon;
          return (
            <button
              key={hobby.id}
              onClick={() => {
                const newHobbies = isSelected
                  ? data.hobbies.filter((h) => h !== hobby.id)
                  : [...data.hobbies, hobby.id];
                updateData({ hobbies: newHobbies });
              }}
              className={`p-4 rounded-3xl border-4 flex flex-col items-center transition-all ${
                isSelected
                  ? "border-blue bg-blue/5 scale-105 shadow-lg"
                  : "border-beige hover:border-blue/20"
              }`}
            >
              <div
                className={`p-3 rounded-2xl ${hobby.bg} ${hobby.color} mb-2`}
              >
                <HobbyIcon className="w-8 h-8" />
              </div>
              <p className="font-black text-xs uppercase tracking-tight">
                {hobby.id}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HobbiesStep;
