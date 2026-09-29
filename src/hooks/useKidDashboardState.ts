import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Gamepad2,
  Home,
  LogOut,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { useKidMode } from "../hooks/useKidMode";
import { bookingService } from "../services/booking.service";
import { freeTrialService } from "../services/free-trial.service";
import { kidService } from "../services/kid.service";
import { mergeClassroomInteractionData } from "../utils/bookingStatus";
import {
  formatGateCountdown,
  formatNextClassFR,
  getAvatarIdentity,
  kidArt,
  parseSafeDateTime,
  type KidAction,
  type SidebarItem,
  type UnifiedBooking,
} from "../components/kid-dashboard/kidDashboardUtils";

export function useKidDashboardState() {
  const { user } = useAuth();
  const {
    selectedKid,
    isKidMode,
    setShowExitModal,
    exitKidMode,
    enterKidMode,
    updateSelectedKid,
  } = useKidMode();
  const navigate = useNavigate();
  const singleKidAutoEnteredRef = useRef(false);

  const prevIsKidMode = useRef(isKidMode);
  useEffect(() => {
    if (prevIsKidMode.current && !isKidMode) {
      navigate("/dashboard");
    }
    prevIsKidMode.current = isKidMode;
  }, [isKidMode, navigate]);

  useEffect(() => {
    if (isKidMode || singleKidAutoEnteredRef.current) return;
    if (sessionStorage.getItem("kidModeJustExited") === "true") {
      sessionStorage.removeItem("kidModeJustExited");
      return;
    }

    const kids = user?.kids || [];
    if (kids.length === 1) {
      singleKidAutoEnteredRef.current = true;
      enterKidMode(kids[0]);
    }
  }, [enterKidMode, isKidMode, user?.kids]);

  const [nextClass, setNextClass] = useState<UnifiedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(selectedKid?.stars || 0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [stableAvatar, setStableAvatar] = useState(() => ({
    src: selectedKid?.avatarUrl || "",
    identity: getAvatarIdentity(selectedKid?.avatarUrl),
    kidId: selectedKid?.id || "",
  }));

  useEffect(() => {
    setStableAvatar((prev) => {
      const nextKidId = selectedKid?.id || "";
      const nextSrc = selectedKid?.avatarUrl || "";
      const nextIdentity = getAvatarIdentity(nextSrc);

      if (prev.kidId !== nextKidId) {
        return { src: nextSrc, identity: nextIdentity, kidId: nextKidId };
      }

      if (!prev.src && nextSrc) {
        return { src: nextSrc, identity: nextIdentity, kidId: nextKidId };
      }

      if (nextIdentity && nextIdentity !== prev.identity) {
        return { src: nextSrc, identity: nextIdentity, kidId: nextKidId };
      }

      return prev;
    });
  }, [selectedKid?.id, selectedKid?.avatarUrl]);

  useEffect(() => {
    if (user?.kids && selectedKid) {
      const latestKid = user.kids.find((kid) => kid.id === selectedKid.id);
      if (latestKid) {
        const mergedKid = {
          ...selectedKid,
          ...latestKid,
          avatarUrl: latestKid.avatarUrl || selectedKid.avatarUrl,
          stars: latestKid.stars ?? selectedKid.stars,
        };

        if (JSON.stringify(mergedKid) !== JSON.stringify(selectedKid)) {
          updateSelectedKid(mergedKid);
        }
      } else {
        exitKidMode();
      }
    }
  }, [exitKidMode, selectedKid, updateSelectedKid, user?.kids]);

  useEffect(() => {
    const fetchNextClass = async () => {
      if (!selectedKid || !user?.id) return;

      try {
        const [freeTrialBookings, regularBookings] = await Promise.all([
          freeTrialService.getUserBookings(user.id),
          bookingService.getKidBookings(selectedKid.id.toString()),
        ]);

        const kidFreeTrials = freeTrialBookings
          .filter(
            (booking) =>
              String(booking.kidId) === String(selectedKid.id) &&
              !["CANCELLED", "REPORTED", "COMPLETED"].includes(booking.status),
          )
          .map((booking) => ({
            ...booking,
            id: `trial_${booking.id}`,
            date: booking.session?.date,
            startTime: booking.session?.startTime,
            type: "FREE_TRIAL" as const,
          }));

        const kidRegulars = regularBookings
          .filter(
            (booking) =>
              !["CANCELLED", "REPORTED", "COMPLETED"].includes(booking.status),
          )
          .map((booking) => ({
            ...booking,
            date: booking.sessionDate,
            startTime: booking.startTime,
            type: "REGULAR" as const,
          }));

        const allAvailable = [...kidFreeTrials, ...kidRegulars]
          .filter((booking) => booking.date && booking.startTime)
          .sort((left, right) => {
            const leftTime = parseSafeDateTime(
              left.date as string,
              left.startTime as string,
            ).getTime();
            const rightTime = parseSafeDateTime(
              right.date as string,
              right.startTime as string,
            ).getTime();
            return leftTime - rightTime;
          }) as UnifiedBooking[];

        const now = Date.now();
        const current = allAvailable.find((booking) => {
          const startMs = parseSafeDateTime(booking.date, booking.startTime).getTime();
          return startMs <= now && startMs > now - 30 * 60 * 1000;
        });
        const next = allAvailable.find((booking) => {
          const startMs = parseSafeDateTime(booking.date, booking.startTime).getTime();
          return startMs > now;
        });

        setNextClass(current || next || null);
      } catch (error) {
        console.error("Failed to fetch next class for kid dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedKid) {
      fetchNextClass();
      const interval = setInterval(fetchNextClass, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedKid, user?.id]);

  useEffect(() => {
    if (!selectedKid?.id) return;

    let cancelled = false;
    setTotalStars(selectedKid.stars || 0);

    kidService
      .getKid(selectedKid.id.toString())
      .then((kid) => {
        if (cancelled) return;

        const stars = kid.stars || 0;
        const mergedKid = {
          ...selectedKid,
          ...kid,
          stars,
          avatarUrl: kid.avatarUrl || selectedKid.avatarUrl,
        };

        setTotalStars(stars);

        if (JSON.stringify(mergedKid) !== JSON.stringify(selectedKid)) {
          updateSelectedKid(mergedKid);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch kid stars", error);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedKid, updateSelectedKid]);

  useEffect(() => {
    if (nextClass && nextClass.isKidWaiting && !nextClass.isKidAccepted) {
      setIsWaiting(true);
    } else {
      setIsWaiting(false);
    }
  }, [nextClass]);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (isWaiting && nextClass) {
      pollInterval = setInterval(async () => {
        try {
          const status =
            nextClass.type === "REGULAR"
              ? await bookingService.getClassroomStatus(nextClass.id.toString())
              : await freeTrialService.getClassroomStatus(
                  Number(String(nextClass.id).replace("trial_", "")),
                );

          if (status.isKidAccepted) {
            clearInterval(pollInterval!);
            navigate(`/classroom/${nextClass.id}`);
          }
        } catch (error) {
          console.error("Polling acceptance failed", error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isWaiting, navigate, nextClass]);

  const handleEnterClassroom = async () => {
    if (!nextClass) return;

    try {
      const interactionData = mergeClassroomInteractionData(
        nextClass.interactionData,
        { kidFirstEnteredAt: new Date().toISOString() },
      );

      if (nextClass.type === "REGULAR") {
        await bookingService.updateInteractionData(
          nextClass.id.toString(),
          interactionData,
        );
        await bookingService.updateWaitingStatus(nextClass.id.toString(), true);
      } else {
        const trialId = Number(String(nextClass.id).replace("trial_", ""));
        await freeTrialService.updateInteractionData(trialId, interactionData);
        await freeTrialService.updateWaitingStatus(trialId, true);
      }

      setIsWaiting(true);
    } catch (error) {
      console.error("Failed to signal waiting status", error);
      alert("Erreur lors de l'entrée en classe. Veuillez réessayer.");
    }
  };

  const handleCancelWaiting = async () => {
    if (!nextClass) return;

    try {
      if (nextClass.type === "REGULAR") {
        await bookingService.updateWaitingStatus(nextClass.id.toString(), false);
      } else {
        await freeTrialService.updateWaitingStatus(
          Number(String(nextClass.id).replace("trial_", "")),
          false,
        );
      }
      setIsWaiting(false);
    } catch (error) {
      console.error("Failed to cancel waiting", error);
    }
  };

  const nextClassDate = useMemo(
    () =>
      nextClass
        ? formatNextClassFR(nextClass.date, nextClass.startTime)
        : "Aucun cours prévu",
    [nextClass],
  );

  const entryWindowMs = 5 * 60 * 1000;
  const computeGate = useCallback(() => {
    if (!nextClass?.date || !nextClass?.startTime) {
      return { canEnter: false, countdown: null as string | null };
    }

    const startMs = parseSafeDateTime(nextClass.date, nextClass.startTime).getTime();
    const windowOpens = startMs - entryWindowMs;
    const diffToWindow = windowOpens - Date.now();

    if (diffToWindow <= 0) {
      return { canEnter: true, countdown: null };
    }

    return { canEnter: false, countdown: formatGateCountdown(diffToWindow) };
  }, [nextClass]);

  const [gate, setGate] = useState(() => computeGate());
  const gateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setGate(computeGate());
    gateIntervalRef.current = setInterval(() => {
      setGate(computeGate());
    }, 1000);

    return () => {
      if (gateIntervalRef.current) clearInterval(gateIntervalRef.current);
    };
  }, [computeGate]);

  const starsProgress = totalStars % 10;
  const starsToNextGoal = starsProgress === 0 ? 10 : 10 - starsProgress;
  const progressPercent =
    starsProgress === 0 && totalStars > 0 ? 100 : starsProgress * 10;

  const sidebarItems: SidebarItem[] = [
    { label: "Accueil", icon: Home, tone: "blue", active: true, onClick: () => navigate("/kid-dashboard") },
    { label: "Leçons", icon: BookOpen, tone: "turquoise", onClick: () => navigate("/lessons") },
    { label: "Jeux", icon: Gamepad2, tone: "yellow", onClick: () => navigate("/kid-games") },
    { label: "Mon profil", icon: UserRound, tone: "orange", onClick: () => navigate("/kid-avatar") },
    { label: "Sortir", icon: LogOut, tone: "slate", onClick: () => setShowExitModal(true) },
  ];

  const kidActions: KidAction[] = [
    {
      title: "EXERCICES",
      subtitle: "Défis rigolos",
      tone: "yellow",
      art: kidArt.book,
      onClick: () => navigate("/kid-exercises"),
    },
    {
      title: "VOCAB",
      subtitle: "Mots magiques",
      tone: "turquoise",
      art: kidArt.blocks,
      onClick: () => navigate("/kid-vocabulary"),
    },
    {
      title: "VIDÉOS",
      subtitle: "Regarde & répète",
      tone: "orange",
      art: kidArt.clapperboard,
      onClick: () => {},
      comingSoon: true,
    },
    {
      title: "JEUX",
      subtitle: "Mini aventures",
      tone: "blue",
      art: kidArt.gamepad,
      onClick: () => navigate("/kid-games"),
    },
  ];

  return {
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
    canEnter: gate.canEnter,
    countdown: gate.countdown,
    kidLevel: selectedKid?.level || "L0",
    heroTitle: nextClass?.lesson?.title || "Magic Academy",
    kidAvatar: stableAvatar.src,
    sidebarItems,
    kidActions,
    starsProgress,
    starsToNextGoal,
    progressPercent,
    handleEnterClassroom,
    handleCancelWaiting,
  };
}
