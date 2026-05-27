import { Sparkles, Video } from "lucide-react";

export function WaitingOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-blue/40 backdrop-blur-md animate-in fade-in duration-500" />
      <div className="relative overflow-hidden bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-8 border-white">
        <div className="absolute -left-12 top-6 h-28 w-28 rounded-full bg-yellow/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-32 w-32 rounded-full bg-lightBlue/20 blur-3xl" />
        <div className="w-24 h-24 bg-linear-to-br from-yellow to-orange rounded-full flex items-center justify-center mb-8 shadow-xl kid-bob">
          <Video className="w-12 h-12 text-navy" />
        </div>
        <h2 className="text-4xl font-black text-navy mb-4 uppercase tracking-tighter">
          SALLE D&apos;ATTENTE
        </h2>
        <p className="text-navy/60 text-xl font-medium max-w-md mb-10 leading-relaxed">
          Le professeur prépare la classe...
          <br />
          <span className="text-blue font-black tracking-widest uppercase text-sm">
            Tu seras admis automatiquement
          </span>
        </p>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-center gap-2 text-blue font-black animate-pulse">
            <Sparkles className="w-5 h-5" />
            PATIENCE, ÇA VA COMMENCER !
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="mt-6 text-navy/40 font-black uppercase text-sm hover:text-red-500 transition-colors"
          >
            Annuler et revenir au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}
