import React, { useEffect } from "react";
import { X } from "lucide-react";

interface GeniallyEmbedProps {
  onClose: () => void;
}

export const GeniallyEmbed: React.FC<GeniallyEmbedProps> = ({ onClose }) => {
  useEffect(() => {
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
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/90 p-2 rounded-full hover:bg-white text-navy transition-all shadow-lg"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="flex-1 w-full h-full relative bg-[#F8FAFC]">
          <div
            className="container-wrapper-genially"
            style={{
              position: "relative",
              minHeight: "400px",
              maxWidth: "100%",
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
                top: "45%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80px",
                height: "80px",
                marginBottom: "10%",
              }}
            >
              <source
                src="https://static.genially.com/resources/loader-default-rebranding.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <div
              id="697866992d9a0fa6241696da"
              className="genially-embed"
              style={{
                margin: "0px auto",
                position: "relative",
                height: "100%",
                width: "100%",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
