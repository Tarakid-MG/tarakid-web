import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextDefinition";
import { useKidMode } from "./useKidMode";
import { bookingService } from "../services/booking.service";
import { freeTrialService } from "../services/free-trial.service";
import { kidService } from "../services/kid.service";
import { subscriptionService } from "../services/subscription.service";
import type { Booking, FreeTrialBooking, Kid, Subscription } from "../types/auth";
import { getAvatarIdentity } from "../components/kid-dashboard/kidDashboardUtils";
import { deriveBookingStatus, toBookingStatusSource } from "../utils/bookingStatus";
import type { UnifiedBooking } from "../components/parent-dashboard/parentDashboardUtils";

type DashboardStats = {
  credits: number;
  booked: number;
  finished: number;
  missing: number;
  late: number;
  activeSubId: string | null;
};

export function useParentDashboardState() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const {
    enterKidMode,
    exitKidMode,
    selectedKid,
    updateSelectedKid,
  } = useKidMode();

  const [nextBooking, setNextBooking] = useState<UnifiedBooking | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    credits: 0,
    booked: 0,
    finished: 0,
    missing: 0,
    late: 0,
    activeSubId: null,
  });
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showKidModeConfirm, setShowKidModeConfirm] = useState(false);
  const [pendingKidModeKid, setPendingKidModeKid] = useState<Kid | null>(null);
  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const [isTestingDevices, setIsTestingDevices] = useState(false);
  const [deviceTestError, setDeviceTestError] = useState("");
  const [deviceStatus, setDeviceStatus] = useState({
    camera: false,
    microphone: false,
    browser: true,
  });
  const [micLevel, setMicLevel] = useState(0);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const deviceStreamRef = useRef<MediaStream | null>(null);

  const displayKid = selectedKid || user?.kids?.[0] || null;
  const [stableAvatar, setStableAvatar] = useState(() => ({
    src: displayKid?.avatarUrl || "",
    identity: getAvatarIdentity(displayKid?.avatarUrl),
    kidId: displayKid?.id || "",
  }));

  useEffect(() => {
    setStableAvatar((prev) => {
      const nextKidId = displayKid?.id || "";
      const nextSrc = displayKid?.avatarUrl || "";
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
  }, [displayKid?.id, displayKid?.avatarUrl]);

  const requestKidModeEntry = (kid?: Kid | null) => {
    setPendingKidModeKid(kid || null);
    setShowKidModeConfirm(true);
  };

  const handleConfirmKidModeEntry = () => {
    if (pendingKidModeKid) {
      enterKidMode(pendingKidModeKid);
    }
    setShowKidModeConfirm(false);
    setPendingKidModeKid(null);
    navigate("/kid-dashboard");
  };

  const handleCancelKidModeEntry = () => {
    setShowKidModeConfirm(false);
    setPendingKidModeKid(null);
  };

  const openKidMode = () => {
    if (displayKid) {
      requestKidModeEntry(displayKid);
      return;
    }
    if (user?.kids?.length === 1) {
      requestKidModeEntry(user.kids[0]);
      return;
    }
    requestKidModeEntry(null);
  };

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationFrameId = 0;

    const stopStream = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext) void audioContext.close();
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
      }
      if (deviceStreamRef.current) {
        deviceStreamRef.current.getTracks().forEach((track) => track.stop());
        deviceStreamRef.current = null;
      }
      setMicLevel(0);
    };

    if (!showDeviceTest) {
      stopStream();
      setDeviceTestError("");
      return;
    }

    const runDeviceTest = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setDeviceStatus({
          camera: false,
          microphone: false,
          browser: false,
        });
        setDeviceTestError(
          "Votre navigateur ne permet pas de tester la caméra et le micro ici.",
        );
        return;
      }

      setIsTestingDevices(true);
      setDeviceTestError("");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        deviceStreamRef.current = stream;
        setDeviceStatus({
          camera: stream.getVideoTracks().length > 0,
          microphone: stream.getAudioTracks().length > 0,
          browser: true,
        });

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          void videoPreviewRef.current.play().catch(() => {});
        }

        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(data);
          const average =
            data.reduce((sum, value) => sum + value, 0) / data.length;
          setMicLevel(Math.min(100, Math.round((average / 255) * 100)));
          animationFrameId = requestAnimationFrame(updateMeter);
        };

        updateMeter();
      } catch (error) {
        console.error("Device test failed", error);
        setDeviceStatus({
          camera: false,
          microphone: false,
          browser: true,
        });
        setDeviceTestError(
          "Impossible d'accéder à la caméra ou au micro. Vérifiez les permissions du navigateur.",
        );
      } finally {
        setIsTestingDevices(false);
      }
    };

    void runDeviceTest();

    return () => {
      stopStream();
    };
  }, [showDeviceTest]);

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
    if (user?.kids && user.kids.length > 0 && !selectedKid) {
      updateSelectedKid(user.kids[0]);
    }
  }, [selectedKid, updateSelectedKid, user?.kids]);

  useEffect(() => {
    if (!selectedKid?.id) return;

    kidService
      .getKid(selectedKid.id.toString())
      .then((kid) => {
        const mergedKid = {
          ...selectedKid,
          ...kid,
          level: "level" in kid && kid.level ? kid.level : selectedKid.level,
          stars: kid.stars ?? selectedKid.stars,
          avatarUrl: kid.avatarUrl || selectedKid.avatarUrl,
        };

        if (JSON.stringify(mergedKid) !== JSON.stringify(selectedKid)) {
          updateSelectedKid(mergedKid);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch latest kid progress", error);
      });
  }, [selectedKid, updateSelectedKid]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [trialBookings, regularBookings, kidSubscriptions]: [
          FreeTrialBooking[],
          Booking[],
          Subscription[],
        ] = await Promise.all([
          freeTrialService.getUserBookings(user.id),
          displayKid
            ? bookingService.getKidBookings(displayKid.id.toString())
            : Promise.resolve([]),
          displayKid
            ? subscriptionService.getKidSubscriptions(displayKid.id.toString())
            : Promise.resolve([]),
        ]);

        const kidTrials = displayKid
          ? trialBookings.filter((booking) => booking.kidId === displayKid.id)
          : trialBookings;

        const unifiedUpcoming = [
          ...kidTrials
            .filter((booking) => booking.status === "CONFIRMED" && booking.session)
            .map((booking) => ({
              ...booking,
              displayType: "FREE_TRIAL" as const,
              date: booking.session!.date,
              start: booking.session!.startTime,
              end: booking.session!.endTime,
            })),
          ...regularBookings
            .filter((booking) => booking.status === "SCHEDULED")
            .map((booking) => ({
              ...booking,
              displayType: "REGULAR" as const,
              date: booking.sessionDate,
              start: booking.startTime,
              end: booking.endTime,
            })),
        ]
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start}`);
            const dateB = new Date(`${b.date}T${b.start}`);
            return dateA.getTime() - dateB.getTime();
          })
          .filter((booking) => new Date(`${booking.date}T${booking.start}`) > new Date());

        setNextBooking(unifiedUpcoming[0] || null);

        let credits = 0;
        let booked = 0;
        let missing = 0;
        let late = 0;
        let finished = 0;
        const now = new Date();

        if (displayKid) {
          const allBookings = [...regularBookings, ...kidTrials];

          allBookings.forEach((booking) => {
            const source = toBookingStatusSource(booking);
            if (!source) return;

            const startMs = new Date(`${source.date}T${source.start}`).getTime();
            if (startMs > now.getTime()) {
              const isUpcomingStatus =
                booking.status === "SCHEDULED" || booking.status === "CONFIRMED";
              if (isUpcomingStatus) booked += 1;
              return;
            }

            switch (deriveBookingStatus(source, now.getTime())) {
              case "COMPLETED":
                finished += 1;
                break;
              case "MISSING":
                missing += 1;
                break;
              case "LATE":
                late += 1;
                break;
              default:
                break;
            }
          });

          const activeSub = kidSubscriptions.find((subscription) => subscription.status === "ACTIVE");
          credits = activeSub ? activeSub.remainingCredits : (user.credits ?? 0);

          setStats({
            credits,
            booked,
            finished,
            missing,
            late,
            activeSubId: activeSub?.id || null,
          });
        } else {
          credits = user.credits ?? 0;
          setStats({
            credits,
            booked,
            finished,
            missing,
            late,
            activeSubId: null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [displayKid, user]);

  const handleCancelBooking = async () => {
    if (!nextBooking || !user?.id) return;

    setCanceling(true);
    try {
      if (nextBooking.displayType === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(nextBooking.id), user.id);
      } else {
        await bookingService.cancelBooking(String(nextBooking.id));
      }
      await refreshProfile();
      setNextBooking(null);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Erreur lors de l'annulation de la réservation");
    } finally {
      setCanceling(false);
    }
  };

  const selectedLevel = useMemo(
    () => displayKid?.level || "L0",
    [displayKid?.level],
  );

  return {
    user,
    navigate,
    selectedKid: displayKid,
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
    requestKidModeEntry,
    handleConfirmKidModeEntry,
    handleCancelKidModeEntry,
    handleCancelBooking,
    setShowReportModalOpen: setShowReportModal,
    setShowKidModeConfirm,
    refreshProfile,
    statsSubscriptionId: stats.activeSubId,
  };
}
