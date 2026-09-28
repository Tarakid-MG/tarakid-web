import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import ReportBookingModal from "../components/ui/ReportBookingModal";
import {
  ScheduleCalendarView,
  ScheduleHero,
  ScheduleListView,
  ScheduleLoadingState,
  SchedulePageShell,
  ScheduleSuccessAlert,
  ScheduleToolbar,
  addMonths,
  formatMonthYearLabel,
  getMonthStart,
  getScheduleRangeLabel,
  toDateKey,
  toDateTime,
  type ScheduleItem,
} from "../components/schedule";
import { buildParentSidebarItems } from "../components/parent-dashboard";
import { useAuth } from "../context/AuthContextDefinition";
import { useKidMode } from "../hooks/useKidMode";
import { bookingService } from "../services/booking.service";
import { freeTrialService } from "../services/free-trial.service";
import { subscriptionService } from "../services/subscription.service";
import type {
  Booking,
  FreeTrialBooking,
  Kid,
  Subscription,
} from "../types/auth";
import { deriveBookingStatus } from "../utils/bookingStatus";

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedKid, enterKidMode } = useKidMode();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "calendar">(
    "upcoming",
  );
  const [currentMonth, setCurrentMonth] = useState(() =>
    getMonthStart(new Date()),
  );
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null);
  const [allBookings, setAllBookings] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ScheduleItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [reportPending, setReportPending] = useState<ScheduleItem | null>(null);

  const selectedKidId =
    selectedKid?.id ||
    (user?.kids && user.kids.length > 0 ? user.kids[0].id : null);

  const selectedKidObj: Kid | undefined = useMemo(() => {
    if (!user?.kids || !selectedKidId) return undefined;
    return user.kids.find((kid) => kid.id === selectedKidId);
  }, [selectedKidId, user]);

  const sidebarItems = useMemo(
    () =>
      buildParentSidebarItems({
        onDashboard: () => navigate("/dashboard"),
        onSchedule: () => navigate("/schedule"),
        onHistory: () => navigate("/history"),
        onActivities: () => {
          if (selectedKidObj) {
            enterKidMode(selectedKidObj);
            navigate("/kid-dashboard");
          }
        },
        onSettings: () => navigate("/settings"),
        activeItem: "schedule",
      }),
    [enterKidMode, navigate, selectedKidObj],
  );

  const mobileSidebarItems = useMemo(
    () =>
      sidebarItems.map((item) => ({
        ...item,
        onClick: () => {
          item.onClick?.();
          setMobileSidebarOpen(false);
        },
      })),
    [sidebarItems],
  );

  const fetchData = useCallback(async () => {
    if (!user?.id || !selectedKidId) return;

    try {
      const [freeTrialData, regularData, subscriptions] = await Promise.all([
        freeTrialService.getBookings(user.id),
        bookingService.getKidBookings(String(selectedKidId)),
        subscriptionService.getKidSubscriptions(String(selectedKidId)),
      ]);

      const freeTrialFiltered = (freeTrialData as FreeTrialBooking[]).filter(
        (booking) =>
          booking.kidId === selectedKidId &&
          booking.status === "CONFIRMED" &&
          booking.session?.date &&
          booking.session?.startTime &&
          booking.session?.endTime,
      );

      const activeSub = (subscriptions as Subscription[]).find(
        (subscription) => subscription.status === "ACTIVE",
      );
      setActiveSubscription(activeSub || null);

      const combined: ScheduleItem[] = [
        ...freeTrialFiltered.map(
          (booking): ScheduleItem => ({
            id: booking.id,
            type: "FREE_TRIAL",
            date: booking.session!.date,
            start: booking.session!.startTime,
            end: booking.session!.endTime,
            rawStatus: booking.status,
            derivedStatus: deriveBookingStatus({
              status: booking.status,
              date: booking.session!.date,
              start: booking.session!.startTime,
              end: booking.session!.endTime,
              interactionData: booking.interactionData,
              isKidWaiting: booking.isKidWaiting,
              isTeacherInClass: booking.isTeacherInClass,
            }),
            kidId: booking.kidId,
          }),
        ),
        ...(regularData as Booking[])
          .filter(
            (booking) =>
              booking.sessionDate &&
              booking.startTime &&
              booking.endTime &&
              !["CANCELLED", "REPORTED"].includes(booking.status),
          )
          .map(
            (booking): ScheduleItem => ({
              id: booking.id,
              type: "REGULAR",
              date: booking.sessionDate,
              start: booking.startTime,
              end: booking.endTime,
              rawStatus: booking.status,
              derivedStatus: deriveBookingStatus({
                status: booking.status,
                date: booking.sessionDate,
                start: booking.startTime,
                end: booking.endTime,
                interactionData: booking.interactionData,
                isKidWaiting: booking.isKidWaiting,
                isTeacherInClass: booking.isTeacherInClass,
              }),
              kidId: selectedKidId || undefined,
              teacherId: booking.teacherId,
            }),
          ),
      ];

      combined.sort((a, b) => {
        const startA = toDateTime(a.date, a.start).getTime();
        const startB = toDateTime(b.date, b.start).getTime();
        return startA - startB;
      });

      setAllBookings(combined);
    } catch (error) {
      console.error("Failed to fetch schedule data", error);
    } finally {
      setLoading(false);
    }
  }, [selectedKidId, user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const handleJoinClass = useCallback(() => {
    const kid = user?.kids?.find((item) => item.id === selectedKidId);
    if (kid) {
      enterKidMode(kid);
      navigate("/kid-dashboard");
    }
  }, [enterKidMode, navigate, selectedKidId, user?.kids]);

  const handleReserve = useCallback(() => {
    navigate(
      activeSubscription && activeSubscription.remainingCredits > 0
        ? `/book-classes?subscriptionId=${activeSubscription.id}`
        : "/subscription",
    );
  }, [activeSubscription, navigate]);

  const handleCancelAction = useCallback((booking: ScheduleItem) => {
    setActiveMenuId(null);
    setPendingAction(booking);
  }, []);

  const handleConfirm = async () => {
    if (!pendingAction || !user?.id) return;

    setConfirmLoading(true);
    try {
      if (pendingAction.type === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(pendingAction.id), user.id);
      } else {
        await bookingService.cancelBooking(String(pendingAction.id));
      }

      setSuccessMessage("Votre cours a été annulé avec succès.");
      await fetchData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Une erreur est survenue lors de l'action.";
      alert(errorMessage);
    } finally {
      setConfirmLoading(false);
      setPendingAction(null);
    }
  };

  const upcoming = useMemo(() => {
    const now = new Date();
    return allBookings.filter((booking) => toDateTime(booking.date, booking.start) > now);
  }, [allBookings]);

  const displayedBookings = selectedTab === "upcoming" ? upcoming : allBookings;

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    allBookings.forEach((booking) => {
      const items = map.get(booking.date) || [];
      items.push(booking);
      map.set(booking.date, items);
    });
    return map;
  }, [allBookings]);

  const currentMonthLabel = useMemo(
    () => formatMonthYearLabel(currentMonth),
    [currentMonth],
  );

  const scheduleRangeLabel = useMemo(
    () =>
      selectedTab === "calendar"
        ? currentMonthLabel
        : getScheduleRangeLabel(displayedBookings),
    [currentMonthLabel, displayedBookings, selectedTab],
  );

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - startOffset + 1;
      const date = new Date(year, month, dayNumber);
      const dateKey = toDateKey(date);

      return {
        date,
        dateKey,
        inMonth: date.getMonth() === month,
        bookings: bookingsByDate.get(dateKey) || [],
      };
    });
  }, [bookingsByDate, currentMonth]);

  const selectedCalendarBookings = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return bookingsByDate.get(selectedCalendarDate) || [];
  }, [bookingsByDate, selectedCalendarDate]);

  const goPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, -1));
    setSelectedCalendarDate(null);
  }, []);

  const goNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedCalendarDate(null);
  }, []);

  const resetCurrentMonth = useCallback(() => {
    setCurrentMonth(getMonthStart(new Date()));
    setSelectedCalendarDate(null);
  }, []);

  if (loading && allBookings.length === 0) {
    return (
      <ScheduleLoadingState
        kidName={selectedKidObj?.name || "Mizy"}
        sidebarItems={sidebarItems}
      />
    );
  }

  return (
    <SchedulePageShell
      kidName={selectedKidObj?.name || "Enfant"}
      sidebarItems={sidebarItems}
      mobileSidebarItems={mobileSidebarItems}
      mobileSidebarOpen={mobileSidebarOpen}
      onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
    >
      <ConfirmModal
        isOpen={!!pendingAction}
        title="Annuler ce cours ?"
        message="Cette action est irréversible. Si le cours commence dans plus de 5 heures, votre crédit sera remboursé automatiquement."
        confirmLabel="Oui, annuler"
        cancelLabel="Retour"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />

      {successMessage ? (
        <ScheduleSuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      ) : null}

      <section className="space-y-6">
        <ScheduleHero
          kidName={selectedKidObj?.name || "Mizy"}
          avatarSrc={selectedKidObj?.avatarUrl}
          remainingCredits={activeSubscription?.remainingCredits || 0}
          onProfileClick={() => navigate("/settings")}
          onReserveClick={handleReserve}
        />

        <ScheduleToolbar
          selectedTab={selectedTab}
          scheduleRangeLabel={scheduleRangeLabel}
          onSelectTab={setSelectedTab}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onBackDashboard={() => navigate("/dashboard")}
        />

        {selectedTab === "calendar" ? (
          <ScheduleCalendarView
            currentMonthLabel={currentMonthLabel}
            kidName={selectedKidObj?.name || "Mizy"}
            calendarDays={calendarDays}
            selectedCalendarDate={selectedCalendarDate}
            selectedCalendarBookings={selectedCalendarBookings}
            onSelectDate={setSelectedCalendarDate}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onResetMonth={resetCurrentMonth}
            onJoinClass={handleJoinClass}
          />
        ) : (
          <ScheduleListView
            bookings={displayedBookings}
            kidName={selectedKidObj?.name || "Votre enfant"}
            activeMenuId={activeMenuId}
            hasSubscription={!!activeSubscription}
            subscriptionId={activeSubscription?.id}
            onToggleMenu={(id) =>
              setActiveMenuId((prev) => (prev === id ? null : id))
            }
            onReport={(booking) => {
              setActiveMenuId(null);
              setReportPending(booking);
            }}
            onCancel={handleCancelAction}
            onJoinClass={handleJoinClass}
            onSeeAll={() => setSelectedTab("calendar")}
            onReserve={handleReserve}
          />
        )}
      </section>

      {reportPending ? (
        <ReportBookingModal
          isOpen={!!reportPending}
          onClose={() => {
            setReportPending(null);
            fetchData();
          }}
          bookingId={reportPending.id}
          bookingType={reportPending.type}
          userId={user?.id || 0}
          kidId={selectedKidId?.toString()}
          teacherId={reportPending.teacherId}
        />
      ) : null}
    </SchedulePageShell>
  );
};

export default SchedulePage;
