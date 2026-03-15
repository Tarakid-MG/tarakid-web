import React from "react";
import {
  type QuizStepProps,
  type MotherTongueLevel,
} from "../../../types/quiz";

const MotherTongueReadStep: React.FC<QuizStepProps> = ({
  data,
  updateData,
  onNext,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-3xl font-black text-navy mb-8 text-center text-balance">
        {data.childName || "Votre enfant"} sait-il lire sa langue maternelle ?
        📚
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          {
            val: "FLUENT",
            label: "Parfaitement ! ✅",
            sub: "Lit couramment",
          },
          {
            val: "SOME",
            label: "Un petit peu 🤏",
            sub: "Apprend encore les bases",
          },
          {
            val: "NONE",
            label: "Pas encore 👶",
            sub: "Trop petit pour l'instant",
          },
        ].map((opt) => (
          <button
            key={opt.val}
            onClick={() => {
              updateData({
                motherTongueReadingLevel: opt.val as MotherTongueLevel,
              });
              onNext();
            }}
            className={`p-6 rounded-4xl border-4 text-left transition-all ${
              data.motherTongueReadingLevel === opt.val
                ? "border-orange bg-orange/5 shadow-xl scale-[1.02]"
                : "border-beige hover:border-orange/30"
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

export default MotherTongueReadStep;
