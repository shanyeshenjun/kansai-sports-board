import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { LanguageProvider, LanguageSwitcher, T } from "@/components/language-ui";
import { MemberNav } from "@/components/member-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "関西スポーツ掲示板",
  description: "関西のスポーツ活動を探して参加できる掲示板MVP"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <LanguageProvider>
          <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="min-w-0">
                <div className="truncate text-sm font-black text-slate-950 sm:text-base">
                  <T textKey="appName" />
                </div>
                <div className="text-xs font-medium text-slate-500">Kansai Sports Board</div>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <LanguageSwitcher />
                <MemberNav />
                <Link className="touch-target hidden items-center justify-center rounded-md border border-line px-3 text-sm font-bold sm:inline-flex" href="/admin">
                  管理画面
                </Link>
              </div>
            </div>
          </header>
          {children}
          <footer className="border-t border-line bg-white">
            <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-4 py-5 text-xs font-bold text-slate-500">
              <Link href="/terms">利用規約</Link>
              <Link href="/privacy">プライバシーポリシー</Link>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
