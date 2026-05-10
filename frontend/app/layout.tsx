import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deteksi Kata Terlarang | KMP Algorithm",
  description:
    "Aplikasi deteksi kata terlarang pada chat menggunakan algoritma Knuth-Morris-Pratt (KMP)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#f8fafc_45%,_#f8fafc_100%)]" />
          <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute right-[-6rem] top-[18rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className={spaceGrotesk.className}>{children}</div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(15, 23, 42, 0.95)",
              color: "#fff",
              border: "1px solid rgba(148, 163, 184, 0.2)",
            },
            success: {
              style: {
                background: "#16a34a",
              },
            },
            error: {
              style: {
                background: "#dc2626",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
