import React, { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import ReportBookingModal from "../components/ui/ReportBookingModal";
import {
  ParentCancelBookingModal,
  ParentDeviceTestModal,
  ParentGreetingHeader,
  ParentLevelCard,
  ParentNextCourseCard,
  ParentQuickActionsCard,
  ParentRecentActivityCard,
  ParentSidebar,
  ParentKpiPath,
  buildParentQuickActions,
  buildParentSidebarItems,
  buildParentStats,
  getLevelMeta,
  parentActivityData,
} from "../components/parent-dashboard";
import { ParentSupportCard } from "../components/parent-dashboard/ParentSupportCard";
import { useParentDashboardState } from "../hooks/useParentDashboardState";

const Dashboard: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    user,
    navigate,
    selectedKid,
    stableAvatar,
    stats,
    loading,
    nextBooking,
    canceling,
    showCancelConfirm,
    setShowCancelConfirm,
    showReportModal,
    setShowReportModal,
    showKidModeConfirm,
    pendingKidModeKid,
    showDeviceTest,
    setShowDeviceTest,
    isTestingDevices,
    deviceTestError,
    deviceStatus,
    micLevel,
    videoPreviewRef,
    selectedLevel,
    openKidMode,
    handleConfirmKidModeEntry,
    handleCancelKidModeEntry,
    handleCancelBooking,
    statsSubscriptionId,
  } = useParentDashboardState();

  const kidName = selectedKid?.name || "votre enfant";
  const levelMeta = getLevelMeta(selectedLevel);

  const sidebarItems = useMemo(
    () =>
      buildParentSidebarItems({
        onDashboard: () => navigate("/dashboard"),
        onSchedule: () => navigate("/schedule"),
        onHistory: () => navigate("/history"),
        onActivities: openKidMode,
        onSettings: () => navigate("/settings"),
      }),
    [navigate, openKidMode],
  );

  const quickActions = useMemo(
    () =>
      buildParentQuickActions({
        onSubscription: () => navigate("/subscription"),
        onSchedule: () => navigate("/schedule"),
      }),
    [navigate],
  );

  const dashboardStats = useMemo(
    () =>
      buildParentStats({
        credits: loading ? 0 : stats.credits,
        booked: loading ? 0 : stats.booked,
        finished: loading ? 0 : stats.finished,
        missing: loading ? 0 : stats.missing,
        late: loading ? 0 : stats.late,
      }),
    [loading, stats],
  );

  const handleStatClick = (key: string) => {
    if (key === "credits") {
      if (stats.credits > 0) {
        const url = statsSubscriptionId
          ? `/book-classes?subscriptionId=${statsSubscriptionId}`
          : "/book-classes";
        navigate(url);
      } else {
        navigate("/subscription");
      }
      return;
    }

    if (key === "booked") {
      navigate("/schedule");
      return;
    }

    if (key === "finished" || key === "missing" || key === "late") {
      navigate("/history");
    }
  };

  const openKidProfile = () => {
    if (selectedKid) {
      navigate("/kid-avatar");
      return;
    }
    navigate("/settings");
  };

  const retryDeviceTest = () => {
    setShowDeviceTest(false);
    setTimeout(() => setShowDeviceTest(true), 0);
  };

  const handleSidebarItemClick = (onClick?: () => void) => {
    onClick?.();
    setMobileSidebarOpen(false);
  };

  const mobileSidebarItems = sidebarItems.map((item) => ({
    ...item,
    onClick: () => handleSidebarItemClick(item.onClick),
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5fbff] text-navy">
      <div
        className="pointer-events-none absolute inset-0 opacity-95"
        style={{
          backgroundImage:
            "radial-gradient(circle at 13% 6%, rgba(76,201,240,0.24), transparent 28%), radial-gradient(circle at 88% 4%, rgba(255,214,102,0.24), transparent 20%), radial-gradient(circle at 75% 90%, rgba(64,224,208,0.17), transparent 30%), linear-gradient(180deg, #f8fcff 0%, #eef9ff 52%, #fffdf3 100%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-gold/14 blur-3xl" />

      <div className="relative mx-auto max-w-[1660px] px-4 py-4 md:px-6 md:py-6 xl:px-8 xl:py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <ParentSidebar
                kidName={selectedKid?.name || "Mizy"}
                items={sidebarItems}
              />
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            <div className="flex justify-end xl:hidden">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/90 px-4 py-3 text-sm font-bold text-navy shadow-[0_16px_36px_rgba(32,42,68,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5 text-blue" />
                <span>Menu</span>
              </button>
            </div>

            <ParentGreetingHeader
              parentName={user?.firstName || "Parent"}
              kidName={kidName}
              onKidMode={openKidMode}
              onSubscription={() => navigate("/subscription")}
            />

              <ParentKpiPath
                stats={dashboardStats.map((stat) => ({
                  ...stat,
                  value: loading ? "…" : stat.value,
                }))}
                onStatClick={handleStatClick}
              />

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(370px,0.84fr)]">
              <div className="space-y-6">
                <ParentNextCourseCard
                  kidName={kidName}
                  loading={loading}
                  booking={nextBooking}
                  onOpenSchedule={() => navigate("/schedule")}
                  onEnterKidMode={openKidMode}
                  onReport={() => setShowReportModal(true)}
                  onCancel={() => setShowCancelConfirm(true)}
                  onBook={() =>
                    navigate(`/free-trial-booking?userId=${user?.id}`)
                  }
                  canceling={canceling}
                />

                <ParentRecentActivityCard
                  activities={parentActivityData}
                  onViewAll={() => navigate("/history")}
                />
              </div>

              <div className="space-y-6">
                <ParentLevelCard
                  kidName={kidName}
                  kidLevel={selectedLevel}
                  levelLabel={levelMeta.label}
                  progress={levelMeta.progress}
                  avatarSrc={stableAvatar.src}
                  onAvatarClick={openKidProfile}
                />

                <ParentQuickActionsCard actions={quickActions} />
                <ParentSupportCard onTest={() => setShowDeviceTest(true)} />
              </div>
            </div>
          </main>
        </div>
      </div>

      <ParentCancelBookingModal
        open={showCancelConfirm}
        loading={canceling}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelBooking}
      />

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-navy/42 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(88vw,350px)] overflow-y-auto p-4">
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
            <ParentSidebar
              kidName={selectedKid?.name || "Mizy"}
              items={mobileSidebarItems}
            />
          </div>
        </div>
      ) : null}

      {nextBooking ? (
        <ReportBookingModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          bookingId={nextBooking.id}
          bookingType={nextBooking.displayType}
          userId={user?.id || 0}
          kidId={selectedKid?.id?.toString()}
          teacherId={nextBooking.teacherId}
        />
      ) : null}

      <ConfirmModal
        isOpen={showKidModeConfirm}
        title="Passer en mode enfant ?"
        message={
          pendingKidModeKid
            ? `Le profil de ${pendingKidModeKid.name} va s'ouvrir avec une interface adaptée aux enfants.`
            : "L'interface enfant va s'ouvrir pour choisir le profil à utiliser."
        }
        confirmLabel="Continuer"
        cancelLabel="Rester ici"
        variant="info"
        onConfirm={handleConfirmKidModeEntry}
        onCancel={handleCancelKidModeEntry}
      />

      <ParentDeviceTestModal
        open={showDeviceTest}
        isTesting={isTestingDevices}
        error={deviceTestError}
        deviceStatus={deviceStatus}
        micLevel={micLevel}
        videoPreviewRef={videoPreviewRef}
        onClose={() => setShowDeviceTest(false)}
        onRetry={retryDeviceTest}
      />
    </div>
  );
};

export default Dashboard;
