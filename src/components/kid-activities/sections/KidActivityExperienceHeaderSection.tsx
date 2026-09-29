import React from "react";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Gamepad2, PenTool, Star, Video } from "lucide-react";
import type { KidLessonActivityPack } from "../../../data/kidLessonActivities";
import { ParentKidAvatar } from "../../parent-dashboard";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import type { KidActivityConfig } from "../activityConfig";

interface KidActivityExperienceHeaderProps {
  config: KidActivityConfig;
  currentActivityType: KidActivityConfig["type"];
  kidAvatarSrc?: string;
  kidLevel?: string;
  kidName: string;
  lessonTitle?: string;
  lessonId?: string;
  pack: KidLessonActivityPack;
  onBack: () => void;
  onNavigateToActivity: (target: "video" | "vocab" | "exercise" | "game") => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
}

export const KidActivityExperienceHeader: React.FC<
  KidActivityExperienceHeaderProps
> = ({
  config,
  currentActivityType,
  kidAvatarSrc,
  kidLevel,
  kidName,
  lessonTitle,
  lessonId,
  pack,
  onBack,
  onNavigateToActivity,
  onPrevLesson,
  onNextLesson,
}) => (
  <Card variant="kidGlass" className="p-5 md:p-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <Button variant="kidWhiteIcon" size="iconLg" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <Badge variant="blue" className="tracking-[0.2em] text-blue">
            <Star className="h-3.5 w-3.5 fill-current" />
            {config.badge}
          </Badge>
          <h1 className="mt-3 text-3xl font-black leading-none text-navy md:text-5xl">
            {config.title}
          </h1>
          <p className="mt-2 text-base font-bold text-navy/65 md:text-lg">
            {pack.title} · Unit {pack.unit} · Lesson {pack.lesson}
          </p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-blue">
            {config.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {lessonId ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap justify-end gap-3">
              {[
                {
                  id: "video" as const,
                  label: "Video",
                  icon: <Video className="h-4 w-4" />,
                  active: false,
                },
                {
                  id: "vocab" as const,
                  label: "Vocab",
                  icon: <BookOpen className="h-4 w-4" />,
                  active: currentActivityType === "vocab",
                },
                {
                  id: "exercise" as const,
                  label: "Exercise",
                  icon: <PenTool className="h-4 w-4" />,
                  active: currentActivityType === "exercise",
                },
                {
                  id: "game" as const,
                  label: "Game",
                  icon: <Gamepad2 className="h-4 w-4" />,
                  active: currentActivityType === "game",
                },
              ].map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateToActivity(item.id)}
                  variant={item.active ? "kidOrange" : "kidWhiteIcon"}
                  className={[
                    "px-4 py-2 text-sm",
                    item.active ? "" : "text-navy",
                  ].join(" ")}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={onPrevLesson}
                disabled={!onPrevLesson}
                variant="kidWhiteIcon"
                className="px-3 py-1.5 text-xs text-navy gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous Lesson
              </Button>
              <Button
                type="button"
                onClick={onNextLesson}
                disabled={!onNextLesson}
                variant="kidWhiteIcon"
                className="px-3 py-1.5 text-xs text-navy gap-1 disabled:opacity-40"
              >
                Next Lesson
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : null}

        <Card
          variant="kidCard"
          className="rounded-[2.2rem] border-slate-100 px-5 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-[3px] border-slate-100 bg-white shadow-[0_10px_22px_rgba(32,42,68,0.10)]">
              <ParentKidAvatar
                kidName={kidName}
                avatarSrc={kidAvatarSrc}
                className="h-full w-full"
                fallbackClassName="bg-lightBlue/10 text-xl font-black"
              />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-navy/45">
                {kidName}
              </div>
              <div className="mt-1 text-xl font-black text-navy">
                Niveau {kidLevel || "L0"}
              </div>
              <div className="text-sm font-bold text-blue">{lessonTitle}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Card>
);
