import React, { useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { Socket } from "socket.io-client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface DocumentSyncData {
  type: "page" | "scroll";
  page?: number;
  top?: number;
}

// Set up PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  url: string;
  socket: Socket | null;
  bookingId: string;
  isTeacher: boolean;
  onPageResize?: (size: { width: number; height: number }) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  url,
  socket,
  bookingId,
  isTeacher,
  onPageResize,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("PDF Document loaded successfully with", numPages, "pages");
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF Document Load Error:", error);
    setError(error.message || "Erreur lors du chargement du PDF");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > numPages) return;
    setPageNumber(newPage);
    if (isTeacher && socket) {
      socket.emit("syncDocument", { bookingId, type: "page", page: newPage });
    }
  };

  useEffect(() => {
    if (!socket || isTeacher) return;

    const handleSync = (data: DocumentSyncData) => {
      if (data.type === "page" && data.page !== undefined) {
        setPageNumber(data.page);
      } else if (data.type === "scroll" && data.top !== undefined) {
        containerRef.current?.scrollTo({
          top: data.top * containerRef.current.scrollHeight,
        });
      }
    };

    socket.on("syncDocument", handleSync);
    return () => {
      socket.off("syncDocument", handleSync);
    };
  }, [socket, isTeacher]);

  const handleScroll = () => {
    if (!isTeacher || !socket || !containerRef.current) return;
    const { scrollTop, scrollHeight } = containerRef.current;
    socket.emit("syncDocument", {
      bookingId,
      type: "scroll",
      top: scrollTop / scrollHeight,
    });
  };

  // Adjust whiteboard size when PDF page renders
  const onPageRenderSuccess = (page: { width: number; height: number }) => {
    if (onPageResize) {
      onPageResize({ width: page.width, height: page.height });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden rounded-2xl">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1 || !isTeacher}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <span className="font-bold text-navy">
            Page {pageNumber} sur {numPages}
          </span>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= numPages || !isTeacher}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
        {isTeacher && (
          <div className="text-[10px] font-black text-blue uppercase tracking-widest bg-blue/10 px-3 py-1 rounded-full">
            Mode Enseignant - Contrôle du PDF
          </div>
        )}
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-8 flex justify-center custom-scrollbar relative"
      >
        <div className="relative shadow-2xl bg-white">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="p-20 text-center font-bold text-slate-400">
                Chargement du document...
              </div>
            }
          >
            {error ? (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-4 bg-red-50 rounded-2xl border-2 border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 font-bold text-2xl">
                  !
                </div>
                <div>
                  <h3 className="font-black text-red-600 uppercase tracking-widest text-sm mb-1">
                    Erreur de chargement
                  </h3>
                  <p className="text-red-400 text-xs font-medium max-w-xs">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onRenderSuccess={onPageRenderSuccess}
                loading={<div className="p-20" />}
              />
            )}
          </Document>
        </div>
      </div>
    </div>
  );
};
