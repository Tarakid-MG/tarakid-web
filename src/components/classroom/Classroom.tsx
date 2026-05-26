import React, { useState, useRef, useCallback, useEffect } from "react";
import { VideoOff } from "lucide-react";
import { useAuth } from "../../context/AuthContextDefinition";
import lessonService from "../../services/lesson.service";

// Hooks
import { useAgora } from "./hooks/useAgora";
import { useSocket } from "./hooks/useSocket";
import { useTimer } from "./hooks/useTimer";
import { useBookingLesson } from "./hooks/useBookingLesson";

// Components
import { VideoPanel } from "./components/VideoPanel";
import { LessonContent } from "./components/LessonContent";
import { ChatPanel } from "./components/ChatPanel";
import { TeacherSidebar } from "./components/TeacherSidebar";
import { FooterControls } from "./components/FooterControls";
import { Overlays } from "./components/Overlays";
import { PostLessonFeedback } from "../feedback/PostLessonFeedback";

// Types
import type { Message } from "./types";

interface Props {
  bookingId: string;
  userId: number;
}

const Classroom: React.FC<Props> = ({ bookingId, userId }) => {
  const { user, refreshProfile } = useAuth();
  const isTeacher = user?.role === "teacher";

  // UI State
  const [showChat, setShowChat] = useState(false);
  const [showLessonSelector, setShowLessonSelector] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [stars, setStars] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [starBurstKey, setStarBurstKey] = useState(0);
  const [isAwardingStar, setIsAwardingStar] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "prof", text: "Bonjour ! Tu es prêt pour notre leçon ?", time: "14:30" },
  ]);
  const [messageInput, setMessageInput] = useState("");

  // Refs for UI interaction
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const geniallyContainerRef = useRef<HTMLDivElement>(null);
  const cleanupDoneRef = useRef(false);

  // 1. Timer Hook
  const { timeLeft, setTimeLeft, formatTime, sessionEnded } = useTimer(25 * 60);

  // 2. Booking & Lesson Hook
  const {
    booking,
    lesson,
    units,
    setUnits,
    isAccepted,
    isAssigningLesson,
    remotePointer,
    handleAssignLesson,
    handleAcceptStudent,
    updateInteraction,
  } = useBookingLesson({
    bookingId,
    userId,
    isTeacher,
    onTimeSync: (totalDuration, elapsedSeconds) => {
      if (elapsedSeconds < 0) {
        setTimeLeft(totalDuration);
      } else {
        setTimeLeft(Math.max(0, totalDuration - elapsedSeconds));
      }
    },
  });

  // 3. Socket Hook
  const { socketRef, sendMessage, emitStarRewarded, emitSessionEnd } = useSocket({
    bookingId,
    isTeacher,
    iframeRef,
    onMessageReceived: (msg) => setMessages((prev) => [...prev, msg]),
    onSessionEnd: () => setTimeLeft(0),
    onStarRewarded: () => {
      if (!isTeacher) {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3").play().catch(() => {});
        setStars((prev) => Math.min(10, prev + 1));
        setTotalStars((prev) => prev + 1);
        setStarBurstKey((prev) => prev + 1);
      }
    },
    onGeniallyPageChange: (url) => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      try {
        const newUrl = new URL(url);
        const currentUrl = new URL(iframe.src);
        if (newUrl.pathname === currentUrl.pathname) {
          if (newUrl.hash !== currentUrl.hash) iframe.contentWindow?.location.replace(url);
        } else if (iframe.src !== url) {
          iframe.src = url;
        }
      } catch {
        if (iframe.src !== url) iframe.src = url;
      }
    },
  });

  // 4. Agora Hook
  const {
    localRef,
    remoteRef,
    remoteUser,
    micEnabled,
    videoEnabled,
    toggleMic,
    toggleVideo,
    error: agoraError,
    client,
  } = useAgora(bookingId, userId);

  // Handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "me",
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessageInput("");
  };

  const handleAddStar = async () => {
    if (!isTeacher || stars >= 10 || !booking?.kid?.id || isAwardingStar) return;
    setIsAwardingStar(true);
    try {
      new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3").play().catch(() => {});
      setStars((prev) => prev + 1);
      setTotalStars((prev) => prev + 1);
      setStarBurstKey((prev) => prev + 1);
      const { kidService } = await import("../../services/kid.service");
      const updatedKid = await kidService.addStar(booking.kid.id);
      if (typeof updatedKid.stars === "number") {
        setTotalStars(updatedKid.stars);
      }
      refreshProfile().catch(console.error);
      emitStarRewarded();
    } catch (err) {
      console.error(err);
      setStars((prev) => Math.max(0, prev - 1));
      setTotalStars((prev) => Math.max(0, prev - 1));
    } finally {
      setIsAwardingStar(false);
    }
  };

  const cleanupSession = useCallback(async () => {
    if (cleanupDoneRef.current) return;
    cleanupDoneRef.current = true;
    try {
      await client.leave();
    } catch (err) {
      console.error(err);
    }
    socketRef.current?.disconnect();
  }, [client, socketRef]);

  const handleLeave = useCallback(() => {
    if (isTeacher) {
      cleanupSession().finally(() => {
        window.location.href = "/teacher/sessions";
      });
      return;
    }

    cleanupSession().finally(() => setShowFeedback(true));
  }, [cleanupSession, isTeacher]);

  const handleFeedbackClose = useCallback(() => {
    window.location.href = "/kid-dashboard";
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bookingId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    updateInteraction(x, y);
  };

  // Session End cleanup
  useEffect(() => {
    if (timeLeft <= 0) {
      if (isTeacher) emitSessionEnd();
      cleanupSession().finally(() => {
        if (isTeacher) {
          setTimeout(() => {
            window.location.href = "/teacher/sessions";
          }, 2000);
        } else {
          setShowFeedback(true);
        }
      });
    }
  }, [timeLeft, isTeacher, emitSessionEnd, cleanupSession]);

  // Fetch units for lesson selector
  useEffect(() => {
    if (isTeacher && showLessonSelector && units.length === 0 && booking?.kid) {
      lessonService.getUnits(booking.kid.level || "L0").then(setUnits);
    }
  }, [isTeacher, showLessonSelector, units.length, booking?.kid, setUnits]);

  useEffect(() => {
    if (booking?.kid?.stars !== undefined) {
      setTotalStars(booking.kid.stars || 0);
      return;
    }

    if (!isTeacher) {
      const currentKid = user?.kids?.find((kid) => String(kid.id) === String(booking?.kid?.id));
      setTotalStars(currentKid?.stars || 0);
    }
  }, [booking?.kid?.id, booking?.kid?.stars, isTeacher, user?.kids]);

  if (agoraError) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white/90 backdrop-blur-md rounded-[2.5rem] text-navy p-8 border-4 border-white shadow-[0_24px_70px_rgba(32,42,68,0.16)]">
        <div className="bg-red-500/12 p-4 rounded-full mb-4">
          <VideoOff className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oups !</h2>
        <p className="text-slate-500 text-center mb-6">{agoraError}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue hover:bg-deepBlue text-white rounded-xl transition-colors">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[900px] p-4 md:p-6 lg:p-8 flex flex-col gap-5 md:gap-6 overflow-hidden">
      <div className="pointer-events-none absolute left-[6%] top-[8%] h-28 w-28 rounded-full bg-yellow/20 blur-3xl classroom-float-slow" />
      <div className="pointer-events-none absolute right-[8%] top-[14%] h-36 w-36 rounded-full bg-lightBlue/16 blur-3xl classroom-float-fast" />
      <div className="pointer-events-none absolute left-[18%] bottom-[10%] h-28 w-28 rounded-full bg-orange/14 blur-3xl classroom-float-slow" />

      <div className="relative flex items-center justify-between gap-4 px-2 md:px-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-blue shadow-sm">
            Classe interactive
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black text-navy tracking-tight">
            {lesson?.title || "Aventure en anglais"}
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-3 rounded-[1.6rem] border-2 border-white bg-white/80 px-4 py-3 shadow-[0_14px_34px_rgba(32,42,68,0.10)] backdrop-blur-sm">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-yellow to-orange border-2 border-white flex items-center justify-center text-navy font-black shadow-sm">
            {lesson?.order || 1}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/40">
              Session active
            </div>
            <div className="text-sm font-black text-navy">
              {formatTime(timeLeft)} restantes
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 rounded-[2.4rem] border-4 border-white/80 bg-white/72 shadow-[0_24px_70px_rgba(32,42,68,0.14)] backdrop-blur-md p-3 md:p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-4xl bg-linear-to-r from-yellow via-orange to-lightBlue" />
        <div className="flex-1 rounded-4xl overflow-hidden flex bg-white/70">
        <LessonContent
          lesson={lesson}
          isTeacher={isTeacher}
          iframeRef={iframeRef}
          geniallyContainerRef={geniallyContainerRef}
          remotePointer={remotePointer}
          timeLeft={timeLeft}
          socket={socketRef.current}
          bookingId={bookingId}
          onMouseMove={onMouseMove}
          onShowLessonSelector={() => setShowLessonSelector(true)}
        />

        <VideoPanel
          localRef={localRef}
          remoteRef={remoteRef}
          remoteUser={remoteUser}
          videoEnabled={videoEnabled}
          stars={stars}
          totalStars={totalStars}
          isTeacher={isTeacher}
          starBurstKey={starBurstKey}
          isAwardingStar={isAwardingStar}
          onAddStar={handleAddStar}
        />

        {showChat && (
          <ChatPanel
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSubmit={handleSendMessage}
            onClose={() => setShowChat(false)}
          />
        )}

        {isTeacher && <TeacherSidebar booking={booking} onAcceptStudent={handleAcceptStudent} />}
        </div>
      </div>

      <FooterControls
        micEnabled={micEnabled}
        videoEnabled={videoEnabled}
        showChat={showChat}
        isTeacher={isTeacher}
        lesson={lesson}
        timeLeft={timeLeft}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleChat={() => setShowChat(!showChat)}
        onLeave={handleLeave}
        onShowLessonSelector={() => setShowLessonSelector(true)}
        formatTime={formatTime}
      />

      <Overlays
        sessionEnded={sessionEnded}
        isTeacher={isTeacher}
        isAccepted={isAccepted}
        showLessonSelector={showLessonSelector}
        units={units}
        isAssigningLesson={isAssigningLesson}
        currentLesson={lesson}
        onLeave={handleLeave}
        onAssignLesson={(id) => handleAssignLesson(id).then(success => success && setShowLessonSelector(false))}
        onCloseSelector={() => setShowLessonSelector(false)}
      />

      {showFeedback && !isTeacher && (
        <PostLessonFeedback
          bookingId={bookingId}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
};

export default Classroom;
