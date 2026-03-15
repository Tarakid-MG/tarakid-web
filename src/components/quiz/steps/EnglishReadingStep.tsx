import React from "react";
import { type QuizStepProps, type EnglishLevel } from "../../../types/quiz";

const EnglishReadingStep: React.FC<QuizStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-black text-navy mb-8 text-center text-balance">
        Sait-il lire en <span className="text-blue italic">Anglais</span> ? 📖
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          {
            val: "FLUENT",
            label: "De longues phrases 📚",
            sub: "Lit des livres entiers",
          },
          {
            val: "SENTENCES",
            label: "Des phrases simples 📝",
            sub: "Sujet + Verbe + Complément",
          },
          {
            val: "WORDS",
            label: "Quelques mots seulement 🎈",
            sub: "Couleurs, animaux, etc.",
          },
          {
            val: "NONE",
            label: "Auncun mot pour le moment ✨",
            sub: "C'est le moment de commencer !",
          },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => {
              updateData({ englishReadingLevel: opt.val as EnglishLevel });
              onNext();
            }}
            className={`p-5 rounded-4xl border-4 text-left transition-all ${
              data.englishReadingLevel === opt.val
                ? "border-blue bg-blue/5 shadow-xl scale-[1.02]"
                : "border-beige hover:border-blue/30"
            }`}
          >
            <p className="font-black text-xl text-navy mb-1">{opt.label}</p>
            <p className="font-bold text-navy/40">{opt.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EnglishReadingStep;
