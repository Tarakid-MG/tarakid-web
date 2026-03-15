import React from "react";
import { useNavigate } from "react-router-dom";
import { LessonSelection } from "../components/lesson/LessonSelection";
import type { Lesson } from "../services/lesson.service";

const LessonsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/kid-dashboard");
  };

  const handleSelectLesson = (lesson: Lesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-hidden select-none p-4 md:p-8 flex flex-col op"
      style={{
        backgroundImage: "url('/images/classroom.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="flex-1 max-w-8xl mx-auto w-full">
        <LessonSelection
          onClose={handleClose}
          onSelectLesson={handleSelectLesson}
        />
      </div>
    </div>
  );
};

export default LessonsPage;
