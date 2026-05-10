"use client";

import { useEffect, useState } from "react";
import { MessageSquare, AlertTriangle, Percent, BookOpen } from "lucide-react";
import { statsApi } from "@/lib/api";
import type { StatisticsOverview } from "@/types";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatisticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsApi.getOverview();
      setStats(data);
    } catch (error: any) {
      toast.error("Gagal memuat statistik");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Pesan",
      value: stats.overview.total_messages,
      icon: MessageSquare,
      color: "bg-blue-500",
      subtext: `${stats.overview.messages_today} hari ini`,
    },
    {
      title: "Total Pelanggaran",
      value: stats.overview.total_violations,
      icon: AlertTriangle,
      color: "bg-red-500",
      subtext: `${stats.overview.violations_today} hari ini`,
    },
    {
      title: "Tingkat Pelanggaran",
      value: `${stats.overview.violation_rate}%`,
      icon: Percent,
      color: "bg-orange-500",
      subtext: "Rata-rata",
    },
    {
      title: "Kata Terlarang Aktif",
      value: stats.overview.active_forbidden_words,
      icon: BookOpen,
      color: "bg-green-500",
      subtext: "Total kata",
    },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="surface rounded-[1.75rem] px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Ringkasan statistik deteksi kata terlarang, pelanggaran terbaru, dan
          pola aktivitas selama tujuh hari terakhir.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="surface card-hover rounded-[1.5rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
              </div>
              <div
                className={`${stat.color} flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Top Words */}
        <div className="surface rounded-[1.75rem] p-6 sm:p-8">
          <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
            Top 10 Kata Terdeteksi
          </h2>
          {stats.top_words.length > 0 ? (
            <div className="space-y-3">
              {stats.top_words.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-sm font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-slate-900">
                      {word.word}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        word.category === "profanity"
                          ? "bg-red-100 text-red-700"
                          : word.category === "hate_speech"
                            ? "bg-purple-100 text-purple-700"
                            : word.category === "spam"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {word.category}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-950">
                    {word.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-slate-500">Belum ada data</p>
          )}
        </div>

        {/* Recent Violations */}
        <div className="surface rounded-[1.75rem] p-6 sm:p-8">
          <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
            Pelanggaran Terbaru
          </h2>
          {stats.recent_violations.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_violations.map((violation) => (
                <div
                  key={violation.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="font-medium text-rose-600">
                      "{violation.detected_word}"
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(violation.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="truncate text-sm text-slate-600">
                    {violation.message_preview}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    oleh {violation.sender_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-slate-500">
              Belum ada pelanggaran
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="surface rounded-[1.75rem] p-6 sm:p-8">
        <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
          Aktivitas 7 Hari Terakhir
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Pesan
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Pelanggaran
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.timeline.map((day, idx) => {
                const rate =
                  day.messages > 0
                    ? ((day.violations / day.messages) * 100).toFixed(1)
                    : "0";
                return (
                  <tr
                    key={idx}
                    className="border-b border-slate-200/70 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(day.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-900">
                      {day.messages}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span
                        className={
                          day.violations > 0
                            ? "font-medium text-rose-600"
                            : "text-slate-400"
                        }
                      >
                        {day.violations}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
