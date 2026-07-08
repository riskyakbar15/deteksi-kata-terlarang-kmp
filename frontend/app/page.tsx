"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  Send,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";
import { chatApi } from "@/lib/api";
import type { ValidationResponse, DetectionResult } from "@/types";
import toast from "react-hot-toast";

export default function HomePage() {
  const [text, setText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);

  const handleValidate = async () => {
    if (!text.trim()) {
      toast.error("Masukkan teks untuk divalidasi");
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatApi.validate(text);
      setResult(response);

      if (response.is_clean) {
        toast.success("Teks bersih, tidak ada kata terlarang!");
      } else {
        toast.error(`Ditemukan ${response.violation_count} kata terlarang!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) {
      toast.error("Masukkan teks untuk dikirim");
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatApi.send(text, senderName || "Anonymous");
      setResult({
        is_clean: !response.has_violation,
        original_text: response.original_text,
        filtered_text: response.filtered_text ?? response.original_text,
        violations: response.violations,
        violation_count: response.violations.length,
      });

      toast.success("Pesan berhasil dikirim dan disimpan!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 5) return "bg-red-100 text-red-800 border-red-300";
    if (severity >= 4) return "bg-orange-100 text-orange-800 border-orange-300";
    if (severity >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      profanity: "Kata Kasar",
      hate_speech: "Ujaran Kebencian",
      spam: "Spam",
      inappropriate: "Tidak Pantas",
    };
    return labels[category] || category;
  };

  const highlightViolations = (text: string, violations: DetectionResult[]) => {
    // Escape HTML so user-supplied text can never inject markup (XSS).
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    if (!violations.length) return escapeHtml(text);

    // Sort violations by position (ascending) and build the output from the
    // original text segments, escaping each segment individually.
    const sorted = [...violations].sort(
      (a, b) => a.position_start - b.position_start,
    );

    let result = "";
    let cursor = 0;
    for (const v of sorted) {
      // Skip malformed or overlapping ranges defensively.
      if (v.position_start < cursor) continue;
      result += escapeHtml(text.slice(cursor, v.position_start));
      const word = escapeHtml(text.slice(v.position_start, v.position_end));
      result += `<mark class="highlight-violation">${word}</mark>`;
      cursor = v.position_end;
    }
    result += escapeHtml(text.slice(cursor));

    return result;
  };

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/30 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-white/10">
              <Shield className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                Deteksi Kata Terlarang
              </p>
              <h1 className="text-lg font-semibold text-white">
                KMP Moderation Console
              </h1>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/20"
          >
            Masuk Admin
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="surface-strong overflow-hidden rounded-[2rem] border-white/50 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="hero-grid absolute inset-0 opacity-[0.45]" />
              <div className="relative max-w-2xl">
                <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  Real-time content moderation
                </div>
                <h2 className="panel-title text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Deteksi kata terlarang dengan tampilan yang lebih bersih dan
                  fokus.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Aplikasi ini memadukan mesin deteksi KMP dengan antarmuka yang
                  lebih nyaman dipakai untuk validasi pesan, penyimpanan chat,
                  dan pemantauan pelanggaran.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Deteksi cepat",
                      value: "O(n + m)",
                      icon: BrainCircuit,
                    },
                    {
                      label: "Konsisten",
                      value: "Auto censor",
                      icon: ShieldCheck,
                    },
                    {
                      label: "Pantau",
                      value: "Dashboard admin",
                      icon: AlertTriangle,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-sm"
                    >
                      <item.icon className="h-5 w-5 text-cyan-600" />
                      <p className="mt-3 text-sm text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80 bg-slate-950 px-6 py-10 text-white sm:px-10 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Status sesi</p>
                  <p className="mt-1 text-2xl font-semibold">Siap digunakan</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                  Live demo
                </div>
              </div>

              <div className="mt-8 space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Search className="h-5 w-5 text-cyan-300" />
                  Validasi, kirim, lalu simpan pesan
                </div>
                <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/8">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Coba input
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    "Kirim pesan yang aman, lalu lihat highlight kata yang
                    terdeteksi secara langsung."
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/8">
                    <p className="text-sm text-slate-400">Validasi</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      Cepat
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/8">
                    <p className="text-sm text-slate-400">Simpan</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      Rapi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Algoritma KMP
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  Tentang mesin deteksi
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Knuth-Morris-Pratt (KMP) adalah algoritma pencarian string yang
              efisien dengan kompleksitas waktu <strong>O(n + m)</strong>. Cocok
              untuk pemantauan chat karena bisa mendeteksi pola secara cepat
              tanpa pencocokan ulang yang sia-sia.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Validasi teks sebelum dikirim",
                "Simpan pesan dengan sensor otomatis",
                "Dashboard statistik pelanggaran",
                "Administrasi daftar kata terlarang",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="surface rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Input pesan
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  Coba deteksi sekarang
                </h3>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {text.length} karakter
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nama Pengirim (Opsional)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Teks Chat
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Masukkan teks yang ingin dideteksi..."
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleValidate}
                  disabled={isLoading || !text.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Search className="h-4 w-4" />
                  <span>{isLoading ? "Memproses..." : "Validasi"}</span>
                </button>

                <button
                  onClick={handleSend}
                  disabled={isLoading || !text.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim & Simpan</span>
                </button>

                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Bersihkan</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {result && (
          <section className="surface mt-8 rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {result.is_clean ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">
                        Teks bersih
                      </h2>
                      <p className="text-sm text-slate-500">
                        Tidak ditemukan kata terlarang
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">
                        Ditemukan {result.violation_count} kata terlarang
                      </h2>
                      <p className="text-sm text-slate-500">
                        Detail pelanggaran dan highlight di bawah
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                KMP result preview
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Teks asli
                </h3>
                <div
                  className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-slate-800"
                  dangerouslySetInnerHTML={{
                    __html: highlightViolations(
                      result.original_text,
                      result.violations,
                    ),
                  }}
                />
              </div>

              {!result.is_clean && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Teks tersensor
                  </h3>
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 text-slate-800">
                    {result.filtered_text}
                  </div>
                </div>
              )}
            </div>

            {result.violations.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Detail pelanggaran
                </h3>
                <div className="space-y-3">
                  {result.violations.map((v, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${getSeverityColor(v.severity)}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white/70 px-3 py-1 font-mono text-sm font-semibold text-slate-900">
                          {v.word}
                        </span>
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {getCategoryLabel(v.category)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                        <span>
                          Posisi {v.position_start}-{v.position_end}
                        </span>
                        <span>Severity {v.severity}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          Deteksi Kata Terlarang © 2026 - Menggunakan Algoritma
          Knuth-Morris-Pratt (KMP)
        </div>
      </footer>
    </div>
  );
}
