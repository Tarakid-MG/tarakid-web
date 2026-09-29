import React, { Suspense, lazy, useRef, useEffect } from "react";
import { Clock, MessageSquare, Users, Loader2 } from "lucide-react";
import type { Lesson, RemotePointer } from "../types";
import { Socket } from "socket.io-client";

const DocumentViewer = lazy(() =>
  import("../DocumentViewer").then((module) => ({
    default: module.DocumentViewer,
  })),
);

interface LessonContentProps {
  lesson: Lesson | null;
  isTeacher: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  geniallyContainerRef: React.RefObject<HTMLDivElement | null>;
  remotePointer: RemotePointer | null;
  timeLeft: number;
  socket: Socket | null;
  bookingId: string;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onShowLessonSelector: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

function resolveAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function decodeContent(content: string): string {
  try {
    return atob(content);
  } catch {
    return content;
  }
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  isTeacher,
  iframeRef,
  geniallyContainerRef,
  remotePointer,
  timeLeft,
  socket,
  bookingId,
  onMouseMove,
  onShowLessonSelector,
}) => {
  const lessonContainerRef = useRef<HTMLDivElement>(null);
  const decodedContent = lesson ? decodeContent(lesson.content) : "";
  const lessonContentIsUrl = decodedContent.startsWith("http://") || decodedContent.startsWith("https://");


  useEffect(() => {
    if (lesson?.type === "genially" && !lessonContentIsUrl && geniallyContainerRef.current) {
      const scriptId = "genially-embed-js";
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();

      geniallyContainerRef.current.innerHTML = decodedContent;
      const scripts = geniallyContainerRef.current.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [lesson, decodedContent, lessonContentIsUrl, geniallyContainerRef]);

  const documentLoadingFallback = (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,249,251,0.96))]">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue" />
        <p className="text-xs font-black uppercase tracking-[0.18em] text-navy/60">
          Chargement du document
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex-3 relative overflow-hidden border-r border-slate-100/70 flex flex-col p-4 md:p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,250,252,0.96))]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue/10 border border-blue/15 flex items-center justify-center shadow-sm">
            <MessageSquare className="w-5 h-5 text-blue" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/40">
              Tableau interactif
            </div>
            <div className="text-sm md:text-base font-black text-navy">
              {lesson?.title || (isTeacher ? "Choisis une leçon" : "Le cours arrive")}
            </div>
          </div>
        </div>
        <div className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-blue shadow-sm">
          {lesson ? (lesson.type === "genially" ? "Mode jeu" : "Mode document") : "En attente"}
        </div>
      </div>

      <div
        ref={lessonContainerRef}
        className="flex-1 w-full max-w-7xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_40px_rgba(32,42,68,0.08)] relative border-4 border-white"
        onMouseMove={onMouseMove}
      >
        {timeLeft <= 60 && timeLeft > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-200 animate-bounce">
            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-3 border-2 border-white/50">
              <Clock className="w-5 h-5" />
              <span className="uppercase tracking-widest">Il reste 1 minute !</span>
            </div>
          </div>
        )}

        {lesson ? (
          <div className="w-full h-full relative">
            {lesson.type === "genially" ? (
              <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
                <div className="w-full h-full">
                  {lessonContentIsUrl ? (
                    <iframe
                      ref={iframeRef}
                      src={resolveAssetUrl(decodedContent)}
                      className="w-full h-full"
                      title={lesson.title}
                      allow="fullscreen"
                      onLoad={() => {
                        if (isTeacher && iframeRef.current) {
                          socket?.emit("genially:pageChange", { bookingId, url: iframeRef.current.src });
                        }
                      }}
                    />
                  ) : (
                    <div
                      ref={geniallyContainerRef}
                      className="w-full h-full relative min-h-[400px] bg-white"
                    >
                      {!isTeacher && (
                        <div
                          className="absolute inset-0 z-50 bg-transparent"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => e.preventDefault()}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Suspense fallback={documentLoadingFallback}>
                <DocumentViewer
                  url={resolveAssetUrl(lesson.content)}
                  socket={socket}
                  bookingId={bookingId}
                  isTeacher={isTeacher}
                />
              </Suspense>
            )}

            {remotePointer && (
              <div
                className="absolute w-6 h-6 bg-red-50 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.9)] pointer-events-none transition-all duration-150 z-150 flex items-center justify-center border-2 border-white"
                style={{
                  left: `${remotePointer.x * 100}%`,
                  top: `${remotePointer.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                <div className="absolute top-8 left-8 px-3 py-1 bg-navy/80 backdrop-blur-sm text-[10px] font-black text-white uppercase rounded-xl tracking-widest whitespace-nowrap shadow-lg border border-white/10">
                  {isTeacher ? "L'élève regarde ici" : "Regarde ici !"}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-10 text-center bg-[radial-gradient(circle_at_top,rgba(76,201,240,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,249,251,0.96))]">
            {isTeacher ? (
              <>
                <div className="w-24 h-24 bg-blue/10 rounded-4xl flex items-center justify-center mb-2 border-4 border-white shadow-xl classroom-float-slow">
                  <MessageSquare className="w-12 h-12 text-blue" />
                </div>
                <h2 className="text-2xl font-black text-navy uppercase tracking-tighter">Aucune leçon sélectionnée</h2>
                <p className="text-slate-400 max-w-xs font-bold text-xs uppercase tracking-widest">Sélectionnez une leçon pour commencer !</p>
                <button
                  onClick={onShowLessonSelector}
                  className="mt-4 px-10 py-5 bg-blue text-white rounded-4xl font-black uppercase tracking-widest shadow-2xl shadow-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <Users className="w-5 h-5" />
                  CHOISIR UNE LEÇON
                </button>
              </>
            ) : (
              <>
                <div className="relative classroom-float-slow">
                  <div className="absolute inset-0 bg-blue/20 blur-3xl rounded-full animate-pulse" />
                  <Loader2 className="w-16 h-16 animate-spin text-blue relative z-10" />
                </div>
                <h2 className="text-2xl font-black text-navy uppercase tracking-tighter mt-4">Préparation du cours</h2>
                <p className="text-slate-400 max-w-xs font-bold text-xs uppercase tracking-widest">Le professeur prépare le contenu...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
