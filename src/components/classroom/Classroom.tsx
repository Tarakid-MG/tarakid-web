import React, { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { io, Socket } from "socket.io-client";
import { DocumentViewer } from "./DocumentViewer";
import { Whiteboard } from "./Whiteboard";
import {
  Mic,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  User,
  Loader2,
  Send,
  MessageSquare,
  Clock,
} from "lucide-react";
import { agoraService } from "../../services/agora.service";
import { kidService } from "../../services/kid.service";
import lessonService from "../../services/lesson.service";
import type { Lesson, Unit } from "../../services/lesson.service";
import { bookingService } from "../../services/booking.service";
import { freeTrialService } from "../../services/free-trial.service";
import { useAuth } from "../../context/AuthContextDefinition";
import type { Booking, FreeTrialBooking } from "../../types/auth";
import { UserCheck, Users } from "lucide-react";

const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

interface Props {
  bookingId: string;
  userId: number;
}

interface Message {
  id: string;
  sender: "prof" | "me" | "user";
  text: string;
  time: string;
}

function decodeContent(content: string): string {
  try {
    return atob(content);
  } catch {
    return content;
  }
}

function isUrl(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://");
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

function resolveAssetUrl(path: string): string {
  if (!path) return "";
  if (isUrl(path) || path.startsWith("data:")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const Classroom: React.FC<Props> = ({ bookingId, userId }) => {
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const geniallyContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [localTracks, setLocalTracks] = useState<
    [ILocalAudioTrack, ILocalVideoTrack] | null
  >(null);

  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(
    null,
  );
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [stars, setStars] = useState(5); // Start with 5 stars as in image
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "prof",
      text: "Bonjour ! Tu es prêt pour notre leçon ?",
      time: "14:30",
    },
  ]);
  const [showLessonSelector, setShowLessonSelector] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isAssigningLesson, setIsAssigningLesson] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [booking, setBooking] = useState<Booking | FreeTrialBooking | null>(
    null,
  );
  const [remotePointer, setRemotePointer] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isInteractionActive] = useState(true);
  const lastInteractionTime = useRef<number>(0);
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [isAccepted, setIsAccepted] = useState(false);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const lessonContainerRef = useRef<HTMLDivElement>(null);

  const decodedLessonContent = lesson ? decodeContent(lesson.content) : "";
  const lessonContentIsUrl = isUrl(decodedLessonContent);

  // Fetch booking details and classroom status
  const fetchStatus = useCallback(async () => {
    try {
      const isTrial = bookingId.startsWith("trial_");
      const status = isTrial
        ? await freeTrialService.getClassroomStatus(
            parseInt(bookingId.replace("trial_", ""), 10),
          )
        : isTeacher
          ? await bookingService.getTeacherClassroomStatus(bookingId)
          : await bookingService.getClassroomStatus(bookingId);

      console.log("Classroom Status Payload:", status);
      setBooking(status);

      if (!isTeacher) {
        setIsAccepted(status.isKidAccepted || false);
      }

      // Sync lesson from booking status
      if (status.lesson && lesson?.id !== status.lesson.id) {
        setLesson(status.lesson);
      }

      // Sync interaction data (pointers, etc.)
      if (status.interactionData) {
        try {
          const data = JSON.parse(status.interactionData);
          if (data.pointer) setRemotePointer(data.pointer);

          // Handle remote slide synchronization
          if (
            !isTeacher &&
            data.currentPage !== undefined &&
            lesson?.type === "genially"
          ) {
            const iframe =
              geniallyContainerRef.current?.querySelector("iframe");
            const targetIframe =
              iframe || geniallyContainerRef.current?.closest("iframe");

            // Try to send navigation command to Genially
            // Standard action for most viewers is 'goToPage' or 'gotoPage'
            const navMessage = { action: "goToPage", page: data.currentPage };
            if (targetIframe?.contentWindow) {
              targetIframe.contentWindow.postMessage(navMessage, "*");
            } else if (geniallyContainerRef.current) {
              // If it's injected HTML, also try broadcasting to window
              window.postMessage(navMessage, "*");
            }
          }
        } catch {
          /* ignore */
        }
      }

      const sDate =
        (status as Booking).sessionDate ||
        (status as FreeTrialBooking).session?.date;
      const sTime =
        (status as Booking).startTime ||
        (status as FreeTrialBooking).session?.startTime;
      const eTime =
        (status as Booking).endTime ||
        (status as FreeTrialBooking).session?.endTime;

      if (sTime && eTime && sDate) {
        const sessionStart = new Date(`${sDate}T${sTime}`);
        const sessionEnd = new Date(`${sDate}T${eTime}`);
        const now = new Date();
        const elapsedSeconds = Math.floor(
          (now.getTime() - sessionStart.getTime()) / 1000,
        );
        const totalDuration = Math.floor(
          (sessionEnd.getTime() - sessionStart.getTime()) / 1000,
        );

        if (elapsedSeconds < 0) {
          setTimeLeft(totalDuration);
        } else {
          setTimeLeft(Math.max(0, totalDuration - elapsedSeconds));
        }
      }
    } catch (err) {
      console.error("Failed to fetch classroom status", err);
    }
  }, [bookingId, isTeacher, lesson?.id, lesson?.type]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Update contentSize for Genially lessons (they fill the container)
  useEffect(() => {
    if (lesson?.type === "genially" && lessonContainerRef.current) {
      const { width, height } =
        lessonContainerRef.current.getBoundingClientRect();
      setContentSize({ width, height });
    }
  }, [lesson, lessonContainerRef.current]);

  const sessionEnded = timeLeft <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const remoteUserRef = useRef<IAgoraRTCRemoteUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch the correct sequential lesson based on booking index
    const fetchCurrentBookingLesson = async () => {
      if (isNaN(userId)) return;
      try {
        const { level } = await kidService.getLevel(userId.toString());
        // Fetch ALL bookings for this kid (kidId == userId in this context)
        const allBookings: Booking[] = await bookingService.getKidBookings(
          userId.toString(),
        );

        // Sort bookings chronologically to find the index
        const sortedBookings = allBookings.sort((a: Booking, b: Booking) => {
          const dateA = new Date(`${a.sessionDate}T${a.startTime}`).getTime();
          const dateB = new Date(`${b.sessionDate}T${b.startTime}`).getTime();
          return dateA - dateB;
        });

        // Find the index of the CURRENT booking
        const currentBookingIndex = sortedBookings.findIndex(
          (b: Booking) => b.id === bookingId,
        );

        // Fetch all units and lessons for the level
        const units = await lessonService.getUnits(level);
        const allLessons = units.flatMap((u) => u.lessons);

        // Pick lesson at the same index (fallback to first lesson)
        if (allLessons.length > 0 && !lesson) {
          const lessonToPlay =
            allLessons[Math.max(0, currentBookingIndex)] || allLessons[0];
          setLesson(lessonToPlay);
        }
      } catch (err) {
        console.error("Failed to fetch current booking lesson:", err);
      }
    };
    fetchCurrentBookingLesson();

    const init = async () => {
      try {
        setError(null);
        console.log("Démarrage init Agora...", { bookingId, userId });

        if (!bookingId || isNaN(userId)) {
          const msg = "ID de réservation ou ID utilisateur invalide.";
          console.error(msg, { bookingId, userId });
          setError(msg);
          return;
        }

        // 1️⃣ demander tokens au backend (RTC + RTM)
        let tokenData;
        try {
          tokenData = await agoraService.getToken(bookingId, userId);
          if (!isMounted) return;
          console.log("Tokens récupérés avec succès:", tokenData);
        } catch (err: unknown) {
          if (!isMounted) return;
          console.error("Erreur récupération tokens:", err);
          setError(
            `Erreur Serveur: Impossible de récupérer les jetons d'accès (${err instanceof Error ? err.message : "Connexion échouée"})`,
          );
          return;
        }

        const { rtc } = tokenData;

        // 2️⃣ Initialisation Socket.io (Chat en temps réel)
        try {
          const socket = io(
            import.meta.env.VITE_API_URL || "http://localhost:3002",
          );
          socketRef.current = socket;

          socket.on("connect", () => {
            console.log("Socket.io connecté:", socket.id);
            socket.emit("joinRoom", bookingId);
          });

          socket.on(
            "receiveMessage",
            (data: { sender: string; text: string; time: string }) => {
              console.log("Message reçu via Socket.io:", data);
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString() + Math.random(),
                  sender:
                    data.sender === "me"
                      ? isTeacher
                        ? "user"
                        : "prof"
                      : isTeacher
                        ? "user"
                        : "prof", // The sender is the other person
                  text: data.text,
                  time: data.time,
                },
              ]);
            },
          );

          socket.on("starRewarded", () => {
            console.log("Étoile reçue !");
            if (!isTeacher) {
              const audio = new Audio(
                "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
              );
              audio.play().catch((e) => console.warn("Erreur audio:", e));
              setStars((prev) => Math.min(10, prev + 1));
            }
          });
        } catch (err) {
          console.error("Erreur Initialisation Socket.io:", err);
        }

        // 3️⃣ rejoindre la room RTC - Vérifier l'état pour éviter INVALID_OPERATION
        const { appId, channel, token, uid } = rtc;
        if (client.connectionState === "DISCONNECTED") {
          try {
            await client.join(appId, channel, token, uid);
            if (!isMounted) {
              await client.leave();
              return;
            }
            console.log("Rejoint le canal avec succès");
          } catch (err: unknown) {
            if (!isMounted) return;
            console.error("Erreur client.join:", err);
            setError(
              `Erreur Agora: Impossible de rejoindre le canal (${err instanceof Error ? err.message : "Inconnue"})`,
            );
            return;
          }
        } else {
          console.log(
            "Client déjà en cours de connexion ou connecté, état:",
            client.connectionState,
          );
        }

        // 3️⃣ créer micro + camera
        let tracks: [ILocalAudioTrack, ILocalVideoTrack];
        try {
          // Check if tracks already exist (persistent client but state local)
          tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
          if (!isMounted) {
            tracks.forEach((track) => track.close());
            return;
          }
          setLocalTracks(tracks);
          console.log("Micro et caméra initialisés");
        } catch (err: unknown) {
          if (!isMounted) return;
          console.error("Erreur micro/caméra:", err);
          setError(
            "Accès refusé: Veuillez autoriser l'accès au micro et à la caméra.",
          );
          return;
        }

        // 4️⃣ publier
        try {
          await client.publish(tracks);
          if (!isMounted) return;
          console.log("Flux publiés");
        } catch (err: unknown) {
          if (!isMounted) return;
          console.error("Erreur publication:", err);
          setError(
            `Erreur Agora: Impossible de publier le flux (${err instanceof Error ? err.message : "Inconnue"})`,
          );
          return;
        }

        // 5️⃣ afficher video locale
        if (localRef.current) {
          tracks[1].play(localRef.current);
        }

        // 6️⃣ écouter remote user
        client.on("user-published", async (user, mediaType) => {
          console.log("Utilisateur distant publié:", user.uid, mediaType);
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            remoteUserRef.current = user;
            setRemoteUser(user);
            // Wait for ref to be available if user just joined
            setTimeout(() => {
              if (remoteRef.current) {
                user.videoTrack?.play(remoteRef.current);
              }
            }, 100);
          }

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user) => {
          console.log("Utilisateur distant dépublié:", user.uid);
          if (user.uid === remoteUserRef.current?.uid) {
            remoteUserRef.current = null;
            setRemoteUser(null);
          }
        });

        client.on("user-left", (user) => {
          console.log("Utilisateur distant a quitté:", user.uid);
          if (user.uid === remoteUserRef.current?.uid) {
            remoteUserRef.current = null;
            setRemoteUser(null);
          }
        });

        // setJoined(true); // Removed as it was unused in current overlay layout
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Erreur critique init Agora:", err);
        setError(
          `Erreur inattendue: ${err instanceof Error ? err.message : "Inconnue"}`,
        );
      }
    };

    init();

    return () => {
      isMounted = false;
      client.removeAllListeners();
      // Leave channel when unmounting to free up resources
      if (
        client.connectionState === "CONNECTED" ||
        client.connectionState === "CONNECTING"
      ) {
        client.leave();
      }

      // Cleanup Socket.io
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId, userId, isTeacher, lesson]);

  useEffect(() => {
    if (
      lesson?.type === "genially" &&
      !lessonContentIsUrl &&
      geniallyContainerRef.current
    ) {
      // Embed the Genially script and handle HTML content
      const scriptId = "genially-embed-js";
      const existingScript = document.getElementById(scriptId);

      if (existingScript) {
        existingScript.remove();
      }

      // Inject the full Genially embed HTML into the container
      geniallyContainerRef.current.innerHTML = decodedLessonContent;

      // Extract and re-inject any <script> tags so they execute
      const scripts = geniallyContainerRef.current.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value),
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      return () => {
        const script = document.getElementById(scriptId);
        if (script) {
          script.remove();
        }
      };
    }
  }, [lesson, decodedLessonContent, lessonContentIsUrl]);

  useEffect(() => {
    return () => {
      localTracks?.forEach((track) => {
        track.stop();
        track.close();
      });
    };
  }, [localTracks]);

  useEffect(() => {
    if (!isTeacher) return;

    const handleGeniallyMessage = (event: MessageEvent) => {
      // Listen for page changes from Genially
      // event.data structure varies, we check for common slide/page fields
      const data = event.data;
      if (
        data &&
        (data.type === "pageChanged" ||
          data.type === "genially.pageChanged" ||
          data.pageId ||
          data.currentPage)
      ) {
        const pageIndex = data.page || data.currentPage || data.pageIndex;
        if (pageIndex !== undefined) {
          const interactionData = JSON.stringify({
            pointer: remotePointer, // keep existing pointer
            currentPage: pageIndex,
          });

          if (bookingId.startsWith("trial_")) {
            freeTrialService.updateInteractionData(
              parseInt(bookingId.replace("trial_", ""), 10),
              interactionData,
            );
          } else {
            bookingService.updateInteractionData(bookingId, interactionData);
          }
        }
      }
    };

    window.addEventListener("message", handleGeniallyMessage);
    return () => window.removeEventListener("message", handleGeniallyMessage);
  }, [isTeacher, bookingId, remotePointer]);

  const toggleMic = async () => {
    if (!localTracks) return;
    const enabled = !micEnabled;
    await localTracks[0].setEnabled(enabled);
    setMicEnabled(enabled);
  };

  const toggleVideo = async () => {
    if (!localTracks) return;
    const enabled = !videoEnabled;
    await localTracks[1].setEnabled(enabled);
    setVideoEnabled(enabled);
  };

  const leaveCall = () => {
    window.location.href = isTeacher ? "/teacher/sessions" : "/kid-dashboard";
  };

  const handleAssignLessonInClass = async (lessonId: string) => {
    setIsAssigningLesson(true);
    try {
      await bookingService.assignLesson(bookingId, lessonId);
      const chosenLesson = units
        .flatMap((u) => u.lessons)
        .find((l) => l.id === lessonId);
      if (chosenLesson) setLesson(chosenLesson);
      setShowLessonSelector(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de leçon.");
    } finally {
      setIsAssigningLesson(false);
    }
  };

  const handleMouseMove = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractionActive || !bookingId) return;

    const now = Date.now();
    if (now - lastInteractionTime.current < 200) return; // Throttle to 5Hz

    lastInteractionTime.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const interactionData = JSON.stringify({ pointer: { x, y } });

    try {
      if (bookingId.startsWith("trial_")) {
        await freeTrialService.updateInteractionData(
          parseInt(bookingId.replace("trial_", ""), 10),
          interactionData,
        );
      } else {
        await bookingService.updateInteractionData(bookingId, interactionData);
      }
    } catch {
      /* silent fail for interaction */
    }
  };

  useEffect(() => {
    if (isTeacher && showLessonSelector && units.length === 0 && booking?.kid) {
      lessonService.getUnits(booking.kid.level || "L0").then(setUnits);
    }
  }, [isTeacher, showLessonSelector, units.length, booking?.kid]);

  const handleAcceptStudent = async () => {
    if (!bookingId) return;
    try {
      const isTrial = bookingId.startsWith("trial_");
      if (isTrial) {
        await freeTrialService.updateAcceptanceStatus(
          parseInt(bookingId.replace("trial_", ""), 10),
          true,
        );
      } else {
        await bookingService.updateAcceptanceStatus(bookingId, true);
      }
      // UI will update on next poll
    } catch (error) {
      console.error("Failed to accept student", error);
    }
  };

  const addStar = async () => {
    if (!isTeacher || stars >= 10 || !booking?.kid?.id) return;

    try {
      // 1. Play sound locally for teacher
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
      );
      audio.play().catch((e) => console.warn("Erreur audio:", e));

      // 2. Increment UI
      setStars((prev) => prev + 1);

      // 3. Persist to DB
      await kidService.addStar(booking.kid.id);

      // 4. Notify kid via Socket.io
      if (socketRef.current) {
        socketRef.current.emit("starRewarded", { bookingId });
      }
    } catch (err) {
      console.error("Échec de l'attribution de l'étoile:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = messageInput.trim();
    if (!trimmedInput) return;

    // Send real message via Socket.io
    if (socketRef.current) {
      const messageData = {
        bookingId,
        sender: "me",
        text: trimmedInput,
      };

      socketRef.current.emit("sendMessage", messageData);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "me",
          text: trimmedInput,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setMessageInput("");
    } else {
      console.warn("Socket.io non prêt");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-900 rounded-3xl text-white p-8">
        <div className="bg-red-500/20 p-4 rounded-full mb-4">
          <VideoOff className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oups !</h2>
        <p className="text-gray-400 text-center mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[850px] bg-slate-50 p-6 flex flex-col gap-6">
      <div className="flex-1 bg-white rounded-4xl overflow-hidden shadow-2xl flex border-4 border-white">
        {/* LEFT: Lesson Content (75%) */}
        <div className="flex-3 relative bg-slate-100 overflow-hidden border-r border-slate-100 flex flex-col p-4 md:p-8">
          <div
            ref={lessonContainerRef}
            className="flex-1 w-full max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden shadow-inner relative border-4 border-slate-100 cursor-none"
            onMouseMove={handleMouseMove}
          >
            {/* 1 Minute Warning Overlay */}
            {timeLeft <= 60 && timeLeft > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
                <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-3 border-2 border-white/50">
                  <Clock className="w-5 h-5" />
                  <span className="uppercase tracking-widest">
                    Il reste 1 minute !
                  </span>
                </div>
              </div>
            )}
            {lesson ? (
              <div className="w-full h-full relative">
                {lesson.type === "genially" ? (
                  <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-full h-full">
                      {lessonContentIsUrl ? (
                        <iframe
                          src={resolveAssetUrl(decodedLessonContent)}
                          className="w-full h-full"
                          title={lesson.title}
                          allow="fullscreen"
                        />
                      ) : (
                        <div
                          ref={geniallyContainerRef}
                          className="w-full h-full relative"
                          style={{
                            margin: "0px auto",
                            position: "relative",
                            minHeight: "400px",
                            height: "100%",
                            width: "100%",
                          }}
                        >
                          {!isTeacher && (
                            <div
                              className="absolute bottom-0 left-0 right-0 h-[60px] z-[50] cursor-not-allowed"
                              title="Seul le professeur peut changer de page"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <DocumentViewer
                    url={resolveAssetUrl(lesson.content)}
                    socket={socketRef.current}
                    bookingId={bookingId}
                    isTeacher={isTeacher}
                    onPageResize={setContentSize}
                  />
                )}

                {/* Universal Interactive Overlay (Whiteboard) */}
                {contentSize.width > 0 && (
                  <div
                    className="absolute z-100 pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: contentSize.width,
                      height: contentSize.height,
                    }}
                  >
                    <div className="w-full h-full pointer-events-auto">
                      <Whiteboard
                        socket={socketRef.current}
                        bookingId={bookingId}
                        isTeacher={isTeacher}
                        width={contentSize.width}
                        height={contentSize.height}
                      />
                    </div>
                  </div>
                )}

                {/* Remote Laser Pointer Overlay */}
                {remotePointer && (
                  <div
                    className="absolute w-6 h-6 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.9)] pointer-events-none transition-all duration-150 z-[150] flex items-center justify-center border-2 border-white"
                    style={{
                      left: `${remotePointer.x * 100}%`,
                      top: `${remotePointer.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <div className="absolute top-8 left-8 px-3 py-1 bg-navy/80 backdrop-blur-sm text-[10px] font-black text-white uppercase rounded-xl tracking-widest whitespace-nowrap shadow-lg border border-white/10">
                      {isTeacher ? "L'élève regarde ici" : "Regarde ici !"}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-10 text-center bg-slate-50/50">
                {isTeacher ? (
                  <>
                    <div className="w-24 h-24 bg-blue/10 rounded-4xl flex items-center justify-center mb-2 border-4 border-white shadow-xl">
                      <MessageSquare className="w-12 h-12 text-blue" />
                    </div>
                    <h2 className="text-2xl font-black text-navy uppercase tracking-tighter">
                      Aucune leçon sélectionnée
                    </h2>
                    <p className="text-slate-400 max-w-xs font-bold text-xs uppercase tracking-widest">
                      Sélectionnez une leçon pour commencer !
                    </p>
                    <button
                      onClick={() => setShowLessonSelector(true)}
                      className="mt-4 px-10 py-5 bg-blue text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <Users className="w-5 h-5" />
                      CHOISIR UNE LEÇON
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue/20 blur-3xl rounded-full animate-pulse" />
                      <Loader2 className="w-16 h-16 animate-spin text-blue relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black text-navy uppercase tracking-tighter mt-4">
                      Préparation du cours
                    </h2>
                    <p className="text-slate-400 max-w-xs font-bold text-xs uppercase tracking-widest">
                      Le professeur prépare le contenu...
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sidebar (25%) */}
        <div className="w-80 bg-slate-50 flex flex-col border-l border-slate-100">
          {/* Top: Teacher (Remote) */}
          <div className="flex-1 min-h-[220px] bg-slate-200 relative overflow-hidden">
            {remoteUser ? (
              <div ref={remoteRef} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 gap-2">
                <User className="w-12 h-12 text-slate-400" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  Professeur
                </p>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-blue/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
              Maître
            </div>
          </div>

          {/* Middle: Stars Reward */}
          <div className="h-40 bg-white flex flex-col items-center justify-center p-6 border-y border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">
              Récompenses
            </p>
            <div className="grid grid-cols-5 gap-3" onClick={addStar}>
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="cursor-pointer transition-transform hover:scale-125 active:scale-90"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-7 h-7 drop-shadow-sm ${i < stars ? "fill-yellow-400" : "fill-slate-100"}`}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Student (Local) */}
          <div className="flex-1 min-h-[220px] bg-slate-200 relative overflow-hidden">
            <div
              ref={localRef}
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {!videoEnabled && (
              <div className="absolute inset-0 bg-slate-300/50 backdrop-blur-sm flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-white/50" />
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <div className="bg-teal text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                Moi
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Chat Panel */}
        {showChat && (
          <div className="w-85 flex flex-col bg-white border-l border-slate-100 animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue" />
                </div>
                <h3 className="font-black text-navy uppercase tracking-widest text-[10px]">
                  Chat de classe
                </h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-navy transition-all active:scale-90"
              >
                <span className="text-xs font-black">✕</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      msg.sender === "me"
                        ? "bg-blue text-white rounded-tr-none"
                        : "bg-white text-navy border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1.5 font-bold px-1 uppercase tracking-tight">
                    {msg.sender === "me" ? "Moi" : "Professeur"} • {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-slate-100 flex gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Écris un message..."
                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm focus:border-blue/30 focus:bg-white outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-blue text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg shadow-blue/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Teacher's Lobby / Waiting Room Panel */}
        {isTeacher && (
          <div className="w-80 bg-white border-l border-slate-100 flex flex-col p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-teal/10 rounded-2xl flex items-center justify-center">
                <Users className="w-5 h-5 text-teal" />
              </div>
              <h3 className="font-black text-navy uppercase tracking-widest text-[10px]">
                Gestion Élèves
              </h3>
            </div>

            <div className="flex-1 space-y-6">
              {booking?.isKidWaiting ? (
                <div className="p-5 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                    <User className="w-8 h-8 text-blue" />
                  </div>
                  <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-1">
                    L'élève arrive...
                  </h3>
                  <p className="text-xs font-medium text-slate-400 max-w-[150px]">
                    Préparez-vous à commencer la leçon !
                  </p>

                  {!booking.isKidAccepted && (
                    <button
                      onClick={handleAcceptStudent}
                      className="w-full py-3 bg-teal text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-teal/20"
                    >
                      <UserCheck className="w-4 h-4" />
                      ACCEPTER L'ÉLÈVE
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-[2rem] bg-blue/5 border-2 border-blue/10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue/10">
                    <UserCheck className="w-8 h-8 text-teal" />
                  </div>
                  <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-1">
                    Élève en ligne
                  </h3>
                  <p className="text-xs font-black text-teal uppercase tracking-tighter">
                    Prêt pour la leçon
                  </p>
                </div>
              )}
            </div>

            {/* Presence indicator */}
            <div className="mt-auto p-4 rounded-2xl bg-blue/5 border border-blue/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span className="text-[10px] font-black text-blue uppercase">
                  Maître présent
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Controls Bar (Outside the Main Classroom Box) */}
      <div className="h-24 bg-white rounded-4xl shadow-xl flex items-center justify-between px-10 border-4 border-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow rounded-2xl flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-navy font-black text-xs font-sans">
              {lesson?.order || 1}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
              Session en cours •{" "}
              <span
                className={
                  timeLeft < 60 ? "text-red-500 animate-pulse" : "text-blue"
                }
              >
                {formatTime(timeLeft)}
              </span>
            </p>
            <h3 className="text-sm font-black text-navy truncate max-w-[200px]">
              {lesson?.title || "..."}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md border-2 ${
              videoEnabled
                ? "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                : "bg-red-500 text-white border-transparent hover:bg-red-600 shadow-red-200"
            }`}
          >
            <VideoIcon className="w-6 h-6" />
          </button>
          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md border-2 ${
              micEnabled
                ? "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                : "bg-red-500 text-white border-transparent hover:bg-red-600 shadow-red-200"
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md border-2 ${
              showChat
                ? "bg-blue text-white border-transparent"
                : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
            }`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Teacher Only: Lesson Selector Button */}
          {isTeacher && (
            <button
              onClick={() => setShowLessonSelector(true)}
              className="px-6 h-14 bg-white border-2 border-slate-100 hover:border-blue text-navy rounded-3xl font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-3 active:scale-95"
            >
              <Users className="w-5 h-5 text-blue" />
              <span>Changer Leçon</span>
            </button>
          )}
        </div>

        <button
          onClick={leaveCall}
          className="px-8 h-14 bg-red-500 hover:bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center gap-3"
        >
          <PhoneOff className="w-5 h-5" />
          <span>Quitter</span>
        </button>
      </div>
      {/* Session Ended Overlay */}
      {sessionEnded && (
        <div className="absolute inset-0 bg-navy/90 backdrop-blur-xl z-100 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-yellow rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-yellow/20">
            <User className="w-12 h-12 text-navy" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">
            Leçon terminée !
          </h2>
          <p className="text-slate-300 text-center max-w-md mb-10 font-medium">
            Bravo ! Tu as terminé ta session de 25 minutes. Tes progrès ont été
            enregistrés.
          </p>
          <button
            onClick={leaveCall}
            className="px-10 py-4 bg-blue hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue/20 active:scale-95"
          >
            Fermer la classe
          </button>
        </div>
      )}

      {/* Waiting for Admission Overlay (for Kid) */}
      {!isTeacher && !isAccepted && (
        <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl z-100 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-blue rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">
            Admission en cours...
          </h2>
          <p className="text-slate-300 text-center max-w-md mb-10 font-medium leading-relaxed">
            Tu es presque arrivé ! <br />
            Attends que ton professeur t'ouvre la porte de la classe.
          </p>
          <button
            onClick={leaveCall}
            className="px-8 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-xl font-bold uppercase tracking-widest transition-all"
          >
            Quitter
          </button>
        </div>
      )}

      {/* Lesson Selector Modal (Teacher Only) */}
      {showLessonSelector && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-navy uppercase tracking-tighter">
                  Sélecteur de Leçon
                </h2>
                <p className="text-slate-400 font-bold text-sm">
                  Choisis la prochaine étape de l'apprentissage
                </p>
              </div>
              <button
                onClick={() => setShowLessonSelector(false)}
                className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <PhoneOff className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-8">
              {units.map((unit) => (
                <div key={unit.id} className="space-y-4">
                  <h3 className="text-xs font-black text-blue uppercase tracking-widest pl-2">
                    {unit.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {unit.lessons.map((l) => (
                      <button
                        key={l.id}
                        disabled={isAssigningLesson}
                        onClick={() => handleAssignLessonInClass(l.id)}
                        className={`p-4 rounded-3xl border-2 transition-all flex items-start gap-4 text-left group active:scale-95 ${
                          lesson?.id === l.id
                            ? "border-blue bg-blue/5"
                            : "border-slate-50 hover:border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            lesson?.id === l.id
                              ? "bg-blue text-white"
                              : "bg-slate-100 text-slate-400 group-hover:bg-white"
                          }`}
                        >
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-navy truncate leading-snug">
                            {l.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                            {l.type}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {isAssigningLesson && (
              <div className="p-4 bg-slate-50 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-blue animate-spin" />
                <span className="text-xs font-bold text-navy uppercase tracking-widest">
                  Attribution de la leçon...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Classroom;
