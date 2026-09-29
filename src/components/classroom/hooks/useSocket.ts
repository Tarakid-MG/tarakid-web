import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "../types";
 
interface MessageData {
  text: string;
  time: string;
}
 
interface PageChangeData {
  bookingId: string;
  url: string;
}

interface UseSocketProps {
  bookingId: string;
  isTeacher: boolean;
  onMessageReceived: (message: Message) => void;
  onSessionEnd: () => void;
  onGeniallyPageChange: (url: string) => void;
  onStarRewarded: () => void;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export const useSocket = ({
  bookingId,
  isTeacher,
  onMessageReceived,
  onSessionEnd,
  onGeniallyPageChange,
  onStarRewarded,
  iframeRef,
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const lastSentUrlRef = useRef<string>("");

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3002");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", bookingId);
    });

    socket.on("receiveMessage", (data: MessageData) => {
      onMessageReceived({
        id: Date.now().toString() + Math.random(),
        sender: isTeacher ? "user" : "prof",
        text: data.text,
        time: data.time,
      });
    });

    socket.on("session:end", onSessionEnd);
    socket.on("genially:pageChange", (data: PageChangeData) => {
      if (!isTeacher && data.bookingId === bookingId) {
        onGeniallyPageChange(data.url);
      }
    });
    socket.on("starRewarded", onStarRewarded);

    return () => {
      socket.disconnect();
    };
  }, [bookingId, isTeacher, onMessageReceived, onSessionEnd, onGeniallyPageChange, onStarRewarded]);

  // Genially URL polling for teacher
  useEffect(() => {
    if (!isTeacher || !socketRef.current) return;

    const checkIframeUrl = () => {
      const iframe = iframeRef?.current;
      if (!iframe) return;

      let currentUrl = "";
      try {
        currentUrl = iframe.contentWindow?.location.href || iframe.src;
      } catch {
        currentUrl = iframe.src;
      }

      if (currentUrl && currentUrl !== lastSentUrlRef.current) {
        lastSentUrlRef.current = currentUrl;
        socketRef.current?.emit("genially:pageChange", {
          bookingId,
          url: currentUrl,
        });
      }
    };

    const interval = setInterval(checkIframeUrl, 500);
    return () => clearInterval(interval);
  }, [isTeacher, bookingId, iframeRef]);

  const sendMessage = useCallback((text: string) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        bookingId,
        sender: "me",
        text,
      });
    }
  }, [bookingId]);

  const emitStarRewarded = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("starRewarded", { bookingId });
    }
  }, [bookingId]);

  const emitSessionEnd = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("session:end", { bookingId });
    }
  }, [bookingId]);

  return { socketRef, sendMessage, emitStarRewarded, emitSessionEnd };
};
