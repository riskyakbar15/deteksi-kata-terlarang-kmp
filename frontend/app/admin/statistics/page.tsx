"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { statsApi } from "@/lib/api";
import type { StatisticsOverview, WordFrequency, TimelineData } from "@/types";
import toast from "react-hot-toast";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f43f5e",
];

const categoryColors: Record<string, string> = {
  profanity: "#ef4444",
  hate_speech: "#8b5cf6",
  spam: "#eab308",
  inappropriate: "#6b7280",
};

export default function StatisticsPage() {
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

  // Prepare category distribution data
  const categoryData = stats.top_words.reduce(
    (acc, word) => {
      const existing = acc.find((item) => item.category === word.category);
      if (existing) {
        existing.count += word.count;
      } else {
        acc.push({ category: word.category, count: word.count });
      }
      return acc;
    },
    [] as { category: string; count: number }[],
  );

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      profanity: "Kata Kasar",
      hate_speech: "Ujaran Kebencian",
      spam: "Spam",
      inappropriate: "Tidak Pantas",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="surface rounded-[1.75rem] px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Statistik
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Analisis dan visualisasi data deteksi kata terlarang dengan chart dan
          tabel yang lebih mudah dibaca.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface rounded-[1.5rem] p-6">
          <p className="text-sm text-slate-500">Total Pesan</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {stats.overview.total_messages}
          </p>
        </div>
        <div className="surface rounded-[1.5rem] p-6">
          <p className="text-sm text-slate-500">Total Pelanggaran</p>
          <p className="text-3xl font-semibold tracking-tight text-rose-600">
            {stats.overview.total_violations}
          </p>
        </div>
        <div className="surface rounded-[1.5rem] p-6">
          <p className="text-sm text-slate-500">Tingkat Pelanggaran</p>
          <p className="text-3xl font-semibold tracking-tight text-amber-600">
            {stats.overview.violation_rate}%
          </p>
        </div>
        <div className="surface rounded-[1.5rem] p-6">
          <p className="text-sm text-slate-500">Kata Terlarang Aktif</p>
          <p className="text-3xl font-semibold tracking-tight text-cyan-600">
            {stats.overview.active_forbidden_words}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Top Words Bar Chart */}
        <div className="surface rounded-[1.75rem] p-6 sm:p-8">
          <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
            Top 10 Kata Terdeteksi
          </h2>
          {stats.top_words.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.top_words}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 88, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="word" type="category" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as WordFrequency;
                        return (
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                            <p className="font-semibold text-slate-950">
                              {data.word}
                            </p>
                            <p className="text-sm text-slate-500">
                              Kategori: {getCategoryLabel(data.category)}
                            </p>
                            <p className="text-sm text-slate-500">
                              Jumlah: {data.count}
                            </p>
                            <p className="text-sm text-slate-500">
                              Severity: {data.severity}/5
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Belum ada data
            </div>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="surface rounded-[1.75rem] p-6 sm:p-8">
          <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
            Distribusi Kategori
          </h2>
          {categoryData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      `${getCategoryLabel(category)} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={104}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          categoryColors[entry.category] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                            <p className="font-semibold text-slate-950">
                              {getCategoryLabel(data.category)}
                            </p>
                            <p className="text-sm text-slate-500">
                              Jumlah: {data.count}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="surface rounded-[1.75rem] p-6 sm:p-8">
        <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
          Aktivitas 7 Hari Terakhir
        </h2>
        {stats.timeline.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.timeline}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    });
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="messages"
                  name="Pesan"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="violations"
                  name="Pelanggaran"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            Belum ada data
          </div>
        )}
      </div>

      {/* Recent Violations Table */}
      <div className="surface rounded-[1.75rem] p-6 sm:p-8">
        <h2 className="panel-title mb-4 text-lg font-semibold text-slate-950">
          Pelanggaran Terbaru
        </h2>
        {stats.recent_violations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                    Kata
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                    Pengirim
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                    Preview Pesan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_violations.map((violation) => (
                  <tr
                    key={violation.id}
                    className="border-b border-slate-200/70 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-rose-600">
                        "{violation.detected_word}"
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {violation.sender_name}
                    </td>
                    <td className="max-w-xs px-4 py-3 truncate text-slate-500">
                      {violation.message_preview}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(violation.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            Belum ada pelanggaran
          </div>
        )}
      </div>
    </div>
  );
}
