import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { getBookById } from "../../services/book.api";
import { useToast } from "../../components/ui/Toast";

export default function BookingBuku() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      setLoading(true);

      const response = await getBookById(id);
      setBook(response.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal mengambil data buku", "error");
      navigate("/mahasiswa/search");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <MobilePlain>
        <p className="p-6 text-sm text-gray-500">Memuat data booking...</p>
      </MobilePlain>
    );
  }

  return (
    <MobilePlain>
      <div className="px-7 pt-10">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-base font-bold">Booking Buku</h1>
        </div>

        <div className="mt-10 flex gap-5">
          <div className="flex h-[110px] w-[78px] shrink-0 items-center justify-center overflow-hidden bg-gray-100">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.judul}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="px-2 text-center text-[10px] font-bold">
                {book.judul}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="line-clamp-2 text-sm font-bold text-black">
              {book.judul}
            </h2>
            <p className="mt-2 text-xs text-black">{book.pengarang}</p>
            <p className="mt-2 text-xs text-black">{book.tahunTerbit || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-200 px-7 py-5">
        <h2 className="mb-4 font-bold">Informasi Peminjaman</h2>

        <div className="mb-4 grid grid-cols-2 text-sm">
          <p>Durasi Pinjam</p>
          <p className="text-right">7 Hari</p>
        </div>

        <div className="grid grid-cols-2 text-sm">
          <p>Maks. Pengambilan</p>
          <p className="text-right">24 Jam</p>
        </div>
      </div>

      <div className="border-t border-gray-200 px-7 py-7">
        <h2 className="mb-4 font-bold">Pilih Tanggal Pengambilan</h2>

        <button
          type="button"
          onClick={() => navigate(`/mahasiswa/booking/${book.id}/pilih-waktu`)}
          className="h-11 w-full rounded-lg border border-gray-300 px-4 text-left text-sm text-gray-500"
        >
          Pilih tanggal dan waktu pengambilan
        </button>

        <div className="mt-6 flex gap-3 rounded-lg bg-yellow-100 p-4">
          <Info size={20} className="shrink-0 text-yellow-700" />
          <p className="text-sm leading-6 text-black">
            Anda harus mengambil buku sebelum 24 jam. Jika lewat, booking akan
            dibatalkan otomatis.
          </p>
        </div>
      </div>

      <div className="mt-10 px-7">
        <button
          onClick={() => navigate(`/mahasiswa/booking/${book.id}/pilih-waktu`)}
          className="h-12 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white"
        >
          Lanjutkan
        </button>
      </div>
    </MobilePlain>
  );
}

function MobilePlain({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white">
        {children}
      </div>
    </div>
  );
}