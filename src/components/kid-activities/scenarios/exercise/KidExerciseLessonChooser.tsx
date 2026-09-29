import React from "react";
import { PenTool } from "lucide-react";
import {
  KidLessonChooserScene,
  type KidLessonChooserPageTheme,
  type KidLessonChooserScenarioProps,
  type KidLessonChooserTheme,
} from "../common/kidLessonChooserShared";

const exerciseChooserTheme: KidLessonChooserTheme = {
  headerShell:
    "overflow-hidden border-[3px] border-white bg-[radial-gradient(circle_at_top_left,_rgba(255,216,77,0.45),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(239,248,255,0.98)_100%)] shadow-[0_18px_42px_rgba(31,92,153,0.16)]",
  headerBadge:
    "border-yellow/50 bg-white text-orange shadow-[0_10px_24px_rgba(255,183,3,0.18)]",
  headerTitle: "text-navy",
  headerAccent: "bg-linear-to-r from-yellow to-orange",
  headerOrbA: "bg-yellow/35",
  headerOrbB: "bg-lightBlue/25",
  summaryCard:
    "border-[3px] border-white bg-white/95 shadow-[0_14px_30px_rgba(32,42,68,0.10)]",
  summaryText: "text-blue",
  promptPill: "border-yellow/40 bg-white text-orange",
  sectionShell:
    "overflow-hidden border-[3px] border-white bg-[radial-gradient(circle_at_top_right,_rgba(255,216,77,0.18),_transparent_20%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(244,251,255,0.98)_100%)] shadow-[0_18px_42px_rgba(32,42,68,0.12)]",
  sectionGlowA: "bg-yellow/25",
  sectionGlowB: "bg-lightBlue/22",
  sectionPrompt: "border-yellow/45 bg-white text-orange",
  cardUnlocked:
    "border-white bg-white shadow-[0_12px_28px_rgba(32,42,68,0.10)] hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(255,183,3,0.16)]",
  cardLocked:
    "cursor-not-allowed border-slate-100 bg-white/84 opacity-78 shadow-[0_10px_22px_rgba(32,42,68,0.06)]",
  cardArtA: "bg-[#fff7df]",
  cardArtB: "bg-[#eef8ff]",
  actionIdle: "bg-yellow text-navy",
  actionLocked: "bg-lightBlue/20",
  actionLockedIcon: "text-deepBlue",
  lessonPill: "border-white bg-[#fff5cf] text-navy",
  suggestedBadge: "border-white bg-gold text-navy",
  loadingAccent: "text-orange",
};

const exercisePageTheme: KidLessonChooserPageTheme = {
  heroIcon: <PenTool className="h-6 w-6 text-navy" />,
  heroIconShell: "bg-yellow text-navy shadow-[0_12px_22px_rgba(255,183,3,0.25)]",
  pageGlowA: "bg-yellow/28",
  pageGlowB: "bg-lightBlue/22",
  emptyShell:
    "border-[3px] border-white bg-[radial-gradient(circle_at_top_left,_rgba(255,216,77,0.18),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(243,250,255,0.98)_100%)] shadow-[0_16px_40px_rgba(31,92,153,0.14)]",
  emptyBadge: "border-yellow/40 bg-white text-orange",
};

export const KidExerciseLessonChooser: React.FC<KidLessonChooserScenarioProps> = (scenarioProps) => (
  <KidLessonChooserScene
    badgeIcon={<PenTool className="h-5 w-5" />}
    config={scenarioProps.config}
    pageTheme={exercisePageTheme}
    scenarioProps={scenarioProps}
    theme={exerciseChooserTheme}
  />
);
