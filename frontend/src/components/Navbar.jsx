import { useAuth } from "../context/AuthContext";

export default function Navbar({ onNewTask }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            T
          </div>
          <span className="text-lg font-semibold text-slate-900">Task Manager</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewTask}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 sm:px-4"
          >
            + New Task
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-sm text-slate-600">{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
