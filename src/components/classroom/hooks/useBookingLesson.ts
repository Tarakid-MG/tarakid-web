import { useState, useEffect, useCallback, useRef } from "react";
import { bookingService } from "../../../services/booking.service";
import { freeTrialService } from "../../../services/free-trial.service";
import { kidService } from "../../../services/kid.service";
import lessonService from "../../../services/lesson.service";
import type { Lesson, Unit } from "../../../services/lesson.service";
import type { Booking, FreeTrialBooking } from "../types";
import {
  mergeClassroomInteractionData,
  parseClassroomInteractionData,
} from "../../../utils/bookingStatus";

interface UseBookingLessonProps {
  bookingId: string;
  userId: number;
  isTeacher: boolean;
  onTimeSync: (totalDuration: number, elapsedSeconds: number) => void;
}

export const useBookingLesson = ({
  bookingId,
  userId,
  isTeacher,
  onTimeSync,
}: UseBookingLessonProps) => {
  const [booking, setBooking] = useState<Booking | FreeTrialBooking | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isAssigningLesson, setIsAssigningLesson] = useState(false);
  const [remotePointer, setRemotePointer] = useState<{ x: number; y: number } | null>(null);
  const lastInteractionTime = useRef<number>(0);

  const fetchStatus = useCallback(async () => {
    try {
      const isTrial = bookingId.startsWith("trial_");
      const status = isTrial
        ? await freeTrialService.getClassroomStatus(parseInt(bookingId.replace("trial_", ""), 10))
        : isTeacher
          ? await bookingService.getTeacherClassroomStatus(bookingId)
          : await bookingService.getClassroomStatus(bookingId);

      setBooking(status);
      if (!isTeacher) setIsAccepted(status.isKidAccepted || false);
      if (status.lesson && lesson?.id !== status.lesson.id) setLesson(status.lesson);

      if (status.interactionData) {
        try {
          const data = parseClassroomInteractionData(status.interactionData);
          if (data.pointer) setRemotePointer(data.pointer);
        } catch { /* ignore */ }
      }

      const sDate = (status as Booking).sessionDate || (status as FreeTrialBooking).session?.date;
      const sTime = (status as Booking).startTime || (status as FreeTrialBooking).session?.startTime;
      const eTime = (status as Booking).endTime || (status as FreeTrialBooking).session?.endTime;

      if (sTime && eTime && sDate) {
        const sessionStart = new Date(`${sDate}T${sTime}`);
        const sessionEnd = new Date(`${sDate}T${eTime}`);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
        const totalDuration = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
        onTimeSync(totalDuration, elapsedSeconds);
      }
    } catch (err) {
      console.error("Failed to fetch classroom status", err);
    }
  }, [bookingId, isTeacher, lesson?.id, onTimeSync]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    const fetchInitialLesson = async () => {
      if (isNaN(userId) || lesson) return;
      try {
        const { level } = await kidService.getLevel(userId.toString());
        const allBookings: Booking[] = await bookingService.getKidBookings(userId.toString());
        const sortedBookings = allBookings.sort((a, b) => 
          new Date(`${a.sessionDate}T${a.startTime}`).getTime() - new Date(`${b.sessionDate}T${b.startTime}`).getTime()
        );
        const currentIndex = sortedBookings.findIndex((b) => b.id === bookingId);
        const unitsData = await lessonService.getUnits(level);
        const allLessons = unitsData.flatMap((u) => u.lessons);
        if (allLessons.length > 0) {
          setLesson(allLessons[Math.max(0, currentIndex)] || allLessons[0]);
        }
      } catch (err) {
        console.error("Failed to fetch initial lesson", err);
      }
    };
    fetchInitialLesson();
  }, [userId, bookingId, lesson]);

  const handleAssignLesson = async (lessonId: string) => {
    setIsAssigningLesson(true);
    try {
      await bookingService.assignLesson(bookingId, lessonId);
      const chosen = units.flatMap(u => u.lessons).find(l => l.id === lessonId);
      if (chosen) setLesson(chosen);
      return true;
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de leçon.");
      return false;
    } finally {
      setIsAssigningLesson(false);
    }
  };

  const handleAcceptStudent = async () => {
    try {
      const isTrial = bookingId.startsWith("trial_");
      if (isTrial) {
        await freeTrialService.updateAcceptanceStatus(parseInt(bookingId.replace("trial_", ""), 10), true);
      } else {
        await bookingService.updateAcceptanceStatus(bookingId, true);
      }
    } catch (err) {
      console.error("Failed to accept student", err);
    }
  };

  const updateInteraction = async (x: number, y: number) => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 200) return;
    lastInteractionTime.current = now;

    const data = mergeClassroomInteractionData(booking?.interactionData, {
      pointer: { x, y },
    });
    try {
      if (bookingId.startsWith("trial_")) {
        await freeTrialService.updateInteractionData(parseInt(bookingId.replace("trial_", ""), 10), data);
      } else {
        await bookingService.updateInteractionData(bookingId, data);
      }
    } catch { /* silent fail */ }
  };

  return {
    booking,
    lesson,
    setLesson,
    units,
    setUnits,
    isAccepted,
    isAssigningLesson,
    remotePointer,
    handleAssignLesson,
    handleAcceptStudent,
    updateInteraction,
  };
};
