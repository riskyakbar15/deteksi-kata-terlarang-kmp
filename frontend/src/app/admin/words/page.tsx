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
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kata Terlarang</h1>
          <p className="text-gray-500">Kelola daftar kata-kata yang dilarang</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Kata</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kata..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Filter words"
          >
            <Filter className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : words && words.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Kata
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Kategori
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      Severity
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {words.items.map((word) => (
                    <tr
                      key={word.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {word.word}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            word.category === "profanity"
                              ? "bg-red-100 text-red-700"
                              : word.category === "hate_speech"
                                ? "bg-purple-100 text-purple-700"
                                : word.category === "spam"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {categories.find((c) => c.value === word.category)
                            ?.label || word.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${severityColors[word.severity]}`}
                        >
                          {word.severity}/5
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(word)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            word.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {word.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(word)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Edit word"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(word.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Menampilkan {(page - 1) * 15 + 1} -{" "}
                {Math.min(page * 15, words.total)} dari {words.total} kata
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {page} / {words.total_pages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(words.total_pages, p + 1))
                  }
                  disabled={page === words.total_pages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada kata terlarang ditemukan</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-label="Add or edit word modal"
        >
          <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingWord ? "Edit Kata" : "Tambah Kata Baru"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close add or edit word modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kata
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  placeholder="Masukkan kata terlarang"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Rendah</span>
                  <span>Tinggi</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
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
            className="fixed inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Hapus Kata?
            </h2>
            <p className="text-gray-500 mb-4">
              Apakah Anda yakin ingin menghapus kata ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
