import { useNavigate } from "react-router-dom";
import { LogOut, Mail, Phone, User, GraduationCap } from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";

export default function Profile({ role = "mahasiswa" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <MobileLayout role={role}>
      <div className="bg-yellow-400 px-6 pb-8 pt-10">
        <h1 className="text-xl font-bold">Profil</h1>
        <p className="mt-1 text-sm text-black/70">
          Informasi akun pengguna
        </p>
      </div>

      <div className="-mt-5 px-6">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black text-4xl text-white">
            👤
          </div>

          <h2 className="mt-5 text-xl font-bold">{user?.nama || "-"}</h2>
          <p className="mt-1 text-sm text-gray-500">{user?.role || "-"}</p>

          <div className="mt-6 space-y-4 text-left">
            <ProfileItem icon={Mail} label="Email" value={user?.email} />
            <ProfileItem
              icon={User}
              label={user?.role === "DOSEN" ? "NIDN" : "NIM"}
              value={user?.nimNidn}
            />
            <ProfileItem icon={Phone} label="No Telepon" value={user?.noTelepon} />
            <ProfileItem icon={GraduationCap} label="Prodi" value={user?.prodi} />
          </div>

          <button
            onClick={handleLogout}
            className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-100 font-bold text-red-700"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="rounded-xl bg-yellow-100 p-3">
        <Icon size={20} className="text-yellow-600" />
      </div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold">{value || "-"}</p>
      </div>
    </div>
  );
}