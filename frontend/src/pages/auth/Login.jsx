import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/auth.api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const redirectByRole = (role) => {
    if (role === "MAHASISWA") {
      navigate("/mahasiswa/beranda");
    } else if (role === "DOSEN") {
      navigate("/dosen/beranda");
    } else if (role === "PUSTAKAWAN") {
      navigate("/pustakawan/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await loginUser(form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      redirectByRole(response.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-white px-8 py-10">
        <h1 className="text-center text-xl font-bold">Login</h1>

        <div className="mt-14 flex justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black text-5xl text-white">
            👤
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-xl font-bold">Selamat Datang!</h2>
          <p className="mt-1 text-sm text-gray-500">Masuk untuk melanjutkan</p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border px-5 outline-none"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Kata Sandi"
              value={form.password}
              onChange={handleChange}
              className="h-14 w-full rounded-2xl border px-5 pr-14 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <button
            disabled={loading}
            className="h-14 w-full rounded-2xl bg-yellow-400 font-bold text-black shadow-md"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link to="/register" className="font-semibold text-black underline">
            Daftar disini
          </Link>
        </p>
      </div>
    </div>
  );
}
