import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import BerandaMahasiswa from "./pages/mahasiswa/BerandaMahasiswa";
import BerandaDosen from "./pages/dosen/BerandaDosen";
import DashboardPustakawan from "./pages/pustakawan/DashboardPustakawan";
import ManajemenInventaris from "./pages/pustakawan/ManajemenInventaris";
import TambahBuku from "./pages/pustakawan/TambahBuku";
import EditBuku from "./pages/pustakawan/EditBuku";
import SearchBuku from "./pages/mahasiswa/SearchBuku";
import DetailBukuMahasiswa from "./pages/mahasiswa/DetailBukuMahasiswa";
import BookingBuku from "./pages/mahasiswa/BookingBuku";
import QRReservasi from "./pages/mahasiswa/QRReservasi";
import AktivitasSaya from "./pages/mahasiswa/AktivitasSaya";
import ValidasiBooking from "./pages/pustakawan/ValidasiBooking";
import PengembalianBuku from "./pages/pustakawan/PengembalianBuku";
import KoleksiDigital from "./pages/dosen/KoleksiDigital";
import DetailEbook from "./pages/dosen/DetailEbook";
import UsulanBuku from "./pages/dosen/UsulanBuku";
import FormUsulanBuku from "./pages/dosen/FormUsulanBuku";
import TrackerUsulan from "./pages/dosen/TrackerUsulan";
import PersetujuanUsulan from "./pages/pustakawan/PersetujuanUsulan";
import LaporanPustakawan from "./pages/pustakawan/LaporanPustakawan";
import SplashScreen from "./pages/auth/SplashScreen";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import PilihWaktuPengambilan from "./pages/mahasiswa/PilihWaktuPengambilan";
import PengaturanPustakawan from "./pages/pustakawan/PengaturanPustakawan";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/pustakawan/inventaris"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <ManajemenInventaris />
    </ProtectedRoute>
  }
/>

<Route
  path="/mahasiswa/booking/:id/pilih-waktu"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <PilihWaktuPengambilan />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/inventaris/tambah"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <TambahBuku />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/pengaturan"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <PengaturanPustakawan />
    </ProtectedRoute>
  }
/>

<Route
  path="/dosen/koleksi"
  element={
    <ProtectedRoute allowedRoles={["DOSEN"]}>
      <KoleksiDigital />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/laporan"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <LaporanPustakawan />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/usulan"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <PersetujuanUsulan />
    </ProtectedRoute>
  }
/>

<Route
  path="/dosen/koleksi/:id"
  element={
    <ProtectedRoute allowedRoles={["DOSEN"]}>
      <DetailEbook />
    </ProtectedRoute>
  }
/>

<Route
  path="/dosen/usulan"
  element={
    <ProtectedRoute allowedRoles={["DOSEN"]}>
      <UsulanBuku />
    </ProtectedRoute>
  }
/>

<Route
  path="/dosen/usulan/create"
  element={
    <ProtectedRoute allowedRoles={["DOSEN"]}>
      <FormUsulanBuku />
    </ProtectedRoute>
  }
/>

<Route
  path="/dosen/usulan/:id"
  element={
    <ProtectedRoute allowedRoles={["DOSEN"]}>
      <TrackerUsulan />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/validasi-booking"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <ValidasiBooking />
    </ProtectedRoute>
  }
/>

<Route
  path="/mahasiswa/search"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <SearchBuku />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/pengembalian"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <PengembalianBuku />
    </ProtectedRoute>
  }
/>

<Route
  path="/mahasiswa/books/:id"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <DetailBukuMahasiswa />
    </ProtectedRoute>
  }
/>

<Route
  path="/mahasiswa/booking/:id"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <BookingBuku />
    </ProtectedRoute>
  }
/>

<Route
  path="/mahasiswa/qr-reservasi/:id"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <QRReservasi />
    </ProtectedRoute>
  }
/>

<Route
  path="/mahasiswa/aktivitas"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <AktivitasSaya />
    </ProtectedRoute>
  }
/>

<Route
  path="/pustakawan/inventaris/:id/edit"
  element={
    <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
      <EditBuku />
    </ProtectedRoute>
  }
/>
        <Route path="/" element={<SplashScreen />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

        <Route
          path="/mahasiswa/beranda"
          element={
            <ProtectedRoute allowedRoles={["MAHASISWA"]}>
              <BerandaMahasiswa />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dosen/beranda"
          element={
            <ProtectedRoute allowedRoles={["DOSEN"]}>
              <BerandaDosen />
            </ProtectedRoute>
          }
        />

        <Route
  path="/mahasiswa/profil"
  element={
    <ProtectedRoute allowedRoles={["MAHASISWA"]}>
      <Profile role="mahasiswa" />
    </ProtectedRoute>
  }
/>

<Route
  path="/dosen/profil"
  element={
    <ProtectedRoute allowedRoles={["DOSEN"]}>
      <Profile role="dosen" />
    </ProtectedRoute>
  }
/>

        <Route
          path="/pustakawan/dashboard"
          element={
            <ProtectedRoute allowedRoles={["PUSTAKAWAN"]}>
              <DashboardPustakawan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}