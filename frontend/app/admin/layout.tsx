"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  MessageSquareWarning,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Kata Terlarang", href: "/admin/words", icon: MessageSquareWarning },
  { name: "Statistik", href: "/admin/statistics", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    toast.success("Logout berhasil");
    router.push("/login");
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-slate-950/92 shadow-2xl backdrop-blur-xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
              <Shield className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
                Moderation console
              </p>
              <span className="block font-semibold text-white">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
                <User className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-slate-400">
                  {user?.is_admin ? "Administrator" : "User"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                ← Halaman utama
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
