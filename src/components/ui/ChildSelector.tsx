import React from "react";
import { type Kid } from "../../types/auth";

interface ChildSelectorProps {
  kids: Kid[];
  selectedKidId: string | null;
  onSelectKid: (kidId: string) => void;
  className?: string;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  kids,
  selectedKidId,
  onSelectKid,
  className = "",
}) => {
  if (!kids || kids.length === 0) return null;
  if (kids.length === 1) return null; // Don't show selector for single kid

  const selectedKid = kids.find((k) => k.id === selectedKidId);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-bold text-navy/60 mb-2">
        Sélectionner un enfant
      </label>
      <div className="relative">
        <select
          value={selectedKidId || ""}
          onChange={(e) => onSelectKid(e.target.value)}
          className="w-full appearance-none bg-white border-2 border-beige rounded-2xl px-4 py-3 pr-10 font-bold text-navy focus:outline-none focus:border-blue transition-colors cursor-pointer"
        >
          <option value="" disabled>
            Choisir un enfant...
          </option>
          {kids.map((kid) => (
            <option key={kid.id} value={kid.id}>
              {kid.name} ({kid.age} ans)
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-navy/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {selectedKid && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-blue/5 rounded-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedKid.name}`}
              alt={selectedKid.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-black text-navy text-sm">{selectedKid.name}</p>
            <p className="text-xs text-navy/60 font-bold">
              {selectedKid.age} ans
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
