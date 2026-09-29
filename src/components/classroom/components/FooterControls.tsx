import React from "react";
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Users } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
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
  <Button
    onClick={onClick}
    variant={
      danger
        ? "classroomControlDanger"
        : active
          ? "classroomControlActive"
          : "classroomControl"
    }
    size="iconMd"
    className="rounded-[1.2rem]"
  >
    {children}
  </Button>
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
    <Card
      variant="parentPanel"
      className="flex flex-col justify-between gap-5 rounded-[2rem] border-4 border-white/85 px-5 py-5 md:px-8 lg:flex-row lg:items-center"
    >
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
          <Button
            onClick={onShowLessonSelector}
            variant="classroomControl"
            className="h-14 rounded-[1.2rem] px-6 uppercase tracking-widest text-navy hover:border-blue"
          >
            <Users className="w-5 h-5 text-blue" />
            <span>Changer Leçon</span>
          </Button>
        )}
      </div>

      <Button
        onClick={onLeave}
        variant="danger"
        className="h-14 self-start rounded-[1.2rem] px-8 uppercase tracking-widest lg:self-auto"
      >
        <PhoneOff className="w-5 h-5" />
        <span>Quitter</span>
      </Button>
    </Card>
  );
};
