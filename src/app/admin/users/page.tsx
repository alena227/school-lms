"use client";

import { useEffect, useState } from "react";

type StudentUser = {
  id: string;
  username: string;
  fullName: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdCred, setCreatedCred] = useState<{
    username: string;
    password: string;
  } | null>(null);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreatedCred(null);
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, fullName }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось создать ученика");
      return;
    }
    setCreatedCred({ username: data.user.username, password: data.password });
    setUsername("");
    setFullName("");
    loadUsers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить ученика? Все его сдачи тоже будут удалены.")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    loadUsers();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ученики</h1>
        <p className="text-sm text-slate-500 mt-1">
          Только вы можете создавать аккаунты учеников — самостоятельная
          регистрация недоступна.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 max-w-md"
      >
        <h2 className="font-medium text-slate-900">Новый ученик</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Имя ученика
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder="Иванов Иван"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Логин (латиницей)
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder="ivanov_i"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-slate-900 text-white text-sm font-medium py-2 px-4 hover:bg-slate-800 disabled:opacity-60"
        >
          {creating ? "Создание..." : "Создать"}
        </button>
      </form>

      {createdCred && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md text-sm">
          <p className="font-medium text-emerald-900 mb-1">
            Ученик создан. Сохраните пароль — он больше не будет показан:
          </p>
          <p className="text-emerald-800">
            Логин: <span className="font-mono">{createdCred.username}</span>
            <br />
            Пароль: <span className="font-mono">{createdCred.password}</span>
          </p>
        </div>
      )}

      <div>
        <h2 className="font-medium text-slate-900 mb-3">
          Список учеников ({users.length})
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Загрузка...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">Пока нет учеников.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {u.fullName}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {u.username}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
