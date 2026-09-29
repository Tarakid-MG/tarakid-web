import React from "react";
import { MessageSquare, Send, X } from "lucide-react";
import type { Message } from "../types";

interface ChatPanelProps {
  messages: Message[];
  messageInput: string;
  setMessageInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  messageInput,
  setMessageInput,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="w-85 flex flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfd_100%)] border-l border-slate-100 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue/10 rounded-2xl flex items-center justify-center border border-blue/10">
            <MessageSquare className="w-4 h-4 text-blue" />
          </div>
          <div>
            <h3 className="font-black text-navy uppercase tracking-widest text-[10px]">Chat de classe</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Messages rapides</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-navy transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(circle_at_top,rgba(76,201,240,0.08),transparent_25%),linear-gradient(180deg,rgba(248,251,252,0.65),rgba(244,249,251,0.72))]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                msg.sender === "me" ? "bg-blue text-white rounded-tr-none" : "bg-white text-navy border border-slate-100 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-slate-400 mt-1.5 font-bold px-1 uppercase tracking-tight">
              {msg.sender === "me" ? "Moi" : "Professeur"} • {msg.time}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Écris un message..."
          className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm focus:border-blue/30 focus:bg-white outline-none transition-all"
        />
        <button
          type="submit"
          className="bg-blue text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg shadow-blue/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
