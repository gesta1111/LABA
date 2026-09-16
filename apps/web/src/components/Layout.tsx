import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">
            ХолодМонитор
          </NavLink>
        </div>
        <div className="flex-none gap-2">
          <NavLink to="/" className="btn btn-ghost">
            Холодильники
          </NavLink>
          <NavLink to="/alerts" className="btn btn-ghost">
            Оповещения
          </NavLink>
        </div>
      </div>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
