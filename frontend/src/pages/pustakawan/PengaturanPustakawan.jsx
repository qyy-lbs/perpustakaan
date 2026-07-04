import { useState } from "react";
import { UserCircle, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import { useToast } from "../../components/ui/Toast";

export default function PengaturanPustakawan() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    role: user?.role || "PUSTAKAWAN",
    nimNidn: user?.nimNidn || "",
    noTelepon: user?.noTelepon || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...form,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    showToast("Pengaturan berhasil disimpan", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <StaffLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-black">Pengaturan</h1>
        <p className="mt-2 text-lg text-gray-500">
          Kelola profil akun pustakawan
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <UserCircle size={58} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black">
                Profil Pustakawan
              </h2>
              <p className="text-gray-500">
                Informasi akun yang sedang digunakan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Input
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="ID Pustakawan"
              name="nimNidn"
              value={form.nimNidn}
              onChange={handleChange}
            />

            <Input
              label="Nomor Telepon"
              name="noTelepon"
              value={form.noTelepon}
              onChange={handleChange}
            />

            <Input
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="flex h-12 items-center gap-2 rounded-lg bg-yellow-400 px-8 text-lg font-bold text-white shadow-md"
            >
              <Save size={22} />
              Simpan
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
          <h2 className="text-2xl font-bold text-black">Akun</h2>

          <p className="mt-2 text-gray-500">
            Keluar dari sistem perpustakaan.
          </p>

          <button
            onClick={handleLogout}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-lg font-bold text-white"
          >
            <LogOut size={22} />
            Keluar
          </button>
        </div>
      </div>
    </StaffLayout>
  );
}

function Input({ label, name, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-black">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-12 w-full rounded-lg border border-gray-300 px-4 outline-none focus:border-yellow-400 disabled:bg-gray-100"
      />
    </div>
  );
}