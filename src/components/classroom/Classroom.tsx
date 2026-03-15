import React, { useEffect, useRef, useState } from "react";
import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalVideoTrack,
  type ILocalAudioTrack,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import {
  Mic,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  User,
  Loader2,
  Send,
  MessageSquare,
} from "lucide-react";
import { agoraService } from "../../services/agora.service";
import { kidService } from "../../services/kid.service";
import lessonService from "../../services/lesson.service";
import type { Lesson } from "../../services/lesson.service";
import { bookingService } from "../../services/booking.service";
import type { Booking } from "../../types/auth";

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
  sender: "prof" | "me";
  text: string;
  time: string;
}

const Classroom: React.FC<Props> = ({ bookingId, userId }) => {
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

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
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
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
        if (allLessons.length > 0) {
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

        // 1️⃣ demander token au backend
        let tokenData;
        try {
          tokenData = await agoraService.getToken(bookingId, userId);
          if (!isMounted) return;
          console.log("Token récupéré avec succès:", tokenData);
        } catch (err: unknown) {
          if (!isMounted) return;
          console.error("Erreur récupération token:", err);
          setError(
            `Erreur Serveur: Impossible de récupérer le jeton d'accès (${err instanceof Error ? err.message : "Connexion échouée"})`,
          );
          return;
        }

        const { token, appId, channel, uid } = tokenData;

        // 2️⃣ rejoindre la room - Vérifier l'état pour éviter INVALID_OPERATION
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
    };
  }, [bookingId, userId]);

  useEffect(() => {
    if (lesson?.type === "genially") {
      // Inject the Genially script
      const scriptId = "genially-embed-js";
      const existingScript = document.getElementById(scriptId);

      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://view.genially.com/static/embed/embed.js";
      document.body.appendChild(script);

      return () => {
        const script = document.getElementById(scriptId);
        if (script) {
          script.remove();
        }
      };
    }
  }, [lesson]);

  useEffect(() => {
    return () => {
      localTracks?.forEach((track) => {
        track.stop();
        track.close();
      });
    };
  }, [localTracks]);

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
    window.location.href = "/kid-dashboard";
  };

  const addStar = () => {
    if (stars < 10) setStars(stars + 1);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = messageInput.trim();
    if (!trimmedInput) return;

    setMessages((prev) => {
      // Prevent duplicate user messages sent in rapid succession
      if (
        prev.length > 0 &&
        prev[prev.length - 1].text === trimmedInput &&
        prev[prev.length - 1].sender === "me"
      ) {
        return prev;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "me",
        text: trimmedInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      return [...prev, newMessage];
    });

    setMessageInput("");

    // Simulate professor reply
    setTimeout(() => {
      const replyText = "Super ! Continue comme ça.";
      setMessages((prev) => {
        // Prevent duplicate automatic professor replies
        if (
          prev.length > 0 &&
          prev[prev.length - 1].text === replyText &&
          prev[prev.length - 1].sender === "prof"
        ) {
          return prev;
        }

        const reply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "prof",
          text: replyText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [...prev, reply];
      });
    }, 2000);
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
          <div className="flex-1 w-full max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden shadow-inner relative border-4 border-slate-100">
            {lesson ? (
              <div className="w-full h-full">
                {lesson.type === "genially" ? (
                  <div className="w-full h-full relative">
                    <div
                      className="container-wrapper-genially"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <video
                        className="loader-genially"
                        autoPlay
                        loop
                        playsInline
                        muted
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "80px",
                          height: "80px",
                          opacity: 0.5,
                        }}
                      >
                        <source
                          src="https://static.genially.com/resources/loader-default-rebranding.mp4"
                          type="video/mp4"
                        />
                      </video>
                      <div
                        id={lesson.content}
                        className="genially-embed"
                        style={{
                          margin: "0px auto",
                          position: "relative",
                          height: "100%",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={lesson.content}
                    className="w-full h-full"
                    title={lesson.title}
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue" />
                <p className="font-black italic text-navy">CHARGEMENT...</p>
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
    </div>
  );
};

export default Classroom;
