import { NavLink, Outlet } from "react-router-dom";
import { SearchBar } from "../components/ui/SearchBar";

const navItems = [
  { to: "/", label: "ADRs" },
  { to: "/graph", label: "Graph" },
  { to: "/sources", label: "Sources" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="text-lg font-bold text-gray-900">
              ADR Atlas
            </NavLink>
            <nav className="flex gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <SearchBar />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
