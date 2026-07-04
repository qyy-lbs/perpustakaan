import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import bgGedung from "../../assets/image/perpus.png";
import logoKampus from "../../assets/image/logo_uin.png";
import logoBuku from "../../assets/image/gambar_buku.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!token || !user) {
        navigate("/login");
        return;
      }

      if (user.role === "MAHASISWA") {
        navigate("/mahasiswa/beranda");
      } else if (user.role === "DOSEN") {
        navigate("/dosen/beranda");
      } else if (user.role === "PUSTAKAWAN") {
        navigate("/pustakawan/dashboard");
      } else {
        navigate("/login");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative mx-auto min-h-screen max-w-[430px] overflow-hidden bg-white">
        {/* Background gedung */}
        <img
          src={bgGedung}
          alt="Background Gedung"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay kuning transparan */}
        <div className="absolute inset-0 bg-yellow-400/55" />

        {/* Konten */}
        <div className="relative z-10 flex min-h-screen flex-col items-center px-8 py-14 text-center text-white">
          <div className="mt-10">
            <img
              src={logoKampus}
              alt="Logo Kampus"
              className="mx-auto w-44 object-contain"
            />
          </div>

          <div className="mt-8">
            <img
              src={logoBuku}
              alt="Logo Perpustakaan"
              className="mx-auto w-28 object-contain"
            />
          </div>

          <h1 className="mt-4 text-[20px] font-bold leading-tight">
            Perpustakaan
          </h1>

          <h2 className="mt-2 text-[18px] font-semibold leading-snug">
            Fakultas Sains dan Teknologi
          </h2>

          <p className="mt-auto mb-6 text-base font-medium">
            Akses ilmu, raih masa depan
          </p>

          {/* Progress bar */}
          <div className="w-full px-4">
            <div className="h-1.5 w-full rounded-full bg-white/50">
              <div className="h-1.5 w-[85%] rounded-full bg-blue-600" />
            </div>
          </div>

          <p className="mt-3 text-sm font-medium">Memuat...</p>
        </div>
      </div>
    </div>
  );
}