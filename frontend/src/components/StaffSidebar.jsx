import {
  Home,
  QrCode,
  Undo2,
  Box,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function StaffSidebar({ open, onToggle }) {
  const navigate = useNavigate();

  const menus = [
    { label: "Dashboard", path: "/pustakawan/dashboard", icon: Home },
    { label: "Validasi Booking", path: "/pustakawan/validasi-booking", icon: QrCode },
    { label: "Pengembalian", path: "/pustakawan/pengembalian", icon: Undo2 },
    { label: "Inventaris", path: "/pustakawan/inventaris", icon: Box },
    { label: "Persetujuan Usulan", path: "/pustakawan/usulan", icon: ClipboardList },
    { label: "Laporan", path: "/pustakawan/laporan", icon: FileText },
    { label: "Pengaturan", path: "/pustakawan/pengaturan", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-[#FFE58A] transition-all duration-300 ${
        open ? "w-[280px]" : "w-[86px]"
      }`}
    >
      <div className="flex h-full flex-col px-4 py-6">
        <button
          onClick={onToggle}
          className="mb-10 flex h-11 w-11 items-center justify-center rounded-lg text-black hover:bg-yellow-300"
        >
          <Menu size={30} />
        </button>

        <nav className="flex-1 space-y-3">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                title={menu.label}
                className={({ isActive }) =>
                  `flex h-14 items-center gap-4 rounded-lg px-4 text-lg font-medium transition ${
                    isActive
                      ? "bg-yellow-400 text-black"
                      : "text-black/50 hover:bg-yellow-300/70"
                  } ${open ? "justify-start" : "justify-center"}`
                }
              >
                <Icon size={28} strokeWidth={2.3} />

                {open && <span className="leading-tight">{menu.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          title="Keluar"
          className={`flex h-14 items-center gap-4 rounded-lg px-4 text-lg font-medium text-black/50 transition hover:bg-yellow-300/70 ${
            open ? "justify-start" : "justify-center"
          }`}
        >
          <LogOut size={28} strokeWidth={2.3} />
          {open && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}