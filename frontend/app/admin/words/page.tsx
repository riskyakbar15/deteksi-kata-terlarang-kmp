"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { wordsApi } from "@/lib/api";
import type {
  ForbiddenWord,
  ForbiddenWordCreate,
  ForbiddenWordUpdate,
  PaginatedResponse,
} from "@/types";
import toast from "react-hot-toast";

const categories = [
  { value: "profanity", label: "Kata Kasar" },
  { value: "hate_speech", label: "Ujaran Kebencian" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Tidak Pantas" },
];

const severityColors: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

export default function WordsPage() {
  const [words, setWords] = useState<PaginatedResponse<ForbiddenWord> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<ForbiddenWord | null>(null);
  const [formData, setFormData] = useState<ForbiddenWordCreate>({
    word: "",
    category: "profanity",
    severity: 3,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchWords();
  }, [page, search, categoryFilter]);

  const fetchWords = async () => {
    setIsLoading(true);
    try {
      const data = await wordsApi.getList(
        page,
        15,
        search || undefined,
        categoryFilter || undefined,
      );
      setWords(data);
    } catch (error: any) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWords();
  };

  const openAddModal = () => {
    setEditingWord(null);
    setFormData({ word: "", category: "profanity", severity: 3 });
    setIsModalOpen(true);
  };

  const openEditModal = (word: ForbiddenWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      category: word.category,
      severity: word.severity,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
    setFormData({ word: "", category: "profanity", severity: 3 });
  };

  const handleSave = async () => {
    if (!formData.word.trim()) {
      toast.error("Kata tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      if (editingWord) {
        const updatePayload: ForbiddenWordUpdate = {
          word: formData.word,
          category: formData.category,
          severity: formData.severity,
        };
        await wordsApi.update(editingWord.id, updatePayload);
        toast.success("Kata berhasil diperbarui");
      } else {
        await wordsApi.create(formData);
        toast.success("Kata berhasil ditambahkan");
      }
      closeModal();
      fetchWords();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await wordsApi.delete(id);
      toast.success("Kata berhasil dihapus");
      setDeleteConfirm(null);
      fetchWords();
    } catch (error: any) {
      toast.error("Gagal menghapus");
    }
  };

  const handleToggleActive = async (word: ForbiddenWord) => {
    try {
      await wordsApi.update(word.id, { is_active: !word.is_active });
      toast.success(word.is_active ? "Kata dinonaktifkan" : "Kata diaktifkan");
      fetchWords();
    } catch (error: any) {
      toast.error("Gagal mengubah status");
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="surface rounded-[1.75rem] px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              Moderation list
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Kata Terlarang
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Kelola daftar kata, kategori, severity, dan status aktif dengan
              tampilan yang lebih rapi.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Kata</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="surface rounded-[1.5rem] p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kata..."
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </div>
          <div className="w-48">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              aria-label="Filter by category"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 transition hover:bg-slate-200"
            aria-label="Filter words"
          >
            <Filter className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="surface overflow-hidden rounded-[1.75rem]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-cyan-400"></div>
          </div>
        ) : words && words.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                      Kata
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {words.items.map((word) => (
                    <tr
                      key={word.id}
                      className="border-b border-slate-200/70 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-950">
                          {word.word}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            word.category === "profanity"
                              ? "bg-rose-100 text-rose-700"
                              : word.category === "hate_speech"
                                ? "bg-purple-100 text-purple-700"
                                : word.category === "spam"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {categories.find((c) => c.value === word.category)
                            ?.label || word.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${severityColors[word.severity]}`}
                        >
                          {word.severity}/5
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(word)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            word.is_active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {word.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(word)}
                            className="rounded-xl p-2 text-cyan-600 transition hover:bg-cyan-50"
                            aria-label="Edit word"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(word.id)}
                            className="rounded-xl p-2 text-rose-600 transition hover:bg-rose-50"
                            aria-label="Delete word"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
              <p className="text-sm text-slate-500">
                Menampilkan {(page - 1) * 15 + 1} -{" "}
                {Math.min(page * 15, words.total)} dari {words.total} kata
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-slate-600">
                  {page} / {words.total_pages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(words.total_pages, p + 1))
                  }
                  disabled={page === words.total_pages}
                  className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-500">Tidak ada kata terlarang ditemukan</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-label="Add or edit word modal"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="surface relative w-full max-w-md rounded-[1.5rem] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">
                {editingWord ? "Edit Kata" : "Tambah Kata Baru"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label="Close add or edit word modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Kata
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  placeholder="Masukkan kata terlarang"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target
                        .value as ForbiddenWordCreate["category"],
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  aria-label="Select category"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Severity ({formData.severity}/5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                  aria-label="Severity level"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Rendah</span>
                  <span>Tinggi</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800 disabled:bg-slate-300"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="surface relative w-full max-w-sm rounded-[1.5rem] p-6">
            <h2 className="mb-2 text-lg font-semibold text-slate-950">
              Hapus Kata?
            </h2>
            <p className="mb-4 text-slate-500">
              Apakah Anda yakin ingin menghapus kata ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full px-4 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-full bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
