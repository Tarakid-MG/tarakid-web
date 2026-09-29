import React from "react";
import { BookOpen } from "lucide-react";
import {
  KidLessonChooserScene,
  type KidLessonChooserPageTheme,
  type KidLessonChooserScenarioProps,
  type KidLessonChooserTheme,
} from "../common/kidLessonChooserShared";

const vocabChooserTheme: KidLessonChooserTheme = {
  headerShell:
    "overflow-hidden border-[3px] border-white bg-[radial-gradient(circle_at_top_right,_rgba(50,212,200,0.34),_transparent_24%),linear-gradient(135deg,_rgba(239,255,252,0.98)_0%,_rgba(255,255,255,0.98)_100%)] shadow-[0_18px_42px_rgba(33,158,188,0.16)]",
  headerBadge:
    "border-turquoise/40 bg-white text-teal shadow-[0_10px_24px_rgba(50,212,200,0.16)]",
  headerTitle: "text-teal",
  headerAccent: "bg-linear-to-r from-teal to-turquoise",
  headerOrbA: "bg-turquoise/30",
  headerOrbB: "bg-teal/18",
  summaryCard:
    "border-[3px] border-white bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(236,255,251,0.98)_100%)] shadow-[0_14px_30px_rgba(33,158,188,0.12)]",
  summaryText: "text-teal",
  promptPill: "border-turquoise/40 bg-white text-teal",
  sectionShell:
    "overflow-hidden border-[3px] border-white bg-[radial-gradient(circle_at_bottom_left,_rgba(50,212,200,0.18),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(240,255,252,0.98)_100%)] shadow-[0_18px_42px_rgba(32,42,68,0.10)]",
  sectionGlowA: "bg-turquoise/20",
  sectionGlowB: "bg-teal/14",
  sectionPrompt: "border-turquoise/40 bg-white text-teal",
  cardUnlocked:
    "border-white bg-[linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(241,255,252,1)_100%)] shadow-[0_14px_28px_rgba(33,158,188,0.10)] hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(50,212,200,0.18)]",
  cardLocked:
    "cursor-not-allowed border-slate-100 bg-white/84 opacity-78 shadow-[0_10px_22px_rgba(32,42,68,0.06)]",
  cardArtA: "bg-[#e8fffb]",
  cardArtB: "bg-[#effffd]",
  actionIdle: "bg-turquoise text-teal",
  actionLocked: "bg-turquoise/18",
  actionLockedIcon: "text-teal",
  lessonPill: "border-white bg-[#dffcf8] text-teal",
  suggestedBadge: "border-white bg-teal text-white",
  loadingAccent: "text-teal",
};

const vocabPageTheme: KidLessonChooserPageTheme = {
  heroIcon: <BookOpen className="h-6 w-6 text-white" />,
  heroIconShell: "bg-teal text-white shadow-[0_12px_22px_rgba(50,212,200,0.22)]",
  pageGlowA: "bg-turquoise/24",
  pageGlowB: "bg-teal/18",
  emptyShell:
    "border-[3px] border-white bg-[radial-gradient(circle_at_top_right,_rgba(50,212,200,0.16),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(239,255,252,0.98)_100%)] shadow-[0_16px_40px_rgba(33,158,188,0.12)]",
  emptyBadge: "border-turquoise/40 bg-white text-teal",
};

export const KidVocabLessonChooser: React.FC<KidLessonChooserScenarioProps> = (scenarioProps) => (
  <KidLessonChooserScene
    badgeIcon={<BookOpen className="h-5 w-5" />}
    config={scenarioProps.config}
    pageTheme={vocabPageTheme}
    scenarioProps={scenarioProps}
    theme={vocabChooserTheme}
  />
);
