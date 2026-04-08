import { CheckCircle2, AlertCircle } from "lucide-react";

export const Message = ({
  msg,
}: {
  msg: { type: "ok" | "err"; text: string };
}) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold mb-4 ${
      msg.type === "ok"
        ? "bg-green-50 border border-green-100 text-green-600"
        : "bg-red-50 border border-red-100 text-red-600"
    }`}
  >
    {msg.type === "ok" ? (
      <CheckCircle2 className="w-5 h-5 shrink-0" />
    ) : (
      <AlertCircle className="w-5 h-5 shrink-0" />
    )}
    {msg.text}
  </div>
);
