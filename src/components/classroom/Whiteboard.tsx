import React, { useRef, useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface Point {
  x: number;
  y: number;
}

interface BaseEvent {
  bookingId: string;
  type: "draw" | "clear";
}

interface DrawEvent extends BaseEvent {
  type: "draw";
  start: Point;
  end: Point;
  color: string;
  lineWidth: number;
}

interface ClearEvent extends BaseEvent {
  type: "clear";
}

type WhiteboardEvent = DrawEvent | ClearEvent;

interface WhiteboardProps {
  socket: Socket | null;
  bookingId: string;
  isTeacher: boolean;
  color?: string;
  lineWidth?: number;
  width: number;
  height: number;
  isDrawingMode: boolean;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  socket,
  bookingId,
  isTeacher,
  color = "#EF4444",
  lineWidth = 3,
  width,
  height,
  isDrawingMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<Point | null>(null);

  // ✅ DRAW FUNCTION
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

      // ✅ EMIT seulement si drawing actif
      if (emit && socket && isDrawingMode) {
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
    [socket, bookingId, width, height, isDrawingMode],
  );

  // ✅ SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (data: WhiteboardEvent) => {
      if (data.bookingId !== bookingId) return;

      if (data.type === "draw") {
        drawLine(data.start, data.end, data.color, data.lineWidth, false);
      }

      if (data.type === "clear") {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    socket.on("draw", handleRemoteDraw);

    return () => {
      socket.off("draw", handleRemoteDraw);
    };
  }, [socket, bookingId, drawLine]);

  // ✅ START DRAW
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode) return; // 🔥 FIX

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const clientX =
      "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    lastPoint.current = { x: x / width, y: y / height };
    setIsDrawing(true);
  };

  // ✅ DRAW MOVE
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint.current || !isDrawingMode) return; // 🔥 FIX

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const clientX =
      "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const currentPoint = { x: x / width, y: y / height };

    drawLine(lastPoint.current, currentPoint, color, lineWidth);

    lastPoint.current = currentPoint;
  };

  // ✅ END DRAW
  const endDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  // ✅ CLEAR
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    socket?.emit("draw", {
      bookingId,
      type: "clear",
    });
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
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className={`touch-none ${
          isDrawingMode ? "cursor-crosshair" : "cursor-default"
        }`}
      />

      {/* ✅ CLEAR BUTTON (teacher only) */}
      {isTeacher && isDrawingMode && (
        <button
          onClick={clearCanvas}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors z-110"
        >
          🧹
        </button>
      )}
    </div>
  );
};