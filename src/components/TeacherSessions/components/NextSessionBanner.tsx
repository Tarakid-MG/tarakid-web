import React, { useState, useEffect, useCallback } from "react";
import { Video, PlayCircle, ArrowRight, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale/fr";
import type { Session } from "../types";

interface NextSessionBannerProps {
  session: Session | null;
  onEnterClassroom: (session: Session) => void;
}

export const NextSessionBanner: React.FC<NextSessionBannerProps> = ({
  session,
  onEnterClassroom,
}) => {
  const ENTRY_WINDOW_MS = 5 * 60 * 1000;
  const [canEnter, setCanEnter] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  const computeGate = useCallback(() => {
    if (!session) return { canEnter: false, countdown: null };

    const startMs = new Date(
      `${session.sessionDate}T${session.startTime}`,
    ).getTime();
    const endMs = new Date(
      `${session.sessionDate}T${session.endTime}`,
    ).getTime();
    const windowOpens = startMs - ENTRY_WINDOW_MS;
    const now = Date.now();

    if (now >= windowOpens) {
      // Button is active from 5 mins before start until session ends
      if (now > endMs) {
        return { canEnter: false, countdown: null };
      }
      return { canEnter: true, countdown: null };
    }

    const diffToWindow = windowOpens - now;

    const totalSec = Math.ceil(diffToWindow / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    const cd = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

    return { canEnter: false, countdown: cd };
  }, [session, ENTRY_WINDOW_MS]);

  useEffect(() => {
    const update = () => {
      const { canEnter: cE, countdown: cD } = computeGate();
      setCanEnter(cE);
      setCountdown(cD);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [computeGate]);

  if (!session) return null;

  return (
    <div className="bg-white rounded-[2rem] border-4 border-blue/10 p-6 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue/5 rounded-full -mr-10 -mt-10 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal/5 rounded-full -ml-10 -mb-10 blur-2xl" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue flex items-center justify-center shadow-lg shadow-blue/20">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-blue uppercase tracking-widest mb-1">
              {canEnter ? "Cours en cours ou imminent" : "Prochain cours"}
            </div>
            <div className="text-2xl font-black text-navy flex items-baseline gap-2 flex-wrap">
              <span className="capitalize">
                {format(parseISO(session.sessionDate), "eeee d MMMM", {
                  locale: fr,
                })}
              </span>
              <span className="text-blue">
                à {session.startTime.substring(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-500 uppercase">
                Élève: {session.kid.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-sm font-medium text-slate-400">
                Niveau {session.kid.level}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onEnterClassroom(session)}
          disabled={!canEnter}
          className={`
            min-w-[240px] px-8 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95
            ${
              canEnter
                ? "bg-teal text-white shadow-lg shadow-teal/25 hover:brightness-105 animate-pulse"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 text-base"
            }
          `}
        >
          {canEnter ? (
            <>
              <PlayCircle className="w-6 h-6 fill-current" />
              ENTRER EN CLASSE
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              {countdown ? `DANS ${countdown}` : "PAS ENCORE"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
