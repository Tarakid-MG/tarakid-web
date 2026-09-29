import React, { useState } from "react";
import {
  Edit2,
  Trash2,
  Layers,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { type Unit, type Lesson, blue } from "./LessonTypes";

interface LessonListProps {
  units: Unit[];
  onEdit: (l: Lesson, unitId: string) => void;
  onDelete: (id: string) => void;
  lvlColor: string;
  lvlBg: string;
}

export const LessonList: React.FC<LessonListProps> = ({
  units,
  onEdit,
  onDelete,
  lvlColor,
  lvlBg,
}) => {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(
    {},
  );

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  return (
    <div className="space-y-6">
      {units.length > 0 ? (
        units.map((u) => (
          <div key={u.id} className="space-y-2">
            {/* Unit label */}
            <div
              className="flex items-center gap-3 py-2 cursor-pointer group/unit"
              onClick={() => toggleUnit(u.id)}
            >
              <div
                className="px-3 py-1 rounded-xl text-[10px] font-black text-white flex items-center gap-2 transition-transform active:scale-95"
                style={{ background: lvlColor }}
              >
                Unité {u.order}
                {expandedUnits[u.id] ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </div>
              <h3
                className="font-black text-sm uppercase tracking-wide text-navy group-hover/unit:opacity-70 transition-opacity"
              >
                {u.title}
              </h3>
              <div className="flex-1 h-px" style={{ background: "#f1f5f9" }} />
              <span className="text-[10px] font-bold text-slate-400">
                {u.lessons?.length || 0} leçon
                {(u.lessons?.length || 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {expandedUnits[u.id] && (
              <>
                {u.lessons && u.lessons.length > 0 ? (
                  <div className="space-y-1.5">
                    {u.lessons.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border transition-all group"
                        style={{
                          background: "#f8fafc",
                          borderColor: "#f1f5f9",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            `${lvlColor}35`;
                          (e.currentTarget as HTMLElement).style.background =
                            "white";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "#f1f5f9";
                          (e.currentTarget as HTMLElement).style.background =
                            "#f8fafc";
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumb */}
                          <div
                            className="w-10 h-10 rounded-xl border overflow-hidden shrink-0"
                            style={{
                              borderColor: "#f1f5f9",
                              background: "#f1f5f9",
                            }}
                          >
                            {l.thumbnailUrl ? (
                              <img
                                src={l.thumbnailUrl}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-bold text-sm truncate text-navy"
                            >
                              {l.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                                style={{ background: lvlBg, color: lvlColor }}
                              >
                                #{l.order}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                {l.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onEdit(l, u.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{
                              background: "rgba(33,158,188,0.08)",
                              color: blue,
                            }}
                            onMouseEnter={(e) => (
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = blue),
                              ((e.currentTarget as HTMLElement).style.color =
                                "white")
                            )}
                            onMouseLeave={(e) => (
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(33,158,188,0.08)"),
                              ((e.currentTarget as HTMLElement).style.color =
                                blue)
                            )}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(l.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{
                              background: "rgba(239,68,68,0.06)",
                              color: "#fca5a5",
                            }}
                            onMouseEnter={(e) => (
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(239,68,68,0.12)"),
                              ((e.currentTarget as HTMLElement).style.color =
                                "#ef4444")
                            )}
                            onMouseLeave={(e) => (
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(239,68,68,0.06)"),
                              ((e.currentTarget as HTMLElement).style.color =
                                "#fca5a5")
                            )}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="py-4 px-5 rounded-2xl text-xs italic font-bold text-slate-300"
                    style={{
                      background: "#f8fafc",
                      border: "1px dashed #f1f5f9",
                    }}
                  >
                    Aucune leçon dans cette unité
                  </div>
                )}
              </>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: lvlBg, border: `2px dashed ${lvlColor}40` }}
          >
            <Layers className="w-7 h-7" style={{ color: `${lvlColor}60` }} />
          </div>
          <p className="text-slate-400 font-bold italic text-sm">
            Aucune unité pour ce niveau
          </p>
        </div>
      )}
    </div>
  );
};
