import Link from "next/link";
import { requireUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/subjects" className="font-semibold text-slate-900">
            Учебный сайт
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {session.role === "ADMIN" && (
              <Link href="/admin" className="text-slate-600 hover:text-slate-900">
                Панель админа
              </Link>
            )}
            <span>{session.fullName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
