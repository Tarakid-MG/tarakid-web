import React, { useEffect, useRef, useState } from "react";
import { X, Play } from "lucide-react";
import type { Lesson } from "../../services/lesson.service";

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
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

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const decoded = decodeContent(lesson.content);
  const contentIsUrl = isUrl(decoded);
  // Show thumbnail preview if available — user clicks play to start lesson
  const [showPreview, setShowPreview] = useState(!!lesson.thumbnailUrl);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing genially script before injecting new content
    const existingScript = document.getElementById("genially-embed-js");
    if (existingScript) existingScript.remove();

    if (!contentIsUrl) {
      // Inject the full Genially embed HTML into the container
      containerRef.current.innerHTML = decoded;

      // Extract and re-inject any <script> tags so they execute
      const scripts = containerRef.current.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value),
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }

    return () => {
      const script = document.getElementById("genially-embed-js");
      if (script) script.remove();
    };
  }, [lesson, decoded, contentIsUrl]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={{
        backgroundImage: "url('/images/backgrounds/classroom.png')",
        backgroundSize: "cover",
      }}
    >
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6 flex items-start justify-between pointer-events-none h-24">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 shadow-sm">
            LEÇON {lesson.order}
          </div>
          <h2 className="text-white font-black text-lg truncate max-w-[200px] md:max-w-lg drop-shadow-md">
            {lesson.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="bg-black/20 hover:bg-white/20 p-3 rounded-full text-white transition-all shadow-lg border border-white/10 pointer-events-auto active:scale-90 backdrop-blur-md"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Thumbnail Preview Overlay */}
      {showPreview && lesson.thumbnailUrl && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => setShowPreview(false)}
          style={{
            backgroundImage: `url('${lesson.thumbnailUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark scrim */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

          {/* Play button */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md border-4 border-white/60 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
            <div className="bg-black/40 backdrop-blur-sm text-white font-black uppercase tracking-widest text-sm px-6 py-2 rounded-full border border-white/20">
              Commencer la leçon
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 w-full pt-20 md:pt-24 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full h-full max-w-7xl bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/50">
          {contentIsUrl ? (
            // PDF or external URL — render in an iframe
            <iframe
              src={decoded}
              className="w-full h-full"
              title={lesson.title}
              allow="fullscreen"
            />
          ) : (
            // Genially embed HTML — injected via ref + innerHTML
            <div
              ref={containerRef}
              className="w-full h-full"
              style={{ minHeight: "400px" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
