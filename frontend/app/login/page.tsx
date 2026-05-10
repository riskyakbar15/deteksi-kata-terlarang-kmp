"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, LogIn, LockKeyhole, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Username dan password harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(username, password);
      setAuth(response.user, response.access_token);

      toast.success("Login berhasil!");

      // Check if user must change password
      if (response.user.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/admin");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Username atau password salah",
      );
    } finally {
      setIsLoading(false);
    }
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/40 bg-white/78 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:grid-cols-[1fr_0.95fr]">
          <div className="relative overflow-hidden bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_28%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-3 text-white/90">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <Shield className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                    Admin Panel
                  </p>
                  <p className="text-base font-semibold">Deteksi Kata Terlarang</p>
                </div>
              </Link>

              <div className="mt-12 max-w-md">
                <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  Secure access area
                </div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Masuk ke dashboard yang lebih tenang, rapi, dan aman.
                </h1>
                <p className="mt-5 text-base leading-7 text-slate-300">
                  Akses admin untuk mengelola kata terlarang, membaca statistik,
                  dan menjaga percakapan tetap aman.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    "Autentikasi JWT",
                    "Panel admin terpusat",
                    "Validasi kata cepat",
                    "Statistik real-time",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex items-center gap-3 text-sm text-slate-300">
                <LockKeyhole className="h-5 w-5 text-cyan-300" />
                Akses khusus untuk pengelolaan konten dan monitoring.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
            <div className="w-full max-w-md">
              <div className="surface-strong rounded-[1.75rem] p-6 sm:p-8">
                <div className="mb-8 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Selamat datang
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Masuk ke dashboard
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Gunakan kredensial admin untuk mengakses fitur pengelolaan.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>{isLoading ? "Memproses..." : "Masuk"}</span>
                  </button>
                </form>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
                  <p>
                    <strong>Default Login:</strong> admin / admin123
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600"
                  >
                    ← Kembali ke halaman utama
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
