import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Mic,
  Monitor,
  FlaskConical,
  Calculator,
  BookMarked,
  User,
} from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { getBooks } from "../../services/book.api";
import { getCategories } from "../../services/category.api";
import { getMyReservations } from "../../services/reservation.api";
import { getMyLoans } from "../../services/loan.api";

export default function BerandaMahasiswa() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);

  const [activityCount, setActivityCount] = useState({
    reservasi: 0,
    pinjaman: 0,
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getBooks();
      setBooks(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    }
  };

  const fetchActivityCount = async () => {
    try {
      const [reservationRes, loanRes] = await Promise.all([
        getMyReservations(),
        getMyLoans(),
      ]);

      const reservations = reservationRes.data.data || [];
      const loans = loanRes.data.data || [];

      setActivityCount({
        reservasi: reservations.filter(
          (item) => item.status === "MENUNGGU_PENGAMBILAN"
        ).length,
        pinjaman: loans.filter(
          (item) => item.status === "AKTIF" || item.status === "TERLAMBAT"
        ).length,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchActivityCount();
  }, []);

  const popularBooks = books.slice(0, 6);

  const fallbackCategories = [
    { id: "", nama: "Komputer" },
    { id: "", nama: "Sains" },
    { id: "", nama: "Matematika" },
    { id: "", nama: "Teknologi" },
  ];

  const categoryIconMap = {
    Komputer: Monitor,
    Sains: FlaskConical,
    Matematika: Calculator,
    Teknologi: BookMarked,
  };

  const displayedCategories =
    categories.length > 0 ? categories.slice(0, 4) : fallbackCategories;

  return (
    <MobileLayout role="mahasiswa">
      <div className="min-h-screen bg-white px-6 pt-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="w-8" />

          <h1 className="text-lg font-bold text-black">Beranda</h1>

          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full"
            >
              <Bell size={21} />

              {(activityCount.reservasi > 0 || activityCount.pinjaman > 0) && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl border bg-white p-4 text-left shadow-xl">
                <h3 className="mb-3 text-sm font-bold">Notifikasi</h3>

                <button
                  onClick={() => navigate("/mahasiswa/aktivitas")}
                  className="mb-3 w-full rounded-xl bg-yellow-50 p-3 text-left"
                >
                  <p className="text-sm font-bold">Reservasi Aktif</p>
                  <p className="text-xs text-gray-500">
                    Kamu punya {activityCount.reservasi} reservasi aktif.
                  </p>
                </button>

                <button
                  onClick={() => navigate("/mahasiswa/aktivitas")}
                  className="w-full rounded-xl bg-blue-50 p-3 text-left"
                >
                  <p className="text-sm font-bold">Pinjaman Aktif</p>
                  <p className="text-xs text-gray-500">
                    Kamu punya {activityCount.pinjaman} pinjaman aktif.
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/mahasiswa/search")}
          className="mb-6 flex h-12 w-full items-center gap-3 rounded-full border border-gray-400 bg-white px-4 text-left"
        >
          <Search size={20} className="text-gray-500" />

          <span className="flex-1 text-sm text-gray-500">
            Cari buku, Penulis, atau topik...
          </span>

          <Mic size={19} className="text-gray-500" />
        </button>

        <div className="mb-6 flex items-center justify-between rounded-xl bg-yellow-100 px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl">
              <User size={38} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-sm font-bold">Kartu Anggota</p>
              <p className="text-xs text-black">
                {user?.role === "MAHASISWA" ? "Mahasiswa" : user?.role || "-"}
              </p>
              <p className="mt-1 text-xs text-black">
                {user?.nimNidn || "-"}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-white">
            Aktif
          </span>
        </div>

        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Kategori</h2>

            <button
              onClick={() => navigate("/mahasiswa/search?showAll=1")}
              className="text-xs text-gray-400"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {displayedCategories.map((category) => {
              const Icon = categoryIconMap[category.nama] || BookMarked;

              const categoryUrl = category.id
                ? `/mahasiswa/search?categoryId=${
                    category.id
                  }&categoryName=${encodeURIComponent(category.nama)}`
                : `/mahasiswa/search?categoryName=${encodeURIComponent(
                    category.nama
                  )}`;

              return (
                <button
                  key={category.id || category.nama}
                  onClick={() => navigate(categoryUrl)}
                  className="flex flex-col items-center"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-200">
                    <Icon size={24} className="text-black" />
                  </div>

                  <span className="text-[11px] text-black">
                    {category.nama}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Buku Populer</h2>

            <button
              onClick={() => navigate("/mahasiswa/search?showAll=1")}
              className="text-xs text-gray-400"
            >
              Lihat Semua
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Memuat buku...
            </p>
          ) : popularBooks.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Belum ada buku.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-x-5 gap-y-6 pb-8">
              {popularBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => navigate(`/mahasiswa/books/${book.id}`)}
                  className="text-left"
                >
                  <div className="flex h-[118px] w-full items-center justify-center overflow-hidden rounded-md bg-white shadow-sm">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.judul}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-yellow-100 px-2 text-center text-[10px] font-bold text-black">
                        {book.judul}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}