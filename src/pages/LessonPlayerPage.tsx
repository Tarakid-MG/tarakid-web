import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LessonPlayer } from "../components/lesson/LessonPlayer";
import lessonService from "../services/lesson.service";
import type { Lesson } from "../services/lesson.service";

const LessonPlayerPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      try {
        const data = await lessonService.getLessonById(lessonId);
        setLesson(data);
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleClose = () => {
    navigate("/lessons");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-2xl font-black">Oups ! Leçon non trouvée.</h2>
        <button
          onClick={handleClose}
          className="bg-blue px-6 py-2 rounded-full font-black"
        >
          RETOUR AUX LEÇONS
        </button>
      </div>
    );
  }

  return <LessonPlayer lesson={lesson} onClose={handleClose} />;
};

export default LessonPlayerPage;
