import { Home, Search, Clock, User, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomNav({ role = "mahasiswa" }) {
  const isDosen = role === "dosen";

  const menus = isDosen
    ? [
        { label: "Beranda", path: "/dosen/beranda", icon: Home },
        { label: "Koleksi", path: "/dosen/koleksi", icon: BookOpen },
        { label: "Usulan", path: "/dosen/usulan", icon: Clock },
        { label: "Profil", path: "/dosen/profil", icon: User },
      ]
    : [
        { label: "Beranda", path: "/mahasiswa/beranda", icon: Home },
        { label: "Cari", path: "/mahasiswa/search", icon: Search },
        { label: "Aktivitas", path: "/mahasiswa/aktivitas", icon: Clock },
        { label: "Profil", path: "/mahasiswa/profil", icon: User },
      ];

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t bg-white px-4 py-2">
      <div className="flex items-center justify-between">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${
                  isActive ? "text-yellow-500 font-semibold" : "text-gray-500"
                }`
              }
            >
              <Icon size={22} />
              <span>{menu.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}