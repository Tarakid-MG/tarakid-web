import React from "react";
import { useNavigate } from "react-router-dom";
import { LessonSelection } from "../components/lesson/LessonSelection";
import type { Lesson } from "../services/lesson.service";

const LessonsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/kid-dashboard");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleSelectLesson = (lesson: Lesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <div
      className="relative flex min-h-screen select-none flex-col overflow-hidden px-3 py-3 font-sans md:px-6 md:py-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at 12% 10%, rgba(76,201,240,0.14), transparent 24%), radial-gradient(circle at 88% 8%, rgba(255,212,0,0.12), transparent 18%), linear-gradient(180deg, rgba(223,247,255,0.70) 0%, rgba(243,251,255,0.58) 34%, rgba(255,255,255,0.42) 78%), url('/images/backgrounds/kids-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center, center, center, center bottom",
      }}
    >
      <div className="pointer-events-none absolute -left-12 top-24 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 top-12 h-52 w-52 rounded-full bg-gold/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-10 bottom-8 h-24 rounded-full bg-turquoise/16 blur-3xl" />

      <div className="relative mx-auto flex-1 w-full max-w-[1600px]">
        <LessonSelection
          onBack={handleBack}
          onClose={handleClose}
          onSelectLesson={handleSelectLesson}
        />
      </div>
    </div>
  );
};

export default LessonsPage;
