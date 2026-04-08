import { CheckCircle2, AlertCircle } from "lucide-react";
import { teal } from "./LessonTypes";

export const Message = ({
  msg,
}: {
  msg: { type: "ok" | "err"; text: string };
}) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold mb-4"
    style={
      msg.type === "ok"
        ? {
            background: "rgba(0,128,128,0.08)",
            border: "1.5px solid rgba(0,128,128,0.25)",
            color: teal,
          }
        : {
            background: "rgba(239,68,68,0.08)",
            border: "1.5px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
          }
    }
  >
    {msg.type === "ok" ? (
      <CheckCircle2 className="w-5 h-5 shrink-0" />
    ) : (
      <AlertCircle className="w-5 h-5 shrink-0" />
    )}
    {msg.text}
  </div>
);
