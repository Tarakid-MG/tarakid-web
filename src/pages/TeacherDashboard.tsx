import React, { useEffect, useState } from "react";
import {
  Heart,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TeacherLayout } from "../components/layout/TeacherLayout";
import { bookingService, type TeacherStats } from "../services/booking.service";
import { type Booking } from "../types/auth";
import { useAuth } from "../context/AuthContextDefinition";

// ── Palette identique à l'original, adaptée au thème ──────────────────────
const COLORS = ["#f87171", "#fb923c", "#fcd34d", "#4ade80", "#6366f1"];

const TeacherDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [statsData, upcomingData] = await Promise.all([
          bookingService.getTeacherStats(),
          bookingService.getTeacherUpcoming(),
        ]);
        console.log(statsData);
        setStats(statsData);
        setUpcoming(upcomingData);
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  // ── Gauge (identique à l'original) ───────────────────────────────────────
  const chartData = [
    { name: "Poor", value: 20 },
    { name: "Below Average", value: 20 },
    { name: "Average", value: 20 },
    { name: "Good", value: 20 },
    { name: "Competent", value: 20 },
  ];

  const RADIAN = Math.PI / 180;
  const renderNeedle = (
    value: number,
    data: { name: string; value: number }[],
    cx: number,
    cy: number,
    iR: number,
    oR: number,
    color: string,
  ) => {
    let total = 0;
    data.forEach((v) => {
      total += v.value;
    });
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx,
      y0 = cy;
    const xba = x0 + r * sin,
      yba = y0 - r * cos;
    const xbb = x0 - r * sin,
      ybb = y0 + r * cos;
    const xp = x0 + length * cos,
      yp = y0 + length * sin;

    return (
      <g key="gauge-needle">
        <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />
        <path
          d={`M${xba} ${yba}L${xbb} ${ybb}L${xp} ${yp} Z`}
          fill={color}
          stroke="none"
        />
      </g>
    );
  };

  const [chartCenter, setChartCenter] = useState({ cx: 200, cy: 180 });

  const currentLevelIndex = stats
    ? ["poor", "belowaverage", "average", "good", "competent"].indexOf(
        (stats.currentCompetence || "average").toLowerCase(),
      )
    : 2;
  const needleValue =
    (currentLevelIndex === -1 ? 2 : currentLevelIndex + 0.5) * 20;

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-8 flex items-center justify-center h-[80vh]">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: "var(--color-blue)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8 space-y-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-black leading-tight"
              style={{ color: "var(--color-navy)" }}
            >
              Bonjour,{" "}
              <span className="italic" style={{ color: "var(--color-blue)" }}>
                Chef {user?.firstName}
              </span>{" "}
              👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Voici votre aperçu pédagogique pour aujourd'hui.
            </p>
          </div>

          {/* Date pill */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(33,158,188,0.1)" }}
            >
              <Calendar
                className="w-5 h-5"
                style={{ color: "var(--color-blue)" }}
              />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Date
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--color-navy)" }}
              >
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Top Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Commitment Mesure */}
          <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-slate-100 group">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
              style={{ background: "#ef4444", filter: "blur(30px)" }}
            />
            <div className="absolute top-2 right-2 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
              <Heart className="w-24 h-24 fill-red-500" />
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                    Commitment Mesure
                  </p>
                  <h3
                    className="text-2xl font-black"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {stats?.commitmentScore}/10
                  </h3>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[...Array(10)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-transform group-hover:scale-110`}
                    style={{
                      color:
                        i < (stats?.commitmentScore || 0)
                          ? "#ef4444"
                          : "#e2e8f0",
                      fill:
                        i < (stats?.commitmentScore || 0)
                          ? "#ef4444"
                          : "#e2e8f0",
                      transitionDelay: `${i * 25}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-slate-100 group flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(33,158,188,0.1)" }}
                >
                  <TrendingUp
                    className="w-5 h-5 text-blue"
                    style={{ color: "var(--color-blue)" }}
                  />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Performance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 relative z-10">
              {/* Finished & Canceled */}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-600">
                  Terminés: {stats?.performance.finishedCourses ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-600">
                  Annulés: {stats?.performance.canceledCourses ?? 0}
                </span>
              </div>

              {/* Late & Thumbs */}
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-600">
                  Retards: {stats?.performance.lateCourses ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <ThumbsUp
                    className="w-3.5 h-3.5 text-blue"
                    style={{ color: "var(--color-blue)" }}
                  />
                  <span className="text-[10px] font-black">
                    {stats?.performance.thumbsUp ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[10px] font-black">
                    {stats?.performance.thumbsDown ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Star Distribution Summary */}
            <div className="mt-4 pt-4 border-t border-slate-50 relative z-10 flex items-center justify-between">
              <div className="flex gap-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div
                    key={star}
                    className="flex flex-col items-center group/star"
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="text-[8px] font-black text-slate-400">
                        {star}
                      </span>
                      <Star
                        className={`w-2.5 h-2.5 ${star === 5 ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 mt-0.5">
                      {stats?.performance.stars[
                        star as keyof typeof stats.performance.stars
                      ] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Total Avis
                </p>
                <p
                  className="text-sm font-black text-blue"
                  style={{ color: "var(--color-blue)" }}
                >
                  {Object.values(stats?.performance.stars ?? {}).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Revenus  */}
          <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-slate-100 group">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
              style={{ background: "var(--color-gold)", filter: "blur(30px)" }}
            />
            <div className="absolute top-2 right-2 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
              <DollarSign
                className="w-24 h-24"
                style={{ color: "var(--color-gold)" }}
              />
            </div>

            <div className="flex items-center gap-4 relative z-10 h-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(239,191,4,0.12)" }}
              >
                <DollarSign
                  className="w-7 h-7"
                  style={{ color: "var(--color-gold)" }}
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                  Revenus
                </p>
                <h3
                  className="text-2xl font-black"
                  style={{ color: "var(--color-navy)" }}
                >
                  {stats?.earnings.total ?? 0}{" "}
                  {stats?.earnings.currency ?? "Ar"}
                </h3>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block mt-1"
                  style={{
                    background: "rgba(239,191,4,0.1)",
                    color: "var(--color-gold)",
                  }}
                >
                  {stats?.earnings.ratePerClass ?? 5000}{" "}
                  {stats?.earnings.currency ?? "Ar"} per class
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Competence Mesure — jauge originale conservée (cx=200, cy=200, iR=80, oR=120) */}
          <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--color-navy)" }}
                >
                  Competences Mesure
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Analyse de vos retours pédagogiques
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(33,158,188,0.1)" }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              </div>
            </div>

            {/* Current level label moved to top */}
            <div className="text-center mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Niveau Actuel
              </p>
              <p
                className="text-2xl font-black capitalize"
                style={{ color: "var(--color-blue)" }}
              >
                {stats?.currentCompetence === "belowAverage"
                  ? "Below Average"
                  : stats?.currentCompetence || "average"}
              </p>
            </div>

            {/* Gauge container avec flèche */}
            <div className="h-72 w-full flex flex-col items-center relative">
              <ResponsiveContainer
                width="100%"
                height={240}
                onResize={(width) => setChartCenter({ cx: width / 2, cy: 180 })}
              >
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    data={chartData}
                    cx="50%"
                    cy={180}
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "10px",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Needle rendering - fixed coordinate injection via translated group */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ height: 240 }}
              >
                <svg
                  width="100%"
                  height={240}
                  viewBox={`0 0 ${chartCenter.cx * 2 || 400} 240`}
                >
                  {renderNeedle(
                    needleValue,
                    chartData,
                    chartCenter.cx,
                    chartCenter.cy,
                    80,
                    120,
                    "#334155",
                  )}
                </svg>
              </div>
            </div>
          </div>

          {/* Upcoming courses — données originales conservées */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--color-navy)" }}
                >
                  Cours (prochains 48h)
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Votre planning de cours à venir
                </p>
              </div>
              <span
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: "rgba(33,158,188,0.1)",
                  color: "var(--color-blue)",
                  border: "1px solid rgba(33,158,188,0.2)",
                }}
              >
                {upcoming.length} Cours
              </span>
            </div>

            <div className="space-y-4">
              {upcoming.length > 0 ? (
                upcoming.map((booking) => (
                  <div
                    key={booking.id}
                    className="group p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer"
                    style={{ borderColor: "#f1f5f9", background: "#f8fafc" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(33,158,188,0.25)";
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(33,158,188,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#f1f5f9";
                      (e.currentTarget as HTMLElement).style.background =
                        "#f8fafc";
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
                        style={{
                          background: "#f8fafc",
                          borderColor: "#f1f5f9",
                          color: "#94a3b8",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            "white";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--color-blue)";
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "rgba(33,158,188,0.2)";
                        }}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          Cours avec {booking.kid?.name || "un enfant"}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.sessionDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {booking.startTime.substring(0, 5)} -{" "}
                            {booking.endTime.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                      style={{
                        background: "rgba(33,158,188,0.08)",
                        color: "var(--color-blue)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--color-blue)";
                        (e.currentTarget as HTMLElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(33,158,188,0.08)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--color-blue)";
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "rgba(33,158,188,0.06)",
                      border: "2px dashed rgba(33,158,188,0.2)",
                    }}
                  >
                    <Calendar
                      className="w-8 h-8"
                      style={{ color: "rgba(33,158,188,0.3)" }}
                    />
                  </div>
                  <p className="text-slate-400 font-bold italic">
                    Aucun cours prévu pour les 2 prochains jours.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
