import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  Rocket,
  Sparkles,
  Star,
  Stars,
} from "lucide-react";
import type { Lesson, Unit } from "../../../../services/lesson.service";
import { ParentKidAvatar } from "../../../parent-dashboard";
import type { KidActivityConfig } from "../../activityConfig";
import { getLessonArt, getUnitTheme } from "../../kidActivityHelpers";
import { KidActivityScene } from "../../kidActivityShared";
import {
  kidAccentIconButton3dClass,
  kidGlassPanelClass,
  kidSectionPanelClass,
  kidWhiteIconButton3dClass,
} from "../../kidActivitySharedStyles";

const staggerClasses = ["", "kid-stagger-1", "kid-stagger-2", "kid-stagger-3"];

interface LessonCardItem {
  lesson: Lesson;
  available: boolean;
}

export interface LessonCardUnit extends Omit<Unit, "lessons"> {
  lessons: LessonCardItem[];
}

export interface KidLessonChooserTheme {
  headerShell: string;
  headerBadge: string;
  headerTitle: string;
  headerAccent: string;
  headerOrbA: string;
  headerOrbB: string;
  summaryCard: string;
  summaryText: string;
  promptPill: string;
  sectionShell: string;
  sectionGlowA: string;
  sectionGlowB: string;
  sectionPrompt: string;
  cardUnlocked: string;
  cardLocked: string;
  cardArtA: string;
  cardArtB: string;
  actionIdle: string;
  actionLocked: string;
  actionLockedIcon: string;
  lessonPill: string;
  suggestedBadge: string;
  loadingAccent: string;
}

export interface KidLessonChooserPageTheme {
  heroIcon: React.ReactNode;
  heroIconShell: string;
  pageGlowA: string;
  pageGlowB: string;
  emptyShell: string;
  emptyBadge: string;
}

export interface KidLessonChooserScenarioProps {
  config: KidActivityConfig;
  kidName?: string;
  kidLevel?: string;
  avatarSrc?: string;
  lessonCards: LessonCardUnit[];
  loading: boolean;
  suggestedLessonId: string | null;
  onBack: () => void;
  onSelectLesson: (lesson: Lesson, available: boolean) => void;
}

interface KidLessonChooserHeaderProps {
  config: KidActivityConfig;
  kidName?: string;
  kidLevel?: string;
  avatarSrc?: string;
  onBack: () => void;
  theme: KidLessonChooserTheme;
  badgeIcon: React.ReactNode;
}

