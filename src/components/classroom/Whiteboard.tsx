import React, { useRef, useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface Point {
  x: number;
  y: number;
}

interface RemoteDrawData {
  type: string;
  start: Point;
  end: Point;
  color: string;
  lineWidth: number;
}

interface WhiteboardProps {
  socket: Socket | null;
  bookingId: string;
  isTeacher: boolean;
  color?: string;
  lineWidth?: number;
  width: number;
  height: number;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  socket,
  bookingId,
  isTeacher,
  color = "#EF4444",
  lineWidth = 3,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Draw locally and emit to socket
  const drawLine = useCallback(
    (
      start: Point,
      end: Point,
      strokeColor: string,
      strokeWidth: number,
      emit = true,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
      ctx.closePath();

      if (emit && socket) {
        socket.emit("draw", {
          bookingId,
          type: "draw",
          start,
          end,
          color: strokeColor,
          lineWidth: strokeWidth,
        });
      }
    },
    [socket, bookingId, width, height],
  );

  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (data: any) => {
      console.log("Whiteboard: received draw event", data.type);
      if (data.type === "draw") {
        const d = data as RemoteDrawData;
        drawLine(d.start, d.end, d.color, d.lineWidth, false);
      } else if (data.type === "clear") {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    socket.on("draw", handleRemoteDraw);
    return () => {
      socket.off("draw", handleRemoteDraw);
    };
  }, [socket, drawLine]);

  const lastPoint = useRef<Point | null>(null);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    lastPoint.current = { x: x / width, y: y / height };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    const currentPoint = { x: x / width, y: y / height };
    drawLine(lastPoint.current, currentPoint, color, lineWidth);
    lastPoint.current = currentPoint;
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit("draw", { bookingId, type: "clear" });
  };

  return (
    <div className="absolute inset-0 z-100">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="touch-none cursor-crosshair"
      />
      {isTeacher && (
        <button
          onClick={clearCanvas}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors z-110"
          title="Effacer le tableau"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-600">
            <path d="M15 16h4v2h-4v-2zm0-4h7v2h-7v-2zm0-4h9v2h-9V8zM5 6h8c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1z" />
          </svg>
        </button>
      )}
    </div>
  );
};
