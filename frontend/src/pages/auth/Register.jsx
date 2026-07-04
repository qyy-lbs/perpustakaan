import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth.api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MAHASISWA",
    nimNidn: "",
    noTelepon: "",
    prodi: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sama");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        nama: form.nama,
        email: form.email,
        password: form.password,
        role: form.role,
        nimNidn: form.nimNidn,
        noTelepon: form.noTelepon,
        prodi: form.prodi,
      });

      alert("Registrasi berhasil. Silakan login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white px-8 py-10">
        <h1 className="text-center text-xl font-bold">Registrasi</h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          Buat akun untuk mengakses perpustakaan
        </p>

        {error && (
          <div className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Nama Lengkap"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div>
            <label className="mb-2 block text-sm font-semibold">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="h-12 w-full rounded-2xl border px-4 outline-none"
            >
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="DOSEN">Dosen</option>
            </select>
          </div>

          <Input
            label={form.role === "DOSEN" ? "NIDN" : "NIM"}
            name="nimNidn"
            value={form.nimNidn}
            onChange={handleChange}
            required
          />

          <Input
            label="Nomor Telepon"
            name="noTelepon"
            value={form.noTelepon}
            onChange={handleChange}
          />

          <Input
            label="Program Studi"
            name="prodi"
            value={form.prodi}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Konfirmasi Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            disabled={loading}
            className="h-14 w-full rounded-2xl bg-yellow-400 font-bold text-black"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-black underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="h-12 w-full rounded-2xl border px-4 outline-none"
      />
    </div>
  );
}