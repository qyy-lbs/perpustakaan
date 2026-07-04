import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Mic,
  UserCircle,
  Bookmark,
  BookOpen,
  Clock,
} from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { getBooks } from "../../services/book.api";
import { useToast } from "../../components/ui/Toast";
import { getMySuggestions } from "../../services/suggestion.api";

export default function BerandaDosen() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);

  const [notifCount, setNotifCount] = useState({
    menunggu: 0,
    ditinjau: 0,
    disetujui: 0,
    ditolak: 0,
    tersedia: 0,
    total: 0,
  });
  const fetchNotifications = async () => {
    try {
      const response = await getMySuggestions();
      const data = response.data.data || [];

      const count = {
        menunggu: data.filter((item) => item.status === "MENUNGGU").length,
        ditinjau: data.filter((item) => item.status === "DITINJAU").length,
        disetujui: data.filter((item) => item.status === "DISETUJUI").length,
        ditolak: data.filter((item) => item.status === "DITOLAK").length,
        tersedia: data.filter((item) => item.status === "TERSEDIA").length,
      };

      setNotifCount({
        ...count,
        total:
          count.menunggu +
          count.ditinjau +
          count.disetujui +
          count.ditolak +
          count.tersedia,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await getBooks();
      const data = response.data.data || [];

      setBooks(data.slice(0, 6));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengambil rekomendasi buku",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchNotifications();
  }, []);
  return (
    <MobileLayout role="dosen">
      <div className="min-h-screen bg-white px-7 pt-10">
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <h1 className="text-base font-bold text-black">Beranda</h1>

          <div className="absolute right-0">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full"
            >
              <Bell size={20} />

              {notifCount.total > 0 && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl border bg-white p-4 text-left shadow-xl">
                <h3 className="mb-3 text-sm font-bold text-black">
                  Notifikasi
                </h3>

                {notifCount.total === 0 ? (
                  <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    Belum ada notifikasi usulan buku.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifCount.menunggu > 0 && (
                      <NotifItem
                        title="Usulan Diajukan"
                        description={`${notifCount.menunggu} usulan buku masih menunggu proses.`}
                        onClick={() => navigate("/dosen/usulan")}
                      />
                    )}

                    {notifCount.ditinjau > 0 && (
                      <NotifItem
                        title="Usulan Ditinjau"
                        description={`${notifCount.ditinjau} usulan sedang ditinjau pustakawan.`}
                        onClick={() => navigate("/dosen/usulan")}
                      />
                    )}

                    {notifCount.disetujui > 0 && (
                      <NotifItem
                        title="Usulan Disetujui"
                        description={`${notifCount.disetujui} usulan buku sudah disetujui.`}
                        onClick={() => navigate("/dosen/usulan")}
                      />
                    )}

                    {notifCount.ditolak > 0 && (
                      <NotifItem
                        title="Usulan Ditolak"
                        description={`${notifCount.ditolak} usulan buku ditolak.`}
                        onClick={() => navigate("/dosen/usulan")}
                        danger
                      />
                    )}

                    {notifCount.tersedia > 0 && (
                      <NotifItem
                        title="Buku Tersedia"
                        description={`${notifCount.tersedia} usulan sudah tersedia di perpustakaan.`}
                        onClick={() => navigate("/dosen/usulan")}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User */}
        <div className="mt-8 flex items-center gap-3">
          <UserCircle size={42} className="text-black" />

          <div>
            <h2 className="text-sm font-bold text-black">
              Halo, {user?.nama || "Dosen"}
            </h2>
            <p className="text-xs text-gray-500">Selamat datang</p>
          </div>
        </div>

        {/* Search */}
        <button
          onClick={() => navigate("/dosen/koleksi")}
          className="mt-7 flex h-11 w-full items-center gap-3 rounded-full border border-gray-400 px-4 text-left"
        >
          <Search size={18} className="text-gray-500" />

          <span className="flex-1 text-xs text-gray-500">
            Cari buku, jurnal, atau e-book...
          </span>

          <Mic size={17} className="text-gray-500" />
        </button>

        {/* Menu */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <MenuCard
            icon={Bookmark}
            title="Koleksi Digital"
            onClick={() => navigate("/dosen/koleksi")}
          />

          <MenuCard
            icon={BookOpen}
            title="Usulan Buku"
            onClick={() => navigate("/dosen/usulan/create")}
          />

          <MenuCard
            icon={Clock}
            title="Riwayat Usulan"
            onClick={() => navigate("/dosen/usulan")}
          />
        </div>

        {/* Rekomendasi */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">
              Rekomendasi untuk Anda
            </h2>

            <button
              onClick={() => navigate("/dosen/koleksi")}
              className="text-xs text-gray-400"
            >
              Lihat Semua
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Memuat rekomendasi...
            </p>
          ) : books.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Belum ada koleksi buku
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-x-6 gap-y-5 pb-8">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => navigate(`/dosen/koleksi/${book.id}`)}
                  className="text-left"
                >
                  <div className="flex h-[110px] w-full items-center justify-center overflow-hidden bg-white shadow-sm">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.judul}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-yellow-100 px-2 text-center text-[10px] font-bold">
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

function MenuCard({ icon: Icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-[88px] flex-col items-center justify-center rounded-lg bg-yellow-200 text-center"
    >
      <Icon size={30} className="text-black" />
      <span className="mt-2 text-xs leading-tight text-black">{title}</span>
    </button>
  );
}

function NotifItem({ title, description, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-3 text-left ${
        danger ? "bg-red-50 hover:bg-red-100" : "bg-yellow-50 hover:bg-yellow-100"
      }`}
    >
      <p className="text-sm font-bold text-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
    </button>
  );
}