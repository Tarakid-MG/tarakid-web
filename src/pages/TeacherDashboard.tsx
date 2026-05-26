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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { TeacherLayout } from "../components/layout/TeacherLayout";
import { bookingService, type TeacherStats } from "../services/booking.service";
import { type Booking } from "../types/auth";
import { useAuth } from "../context/AuthContextDefinition";

// ── Palette identique à l'original, adaptée au thème ──────────────────────
const COLORS = ["#f87171", "#fb923c", "#fcd34d", "#4ade80", "#6366f1"];

const competenceLabel: Record<string, string> = {
  poor: "Poor",
  belowAverage: "Below Average",
  average: "Average",
  good: "Good",
  competent: "Competent",
};

function formatSessionDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const TeacherDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
  const competenceScore = stats
    ? Math.max(...Object.values(stats.competences))
    : 0;
  const hearts = stats?.hearts ?? Math.round((stats?.commitmentScore ?? 0) / 2);
  const maxHearts = stats?.maxHearts ?? 5;
  const totalFeedback =
    (stats?.performance.thumbsUp ?? 0) + (stats?.performance.thumbsDown ?? 0);
  const positiveRatio =
    totalFeedback > 0
      ? Math.round(((stats?.performance.thumbsUp ?? 0) / totalFeedback) * 100)
      : null;
  const finishedCourses = stats?.performance.finishedCourses ?? 0;

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
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-4xl bg-white border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-blue/5 pointer-events-none" />
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-gold/15 pointer-events-none" />
          <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue/10 border border-blue/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Tableau professeur
              </div>
              <h1
                className="text-3xl md:text-4xl font-black leading-tight"
                style={{ color: "var(--color-navy)" }}
              >
                Bonjour,{" "}
                <span style={{ color: "var(--color-blue)" }}>
                  {user?.firstName || "Professeur"}
                </span>
              </h1>
              <p className="text-slate-500 font-medium mt-2">
                Suivez vos prochains cours, vos retours parents et votre rythme
                pédagogique en un coup d'oeil.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Aujourd'hui",
                  value: new Date().toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  }),
                  icon: Calendar,
                  color: "var(--color-blue)",
                  bg: "rgba(33,158,188,0.1)",
                },
                {
                  label: "48h",
                  value: `${upcoming.length} cours`,
                  icon: Clock,
                  color: "var(--color-teal)",
                  bg: "rgba(0,128,128,0.1)",
                },
                {
                  label: "Feedback",
                  value: String(totalFeedback),
                  icon: ThumbsUp,
                  color: "var(--color-gold)",
                  bg: "rgba(239,191,4,0.13)",
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-white/90 rounded-2xl border border-slate-100 px-4 py-3 shadow-sm min-w-[132px]"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: bg }}
                  >
                    <Icon className="w-[18px] h-[18px]" style={{ color }} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {label}
                  </p>
                  <p className="text-sm font-black text-navy mt-0.5">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Top Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Commitment Mesure */}
          <div className="xl:col-span-3 bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-slate-100 group">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
              style={{ background: "#ef4444", filter: "blur(30px)" }}
            />
            <div className="absolute top-2 right-2 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
              <Heart className="w-24 h-24 fill-red-500" />
            </div>

            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                >
                  <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                    Hearts
                  </p>
                  <h3
                    className="text-2xl font-black"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {hearts}/{maxHearts}
                  </h3>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[...Array(maxHearts)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 transition-transform group-hover:scale-110`}
                    style={{
                      color:
                        i < hearts
                          ? "#ef4444"
                          : "#e2e8f0",
                      fill:
                        i < hearts
                          ? "#ef4444"
                          : "#e2e8f0",
                      transitionDelay: `${i * 25}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-700"
                  style={{ width: `${(hearts / maxHearts) * 100}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-400">
                Les coeurs reflètent votre fiabilité récente.
              </p>
            </div>
          </div>

          {/* Performance Card */}
          <div className="xl:col-span-6 bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-slate-100 group">
            <div
              className="absolute -top-10 -right-8 w-36 h-36 rounded-full opacity-10 pointer-events-none"
              style={{ background: "var(--color-blue)", filter: "blur(28px)" }}
            />
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(33,158,188,0.1)" }}
                >
                  <TrendingUp
                    className="w-6 h-6 text-blue"
                    style={{ color: "var(--color-blue)" }}
                  />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Performance
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">
                    Données réelles des cours et feedbacks
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Feedback
                </p>
                <p
                  className="text-2xl font-black leading-none"
                  style={{ color: "var(--color-navy)" }}
                >
                  {totalFeedback}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 relative z-10">
              {[
                {
                  label: "Terminés",
                  value: stats?.performance.finishedCourses ?? 0,
                  icon: CheckCircle,
                  color: "var(--color-teal)",
                  bg: "rgba(0,128,128,0.12)",
                  border: "rgba(0,128,128,0.18)",
                },
                {
                  label: "Annulés",
                  value: stats?.performance.canceledCourses ?? 0,
                  icon: XCircle,
                  color: "var(--color-navy)",
                  bg: "rgba(2,48,71,0.08)",
                  border: "rgba(2,48,71,0.14)",
                },
                {
                  label: "Retards",
                  value: stats?.performance.lateCourses ?? 0,
                  icon: AlertCircle,
                  color: "var(--color-gold)",
                  bg: "rgba(255,183,3,0.16)",
                  border: "rgba(255,183,3,0.24)",
                },
              ].map(({ label, value, icon: Icon, color, bg, border }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                  style={{ borderColor: border }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p
                    className="text-3xl font-black leading-none"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {value}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
              <div className="rounded-2xl border border-blue/15 bg-blue/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Likes reçus
                  </p>
                  <p
                    className="text-3xl font-black mt-1"
                    style={{ color: "var(--color-blue)" }}
                  >
                    {stats?.performance.thumbsUp ?? 0}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(33,158,188,0.12)" }}
                >
                  <ThumbsUp
                    className="w-6 h-6"
                    style={{ color: "var(--color-blue)" }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Dislikes reçus
                  </p>
                  <p className="text-3xl font-black mt-1 text-rose-500">
                    {stats?.performance.thumbsDown ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <ThumbsDown className="w-6 h-6 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 relative z-10 flex items-center justify-between gap-4">
              <p className="text-xs font-bold text-slate-400">
                Calculé depuis les réservations assignées au professeur et les
                feedbacks post-leçon.
              </p>
              <div className="shrink-0 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2 text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Ratio positif
                </p>
                <p
                  className="text-sm font-black text-blue"
                  style={{ color: "var(--color-blue)" }}
                >
                  {totalFeedback > 0
                    ? `${positiveRatio}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
          {/* Revenus  */}
          <div className="xl:col-span-3 bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-slate-100 group">
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

            <div className="flex flex-col justify-between gap-6 relative z-10 h-full">
              <div className="flex items-center gap-4">
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
              <div className="rounded-2xl bg-gold/10 border border-gold/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Cours payés
                </p>
                <p className="text-2xl font-black text-navy mt-1">
                  {finishedCourses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Competence Mesure — jauge originale conservée (cx=200, cy=200, iR=80, oR=120) */}
          <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-blue/5 pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "var(--color-navy)" }}
                >
                  Competence mesure
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Score réel calculé depuis cours et feedbacks
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(33,158,188,0.1)" }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: "var(--color-blue)" }}
                />
              </div>
            </div>

            {/* Current level label moved to top */}
            <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
              <div className="rounded-2xl bg-blue/5 border border-blue/10 p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                  Niveau actuel
                </p>
                <p
                  className="text-xl font-black capitalize mt-1"
                  style={{ color: "var(--color-blue)" }}
                >
                  {competenceLabel[stats?.currentCompetence || "average"]}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                  Score
                </p>
                <p className="text-xl font-black text-navy mt-1">
                  {competenceScore}/100
                </p>
              </div>
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

            <div className="relative z-10 mt-2 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Terminés
                </p>
                <p className="font-black text-emerald-600">
                  {finishedCourses}
                </p>
              </div>
              <div className="rounded-2xl bg-blue/5 border border-blue/10 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Feedback
                </p>
                <p className="font-black text-blue">{totalFeedback}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Ratio
                </p>
                <p className="font-black text-navy">
                  {positiveRatio !== null ? `${positiveRatio}%` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming courses — données originales conservées */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
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
                upcoming.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="group p-4 rounded-3xl border border-slate-100 bg-slate-50/80 hover:bg-blue/5 hover:border-blue/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue shadow-sm group-hover:scale-105 transition-transform">
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="absolute -top-2 -right-2 h-6 min-w-6 px-1 rounded-lg bg-navy text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue bg-blue/10 border border-blue/15 rounded-lg px-2 py-1">
                            {booking.type === "FREE_TRIAL" ? "Essai" : "Régulier"}
                          </span>
                          {booking.lesson?.title && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal bg-teal/10 border border-teal/15 rounded-lg px-2 py-1">
                              {booking.lesson.title}
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900">
                          Cours avec {booking.kid?.name || "un enfant"}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatSessionDate(booking.sessionDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {booking.startTime.substring(0, 5)} -{" "}
                            {booking.endTime.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="rounded-2xl bg-white border border-slate-100 px-3 py-2 text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Élève
                        </p>
                        <p className="text-xs font-black text-navy">
                          {booking.kid?.level || "L0"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/teacher/sessions")}
                        className="w-10 h-10 flex items-center justify-center rounded-xl transition-all bg-blue/10 text-blue group-hover:bg-blue group-hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
                        aria-label="Voir les sessions professeur"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
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
