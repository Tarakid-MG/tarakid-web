import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { KidActivityType } from "../../../data/kidLessonActivities";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";

interface ActivityCompletionBannerProps {
  activityType: KidActivityType;
  exerciseScore: number;
  isLesson1BoxGame: boolean;
  isLesson2SoundGame: boolean;
  onReplay: () => void;
  onChooseAnotherLesson: () => void;
  onNextLesson?: () => void;
}

export const ActivityCompletionBanner: React.FC<
  ActivityCompletionBannerProps
> = ({
  activityType,
  exerciseScore,
  isLesson1BoxGame,
  isLesson2SoundGame,
  onReplay,
  onChooseAnotherLesson,
  onNextLesson,
}) => (
  <section className="mb-6 kid-complete-pop">
    <Card variant="kidSection" className="p-6 text-center md:p-7">
      <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full border-[3px] border-white bg-gold text-navy shadow-[0_12px_24px_rgba(239,191,4,0.22)]">
        <Sparkles className="h-9 w-9" />
      </div>
      <h2 className="mt-4 text-3xl font-black text-navy">
        Activité terminée !
      </h2>
      <p className="mt-2 text-base font-bold text-navy/60">
        {activityType === "exercise"
          ? `Tu as trouvé ${exerciseScore} bonne${exerciseScore > 1 ? "s" : ""} réponse${exerciseScore > 1 ? "s" : ""}.`
          : activityType === "vocab"
            ? "Tu as découvert toutes les cartes."
            : isLesson1BoxGame
              ? "Tu as trouvé tous les jouets cachés."
              : isLesson2SoundGame
                ? "Tu as retrouvé tous les jouets avec les sons."
                : "Tu as trouvé toutes les paires."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={onReplay}
          variant="kidOrange"
          className="text-sm uppercase tracking-[0.18em]"
        >
          Rejouer
        </Button>
        <Button
          onClick={onChooseAnotherLesson}
          variant="kidBlue"
          className="text-sm uppercase tracking-[0.18em]"
        >
          Autre leçon
        </Button>
        {onNextLesson && (
          <Button
            onClick={onNextLesson}
            variant="kidTeal"
            className="text-sm uppercase tracking-[0.18em] gap-2"
          >
            Leçon suivante
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  </section>
);