export const KidLessonChooserHeader: React.FC<KidLessonChooserHeaderProps> = ({
  config,
  kidName,
  kidLevel,
  avatarSrc,
  onBack,
  theme,
  badgeIcon,
}) => (
  <header className="relative mx-auto max-w-[1220px]">
    <div className={`${kidGlassPanelClass} ${theme.headerShell} relative px-5 py-5 md:px-7 md:py-6`}>
      <div className={`pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full blur-3xl ${theme.headerOrbA}`} />
      <div className={`pointer-events-none absolute -bottom-12 right-10 h-32 w-32 rounded-full blur-3xl ${theme.headerOrbB}`} />
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-2 ${theme.headerAccent}`} />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBack}
            className={`${kidWhiteIconButton3dClass} kid-tap-bounce`}
            aria-label="Retour"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <div
              className={[
                "inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em]",
                theme.headerBadge,
              ].join(" ")}
            >
              {badgeIcon}
              {config.badge}
            </div>
            <h1 className={`mt-3 text-4xl font-black leading-none tracking-tight md:text-5xl ${theme.headerTitle}`}>
              {config.listTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-bold text-navy/62 md:text-lg">
              {config.listSubtitle}
            </p>
            <div className={`mt-4 h-2 w-24 rounded-full ${theme.headerAccent}`} />
          </div>
        </div>

        <div className={`rounded-[2.2rem] px-5 py-4 ${theme.summaryCard}`}>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-[3px] border-slate-100 bg-white shadow-[0_10px_22px_rgba(32,42,68,0.10)]">
              <ParentKidAvatar
                kidName={kidName || "Kid"}
                avatarSrc={avatarSrc}
                className="h-full w-full"
                fallbackClassName="bg-lightBlue/10 text-xl font-black"
              />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-navy/45">
                {kidName || "Kid"}
              </div>
              <div className="mt-1 text-2xl font-black text-navy">Niveau {kidLevel || "L0"}</div>
              <div className={`mt-1 text-sm font-bold ${theme.summaryText}`}>Clique sur une leçon</div>
              <div
                className={[
                  "mt-3 inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]",
                  theme.promptPill,
                ].join(" ")}
              >
                <Rocket className="h-3.5 w-3.5" />
                {config.title}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export const KidLessonChooserLoading: React.FC<{
  config: KidActivityConfig;
  theme: KidLessonChooserTheme;
}> = ({ config, theme }) => (
  <div className={`${kidSectionPanelClass} ${theme.sectionShell} relative p-8 text-center`}>
    <div className={`pointer-events-none absolute left-6 top-6 h-24 w-24 rounded-full blur-3xl ${theme.sectionGlowA}`} />
    <div className={`pointer-events-none absolute bottom-6 right-6 h-24 w-24 rounded-full blur-3xl ${theme.sectionGlowB}`} />
    <div className="relative">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-slate-100 bg-white shadow-[0_12px_24px_rgba(32,42,68,0.10)]">
        <Sparkles className={`h-8 w-8 animate-pulse ${theme.loadingAccent}`} />
      </div>
      <p className="mt-5 text-2xl font-black text-navy">
        Chargement des {config.title.toLowerCase()}...
      </p>
    </div>
  </div>
);

export const KidLessonChooserUnitSection: React.FC<{
  config: KidActivityConfig;
  suggestedLessonId: string | null;
  theme: KidLessonChooserTheme;
  unit: LessonCardUnit;
  onSelectLesson: (lesson: Lesson, available: boolean) => void;
}> = ({ config, suggestedLessonId, theme, unit, onSelectLesson }) => {
  const unitTheme = getUnitTheme(unit.order);
  const unlockedCount = unit.lessons.filter(({ lesson, available }) => !lesson.isLocked && available).length;

  return (
    <section className={`${kidSectionPanelClass} ${theme.sectionShell} relative p-5 md:p-7`}>
      <div className={`pointer-events-none absolute -left-8 top-10 h-28 w-28 rounded-full blur-3xl ${theme.sectionGlowA}`} />
      <div className={`pointer-events-none absolute -right-8 bottom-8 h-28 w-28 rounded-full blur-3xl ${theme.sectionGlowB}`} />
      <div className="relative mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`inline-flex rounded-[1.2rem] border-2 border-white px-4 py-3 text-lg font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(32,42,68,0.12)] ${unitTheme.tag}`}
          >
            Unit {unit.order}
          </div>
          <div>
            <h2 className="text-2xl font-black text-navy md:text-3xl">{unit.title}</h2>
            <p className="mt-1 text-sm font-bold text-navy/50">
              {unlockedCount} leçon{unlockedCount > 1 ? "s" : ""} disponible{unlockedCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-3 text-sm font-black shadow-[0_10px_22px_rgba(32,42,68,0.08)] ${theme.sectionPrompt}`}>
          <Stars className="h-4 w-4 fill-current" />
          Choisis ta leçon
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
        {unit.lessons.map(({ lesson, available }, cardIndex) => {
          const locked = lesson.isLocked || !available;
          const isSuggested = lesson.id === suggestedLessonId;

          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onSelectLesson(lesson, available)}
              disabled={locked}
              className={[
                "kid-pop-in group relative overflow-hidden rounded-4xl border-[3px] p-4 text-left transition-all",
                staggerClasses[cardIndex % staggerClasses.length],
                locked ? theme.cardLocked : `${theme.cardUnlocked} kid-tap-bounce hover:-translate-y-1`,
              ].join(" ")}
            >
              <div className={`pointer-events-none absolute inset-x-4 top-0 h-1.5 rounded-b-full ${theme.headerAccent} opacity-90`} />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-5">
                  <div
                    className={[
                      "flex h-28 w-28 shrink-0 items-center justify-center rounded-[1.75rem] border-[3px] border-slate-100 shadow-[0_10px_22px_rgba(32,42,68,0.08)] md:h-30 md:w-30",
                      unit.order === 1 ? theme.cardArtA : theme.cardArtB,
                    ].join(" ")}
                  >
                    <img
                      src={getLessonArt(unit.order, lesson.order)}
                      alt=""
                      className={[
                        "h-24 w-24 object-contain drop-shadow-[0_16px_24px_rgba(32,42,68,0.18)] md:h-26 md:w-26",
                        locked ? "" : "kid-dance",
                      ].join(" ")}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={[
                        "inline-flex rounded-full border-2 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]",
                        theme.lessonPill,
                      ].join(" ")}
                    >
                      {config.title} {lesson.order}
                    </div>
                    <h3 className={["mt-3 text-xl font-black leading-tight md:text-2xl", locked ? "text-navy/62" : "text-navy"].join(" ")}>
                      {lesson.title}
                    </h3>
                    <p className="mt-2 text-sm font-bold text-navy/55">
                      {locked
                        ? available
                          ? "Cette leçon est encore verrouillée."
                          : "Cette activité sera bientôt prête."
                        : "Appuie pour commencer cette activité."}
                    </p>

                    {isSuggested && !locked ? (
                      <div
                        className={[
                          "kid-wiggle mt-4 inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] shadow-sm",
                          theme.suggestedBadge,
                        ].join(" ")}
                      >
                        <Star className="kid-sparkle h-3.5 w-3.5 fill-current" />
                        Recommandée
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  className={[
                    kidAccentIconButton3dClass,
                    locked ? theme.actionLocked : theme.actionIdle,
                  ].join(" ")}
                >
                  {locked ? (
                    <Lock className={`h-5 w-5 ${theme.actionLockedIcon}`} />
                  ) : (
                    <ChevronRight className="h-7 w-7" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const KidLessonChooserEmptyState: React.FC<{
  config: KidActivityConfig;
  pageTheme: KidLessonChooserPageTheme;
}> = ({ config, pageTheme }) => (
  <div className={`relative overflow-hidden rounded-[2.8rem] p-8 text-center ${pageTheme.emptyShell}`}>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-linear-to-r from-white via-white to-white/20" />
    <div className="relative">
      <div className={`mx-auto flex h-18 w-18 items-center justify-center rounded-[1.6rem] border-[3px] border-white ${pageTheme.heroIconShell}`}>
        {pageTheme.heroIcon}
      </div>
      <div className={`mt-4 inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${pageTheme.emptyBadge}`}>
        <Sparkles className="h-4 w-4" />
        {config.title}
      </div>
      <p className="mt-5 text-2xl font-black text-navy">Aucune leçon disponible pour le moment.</p>
      <p className="mt-2 font-bold text-navy/55">Reviens bientôt pour une nouvelle aventure !</p>
    </div>
  </div>
);

export const KidLessonChooserScene: React.FC<{
  badgeIcon: React.ReactNode;
  config: KidActivityConfig;
  pageTheme: KidLessonChooserPageTheme;
  scenarioProps: KidLessonChooserScenarioProps;
  theme: KidLessonChooserTheme;
}> = ({ badgeIcon, config, pageTheme, scenarioProps, theme }) => {
  const {
    avatarSrc,
    kidLevel,
    kidName,
    lessonCards,
    loading,
    onBack,
    onSelectLesson,
    suggestedLessonId,
  } = scenarioProps;

  return (
    <KidActivityScene padded variant="chooser">
      <div className="relative mx-auto max-w-[1220px]">
        <div className={`pointer-events-none absolute -left-18 top-28 h-40 w-40 rounded-full blur-3xl ${pageTheme.pageGlowA}`} />
        <div className={`pointer-events-none absolute -right-12 top-64 h-36 w-36 rounded-full blur-3xl ${pageTheme.pageGlowB}`} />
        <KidLessonChooserHeader
          config={config}
          kidName={kidName}
          kidLevel={kidLevel}
          avatarSrc={avatarSrc}
          onBack={onBack}
          theme={theme}
          badgeIcon={badgeIcon}
        />

        <main className="mt-7 space-y-7">
          {loading ? (
            <KidLessonChooserLoading config={config} theme={theme} />
          ) : lessonCards.length > 0 ? (
            lessonCards.map((unit) => (
              <KidLessonChooserUnitSection
                key={unit.id}
                config={config}
                suggestedLessonId={suggestedLessonId}
                theme={theme}
                unit={unit}
                onSelectLesson={onSelectLesson}
              />
            ))
          ) : (
            <KidLessonChooserEmptyState config={config} pageTheme={pageTheme} />
          )}
        </main>
      </div>
    </KidActivityScene>
  );
};
