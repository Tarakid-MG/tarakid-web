import React from "react";
import { BookOpen, Gamepad2, PenTool } from "lucide-react";
import type { KidActivityType } from "../../data/kidLessonActivities";

export interface KidActivityConfig {
  type: KidActivityType;
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  chip: string;
  icon: React.ReactNode;
  listTitle: string;
  listSubtitle: string;
  routeBase: string;
}

export const kidActivityConfig: Record<KidActivityType, KidActivityConfig> = {
  exercise: {
    type: "exercise",
    title: "Exercices",
    subtitle: "Choisis la bonne image",
    badge: "Mission",
    accent: "linear-gradient(135deg, #FFD84D 0%, #FFB703 100%)",
    chip: "bg-yellow text-navy",
    icon: <PenTool className="w-6 h-6 text-navy" />,
    listTitle: "Choisis un exercice",
    listSubtitle: "Tape une leçon pour jouer doucement et apprendre pas à pas.",
    routeBase: "/kid-exercises",
  },
  vocab: {
    type: "vocab",
    title: "Vocabulaire",
    subtitle: "Retourne les cartes magiques",
    badge: "Flashcards",
    accent: "linear-gradient(135deg, #32D4C8 0%, #219EBC 100%)",
    chip: "bg-teal text-white",
    icon: <BookOpen className="w-6 h-6 text-white" />,
    listTitle: "Choisis un vocabulaire",
    listSubtitle: "Découvre les mots de chaque leçon avec de grandes cartes faciles.",
    routeBase: "/kid-vocabulary",
  },
  game: {
    type: "game",
    title: "Jeux",
    subtitle: "Trouve les bonnes paires",
    badge: "Mini aventure",
    accent: "linear-gradient(135deg, #FFB36B 0%, #F77F00 100%)",
    chip: "bg-orange text-white",
    icon: <Gamepad2 className="w-6 h-6 text-navy" />,
    listTitle: "Choisis un jeu",
    listSubtitle: "Joue avec les mots de ta leçon dans une petite aventure rigolote.",
    routeBase: "/kid-games",
  },
};
