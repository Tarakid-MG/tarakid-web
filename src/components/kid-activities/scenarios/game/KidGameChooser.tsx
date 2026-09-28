import React from "react";
import { Gamepad2 } from "lucide-react";
import {
  KidLessonChooserScene,
  type KidLessonChooserPageTheme,
  type KidLessonChooserScenarioProps,
  type KidLessonChooserTheme,
} from "../common/kidLessonChooserShared";

const gameChooserTheme: KidLessonChooserTheme = {
  headerShell:
    "overflow-hidden border-[3px] border-white bg-[radial-gradient(circle_at_top_left,_rgba(247,127,0,0.30),_transparent_22%),linear-gradient(135deg,_rgba(255,246,238,0.98)_0%,_rgba(255,255,255,0.98)_100%)] shadow-[0_18px_42px_rgba(247,127,0,0.16)]",
  headerBadge:
    "border-orange/40 bg-white text-orange shadow-[0_10px_24px_rgba(247,127,0,0.18)]",
  headerTitle: "text-orange",
  headerAccent: "bg-linear-to-r from-orange to-yellow",
  headerOrbA: "bg-orange/28",
  headerOrbB: "bg-gold/22",
  summaryCard:
    "border-[3px] border-white bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(255,246,236,0.98)_100%)] shadow-[0_14px_30px_rgba(247,127,0,0.12)]",
  summaryText: "text-orange",
  promptPill: "border-orange/40 bg-white text-orange",
  sectionShell:
    "overflow-hidden border-[3px] border-white bg-[radial-gradient(circle_at_top_right,_rgba(255,179,107,0.22),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(255,247,239,0.98)_100%)] shadow-[0_18px_42px_rgba(32,42,68,0.12)]",
  sectionGlowA: "bg-orange/18",
  sectionGlowB: "bg-gold/22",
  sectionPrompt: "border-orange/40 bg-white text-orange",
  cardUnlocked:
    "border-white bg-[linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(255,247,240,1)_100%)] shadow-[0_14px_28px_rgba(247,127,0,0.10)] hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(247,127,0,0.18)]",
  cardLocked:
    "cursor-not-allowed border-slate-100 bg-white/84 opacity-78 shadow-[0_10px_22px_rgba(32,42,68,0.06)]",
  cardArtA: "bg-[#fff0dc]",
  cardArtB: "bg-[#fff7ea]",
  actionIdle: "!bg-orange text-white",
  actionLocked: "!bg-orange/15",
  actionLockedIcon: "text-orange",
  lessonPill: "border-white bg-[#ffe5c8] text-orange",
  suggestedBadge: "border-white bg-orange text-white",
  loadingAccent: "text-orange",
};

const gamePageTheme: KidLessonChooserPageTheme = {
  heroIcon: <Gamepad2 className="h-6 w-6 text-white" />,
  heroIconShell: "bg-orange text-white shadow-[0_12px_22px_rgba(247,127,0,0.24)]",
  pageGlowA: "bg-orange/20",
  pageGlowB: "bg-gold/20",
  emptyShell:
    "border-[3px] border-white bg-[radial-gradient(circle_at_top_left,_rgba(247,127,0,0.16),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(255,247,240,0.98)_100%)] shadow-[0_16px_40px_rgba(247,127,0,0.14)]",
  emptyBadge: "border-orange/40 bg-white text-orange",
};

export const KidGameChooser: React.FC<KidLessonChooserScenarioProps> = (scenarioProps) => (
  <KidLessonChooserScene
    badgeIcon={<Gamepad2 className="h-5 w-5" />}
    config={scenarioProps.config}
    pageTheme={gamePageTheme}
    scenarioProps={scenarioProps}
    theme={gameChooserTheme}
  />
);
