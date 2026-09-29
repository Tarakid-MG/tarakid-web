import React, { useState } from "react";
import { Menu, Sparkles, Star, X } from "lucide-react";
import {
  KidBottomClassBar,
  KidHeroQuestCard,
  KidPathPanel,
  KidProfileCard,
  KidRewardPanel,
  KidSidebarRail,
  KidTopCard,
  KidTreasureCard,
  KidActionTile,
  WaitingOverlay,
} from "../components/kid-dashboard/KidDashboardSections";
import { kidArt } from "../components/kid-dashboard/kidDashboardUtils";
import { KidProfileSelector } from "../components/kid-mode/KidProfileSelector";
import { useKidDashboardState } from "../hooks/useKidDashboardState";

const KidDashboard: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    user,
    selectedKid,
    isKidMode,
    setShowExitModal,
    navigate,
    loading,
    totalStars,
    isWaiting,
    nextClass,
    nextClassDate,
    canEnter,
    countdown,
    kidLevel,
    heroTitle,
    kidAvatar,
    sidebarItems,
    kidActions,
    starsProgress,
    starsToNextGoal,
    progressPercent,
    handleEnterClassroom,
    handleCancelWaiting,
  } = useKidDashboardState();

  if (!isKidMode || !selectedKid) {
    if ((user?.kids || []).length <= 1) return null;
    return <KidProfileSelector kids={user?.kids || []} />;
  }

  const mobileSidebarItems = sidebarItems.map((item) => ({
    ...item,
    onClick: () => {
      item.onClick();
      setMobileSidebarOpen(false);
    },
  }));

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, rgba(76,201,240,0.34), transparent 26%), radial-gradient(circle at bottom right, rgba(239,191,4,0.18), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(241,252,255,0.92) 40%, rgba(250,255,241,0.95) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/backgrounds/kids-bg.png')] bg-cover bg-center opacity-30" />
      <div className="pointer-events-none absolute top-16 left-[18%] h-24 w-24 rounded-full bg-lightBlue/30 blur-3xl kid-float-slow" />
      <div className="pointer-events-none absolute right-[12%] top-20 h-28 w-28 rounded-full bg-yellow/20 blur-3xl kid-float-fast" />
      <div className="pointer-events-none absolute left-12 bottom-28 h-24 w-24 rounded-full bg-orange/20 blur-3xl kid-float-slow" />

      <div className="relative min-h-screen px-4 py-4 md:px-6 md:py-6 xl:px-8 xl:py-8 ">
        <div className="mx-auto flex max-w-[1360px] items-start gap-5 xl:gap-7">
          <aside className="hidden xl:block w-[228px] shrink-0 self-start 2xl:w-[238px]">
            <div className="sticky top-6">
              <KidSidebarRail
                kidName={selectedKid.name}
                avatarSrc={kidAvatar}
                items={sidebarItems}
                onAvatarClick={() => navigate("/kid-avatar")}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="w-full pb-48 space-y-5 sm:pb-40 md:space-y-6 md:pb-44">
              <div className="flex justify-end xl:hidden">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="inline-flex items-center gap-3 rounded-[1.2rem] border-2 border-white/85 bg-white/92 px-4 py-3 text-sm font-black text-navy shadow-[0_14px_36px_rgba(32,42,68,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-5 w-5 text-blue" />
                  <span>Menu</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <KidTopCard
                  icon={
                    <img
                      src={kidArt.calendar}
                      alt=""
                      className="h-12 w-12 object-contain kid-dance"
                    />
                  }
                  label="Prochain cours"
                  value={loading ? "Chargement..." : nextClassDate}
                  accent="text-blue"
                />
                <KidTopCard
                  icon={
                    <div className="h-14 w-14 rounded-[1.6rem] bg-linear-to-br from-yellow to-gold border-4 border-white shadow-[0_8px_0_rgba(239,191,4,0.38)] flex items-center justify-center kid-wiggle">
                      <Star className="w-7 h-7 text-navy fill-current" />
                    </div>
                  }
                  label="Étoiles gagnées"
                  value={String(totalStars)}
                  accent="text-orange"
                  badge="Bravo !"
                />
                <KidProfileCard
                  kidName={selectedKid.name}
                  kidLevel={kidLevel}
                  avatarSrc={kidAvatar}
                  onExit={() => setShowExitModal(true)}
                  onAvatarClick={() => navigate("/kid-avatar")}
                />
              </div>

              <div className="grid grid-cols-1 items-stretch gap-5 md:gap-6 2xl:grid-cols-[minmax(0,1.18fr)_minmax(430px,1fr)]">
                <KidHeroQuestCard
                  kidName={selectedKid.name}
                  level={kidLevel}
                  lessonTitle={heroTitle}
                  onClick={() => navigate("/lessons")}
                />

                <KidTreasureCard
                  totalStars={totalStars}
                  starsToNextGoal={starsToNextGoal}
                  progressPercent={progressPercent}
                  nextClassDate={nextClassDate}
                />
              </div>

              <section>
                <div className="mb-4 flex items-center gap-3 text-navy">
                  <Sparkles className="w-5 h-5 text-yellow" />
                  <h2 className="text-sm font-black uppercase tracking-[0.25em] text-navy/75">
                    Continue ton aventure
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {kidActions.map((action, index) => (
                    <KidActionTile key={action.title} index={index} {...action} />
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.62fr)_minmax(360px,1fr)]">
                <KidPathPanel starsProgress={Math.max(1, starsProgress)} />
                <KidRewardPanel unlocked={totalStars >= 10} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <KidBottomClassBar
        nextClassDate={nextClassDate}
        lessonTitle={nextClass?.lesson?.title}
        countdown={countdown}
        canEnter={canEnter}
        onEnter={handleEnterClassroom}
      />

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(88vw,340px)] overflow-y-auto p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/92 text-navy shadow-[0_12px_30px_rgba(32,42,68,0.14)]"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <KidSidebarRail
              kidName={selectedKid.name}
              avatarSrc={kidAvatar}
              items={mobileSidebarItems}
              onAvatarClick={() => {
                setMobileSidebarOpen(false);
                navigate("/kid-avatar");
              }}
            />
          </div>
        </div>
      ) : null}

      {isWaiting && <WaitingOverlay onCancel={handleCancelWaiting} />}
    </div>
  );
};

export default KidDashboard;
