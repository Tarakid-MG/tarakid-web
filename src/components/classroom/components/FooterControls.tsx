import React from "react";
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Users } from "lucide-react";
import type { Lesson } from "../types";

interface ControlButtonProps {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}

interface FooterControlsProps {
  micEnabled: boolean;
  videoEnabled: boolean;
  showChat: boolean;
  isTeacher: boolean;
  lesson: Lesson | null;
  timeLeft: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
  onShowLessonSelector: () => void;
  formatTime: (seconds: number) => string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, active, danger, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition-all shadow-md border-2 ${
      danger
        ? "bg-red-500 text-white border-transparent hover:bg-red-600 shadow-red-200"
        : active
          ? "bg-blue text-white border-transparent shadow-blue/20"
          : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

export const FooterControls: React.FC<FooterControlsProps> = ({
  micEnabled,
  videoEnabled,
  showChat,
  isTeacher,
  lesson,
  timeLeft,
  onToggleMic,
  onToggleVideo,
  onToggleChat,
  onLeave,
  onShowLessonSelector,
  formatTime,
}) => {
  return (
    <div className="bg-white/92 backdrop-blur-md rounded-[2rem] shadow-[0_20px_48px_rgba(32,42,68,0.16)] flex flex-col lg:flex-row lg:items-center justify-between px-5 md:px-8 py-5 gap-5 border-4 border-white/85">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-linear-to-br from-yellow to-orange rounded-2xl flex items-center justify-center border-2 border-white shadow-sm shrink-0">
          <span className="text-navy font-black text-xs font-sans">{lesson?.order || 1}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
            Session en cours •{" "}
            <span className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-blue"}>
              {formatTime(timeLeft)}
            </span>
          </p>
          <h3 className="text-sm md:text-base font-black text-navy truncate max-w-[320px]">{lesson?.title || "..."}</h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <ControlButton onClick={onToggleVideo} danger={!videoEnabled}>
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </ControlButton>
        <ControlButton onClick={onToggleMic} danger={!micEnabled}>
          {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </ControlButton>
        <ControlButton onClick={onToggleChat} active={showChat}>
          <MessageSquare className="w-6 h-6" />
        </ControlButton>

        {isTeacher && (
          <button
            type="button"
            onClick={onShowLessonSelector}
            className="px-6 h-14 bg-white border-2 border-slate-100 hover:border-blue text-navy rounded-[1.2rem] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-3 active:scale-95"
          >
            <Users className="w-5 h-5 text-blue" />
            <span>Changer Leçon</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onLeave}
        className="px-8 h-14 bg-red-500 hover:bg-red-600 text-white rounded-[1.2rem] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center gap-3 self-start lg:self-auto"
      >
        <PhoneOff className="w-5 h-5" />
        <span>Quitter</span>
      </button>
    </div>
  );
};
