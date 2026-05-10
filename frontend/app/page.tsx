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
    if (!violations.length) return text;

    // Sort violations by position (reverse) to replace from end
    const sorted = [...violations].sort(
      (a, b) => b.position_start - a.position_start,
    );

    let result = text;
    for (const v of sorted) {
      const before = result.slice(0, v.position_start);
      const word = result.slice(v.position_start, v.position_end);
      const after = result.slice(v.position_end);
      result = `${before}<mark className="highlight-violation">${word}</mark>${after}`;
    }

    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Deteksi Kata Terlarang
                </h1>
                <p className="text-sm text-gray-500">
                  Algoritma Knuth-Morris-Pratt (KMP)
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Tentang Algoritma KMP
              </h2>
              <p className="text-gray-600 text-sm">
                Knuth-Morris-Pratt (KMP) adalah algoritma pencarian string yang
                efisien dengan kompleksitas waktu <strong>O(n + m)</strong>,
                dimana n adalah panjang teks dan m adalah panjang pola.
                Algoritma ini menggunakan <em>failure function</em> (LPS array)
                untuk menghindari pencocokan ulang karakter yang sudah diketahui
                cocok.
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Deteksi Kata Terlarang
          </h2>

          {/* Sender Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pengirim (Opsional)
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Anonymous"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Text Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teks Chat
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Masukkan teks yang ingin dideteksi..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{text.length} karakter</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleValidate}
              disabled={isLoading || !text.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Search className="h-4 w-4" />
              <span>{isLoading ? "Memproses..." : "Validasi"}</span>
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading || !text.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Send className="h-4 w-4" />
              <span>Kirim & Simpan</span>
            </button>

            <button
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              {result.is_clean ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-green-700">
                    Teks Bersih
                  </h2>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-700">
                    Ditemukan {result.violation_count} Kata Terlarang
                  </h2>
                </>
              )}
            </div>

            {/* Original Text with Highlights */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Teks Asli (dengan highlight):
              </h3>
              <div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: highlightViolations(
                    result.original_text,
                    result.violations,
                  ),
                }}
              />
            </div>

            {/* Filtered Text */}
            {!result.is_clean && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Teks Tersensor:
                </h3>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-gray-800">
                  {result.filtered_text}
                </div>
              </div>
            )}

            {/* Violations List */}
            {result.violations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Detail Pelanggaran:
                </h3>
                <div className="space-y-2">
                  {result.violations.map((v, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(v.severity)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-semibold">
                          "{v.word}"
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                          {getCategoryLabel(v.category)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <span>
                          Posisi: {v.position_start}-{v.position_end}
                        </span>
                        <span className="font-medium">
                          Severity: {v.severity}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Deteksi Kata Terlarang © 2026 - Menggunakan Algoritma
            Knuth-Morris-Pratt (KMP)
          </p>
        </div>
      </footer>
    </div>
  );
}
