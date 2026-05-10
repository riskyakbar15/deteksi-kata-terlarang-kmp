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
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Ringkasan statistik deteksi kata terlarang
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Words */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Kata Terdeteksi
          </h2>
          {stats.top_words.length > 0 ? (
            <div className="space-y-3">
              {stats.top_words.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400 w-6">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-gray-900">
                      {word.word}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        word.category === "profanity"
                          ? "bg-red-100 text-red-700"
                          : word.category === "hate_speech"
                            ? "bg-purple-100 text-purple-700"
                            : word.category === "spam"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {word.category}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {word.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Belum ada data</p>
          )}
        </div>

        {/* Recent Violations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pelanggaran Terbaru
          </h2>
          {stats.recent_violations.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_violations.map((violation) => (
                <div key={violation.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-600">
                      "{violation.detected_word}"
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(violation.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {violation.message_preview}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    oleh {violation.sender_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Belum ada pelanggaran
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aktivitas 7 Hari Terakhir
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Tanggal
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  Pesan
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  Pelanggaran
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
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
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900">
                      {day.messages}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span
                        className={
                          day.violations > 0
                            ? "text-red-600 font-medium"
                            : "text-gray-400"
                        }
                      >
                        {day.violations}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-500">
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
