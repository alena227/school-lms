import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="font-semibold text-slate-900">
              Учебный сайт · Админ
            </span>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/admin/lessons"
                className="text-slate-600 hover:text-slate-900"
              >
                Уроки
              </Link>
              <Link
                href="/admin/users"
                className="text-slate-600 hover:text-slate-900"
              >
                Ученики
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{session.fullName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
