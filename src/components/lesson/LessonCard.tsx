import { ChevronRight, FileText, Lock, Play, Star, Video } from "lucide-react";
import type { Lesson, Unit } from "../../services/lesson.service";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { getLessonThumbnail } from "./lessonSelectionUtils";

type LessonCardProps = {
  lesson: Lesson;
  unit: Unit;
  level?: string | null;
  suggestedLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onLockedLesson: () => void;
};

export function LessonCard({
  lesson,
  unit,
  level,
  suggestedLessonId,
  onSelectLesson,
  onLockedLesson,
}: LessonCardProps) {
  const thumbnail = getLessonThumbnail(lesson, unit, level);

  const handleSelect = () => {
    if (lesson.isLocked) {
      onLockedLesson();
      return;
    }

    onSelectLesson({
      ...lesson,
      thumbnailUrl: thumbnail,
    });
  };

  return (
    <Card
      onClick={handleSelect}
      className={`group relative overflow-hidden rounded-[2rem] border-[3px] text-left shadow-[0_18px_36px_rgba(34,82,145,0.10)] focus:ring-4 focus:ring-blue/20 ${
        lesson.isLocked
          ? "border-slate-200 opacity-80"
          : "border-lightBlue/30 hover:-translate-y-1.5 hover:border-lightBlue hover:shadow-[0_24px_42px_rgba(33,158,188,0.16)]"
      }`}
    >
      {lesson.id === suggestedLessonId ? (
        <Badge
          variant="yellow"
          className="absolute left-3 top-3 z-20 -rotate-6 rounded-xl px-3 py-1"
        >
          NOUVEAU !
        </Badge>
      ) : null}

      <div className="relative aspect-[1.45] overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={lesson.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.endsWith(".jpeg")) {
              target.src = thumbnail.replace(".png", ".jpeg");
            } else {
              target.style.display = "none";
            }
          }}
        />

        <div className="absolute right-4 top-4">
          {lesson.isLocked ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-slate-500/90 text-white shadow-lg backdrop-blur-sm">
              <Lock className="h-5 w-5 fill-current" />
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/92 text-blue shadow-lg backdrop-blur-sm">
              {lesson.type === "pdf" ? (
                <FileText className="h-5 w-5" />
              ) : lesson.type === "video" ? (
                <Video className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </div>
          )}
        </div>
      </div>

        <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <Badge
            variant="blue"
            className="bg-lightBlue/12 px-3 py-1 tracking-[0.08em] shadow-none"
          >
            Lesson {lesson.order}
          </Badge>
          <h4 className="mt-3 line-clamp-2 text-[1.25rem] font-black leading-tight tracking-[-0.03em] text-navy group-hover:text-blue">
            {lesson.title}
          </h4>
          <div
            className={`mt-4 flex items-center gap-2 text-sm font-black ${
              lesson.isLocked
                ? "text-slate-400"
                : "text-blue group-hover:text-deepBlue"
            }`}
          >
            {lesson.isLocked ? "VERROUILLÉ" : "JOUER"}
            {!lesson.isLocked ? <ChevronRight className="h-4 w-4" /> : null}
          </div>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-[0_8px_16px_rgba(32,42,68,0.04)]">
          <Star className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
