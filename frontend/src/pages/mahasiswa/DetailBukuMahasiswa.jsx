import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { getBookById } from "../../services/book.api";
import { useToast } from "../../components/ui/Toast";

export default function DetailBukuMahasiswa() {
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
      showToast(error.response?.data?.message || "Gagal mengambil detail buku", "error");
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
        <p className="p-6 text-sm text-gray-500">Memuat detail buku...</p>
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

          <h1 className="text-base font-bold">Detail Buku</h1>
        </div>

        <div className="mt-12 flex gap-5">
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

            <div className="mt-2 flex items-center gap-1">
              <Star size={15} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-black">4.8</span>
            </div>

            <span className="mt-2 inline-block rounded-md bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
              {book.stokTersedia > 0 ? "Tersedia" : "Tidak Tersedia"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 px-7 py-5">
        <Info label="ISBN" value={book.isbn || "-"} />
        <Info label="Penerbit" value={book.penerbit || "-"} />
        <Info label="Tahun Terbit" value={book.tahunTerbit || "-"} />
        <Info label="Kategori" value={book.category?.nama || "-"} />
        <Info label="Lokasi Rak" value={book.rack?.kodeRak || "-"} />
        <Info label="Jumlah Halaman" value={book.jumlahHalaman || "-"} />
      </div>

      <div className="border-t border-gray-200 px-7 py-5">
        <h2 className="font-bold">Deskripsi</h2>
        <p className="mt-4 text-sm leading-6 text-black">
          {book.deskripsi || "Belum ada deskripsi buku."}
        </p>
      </div>

      <div className="mt-10 px-7">
        <button
          disabled={book.stokTersedia <= 0}
          onClick={() => navigate(`/mahasiswa/booking/${book.id}`)}
          className="h-12 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white disabled:bg-gray-300"
        >
          Booking Buku
        </button>
      </div>
    </MobilePlain>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-4 grid grid-cols-2 text-sm">
      <p className="text-black">{label}</p>
      <p className="text-black">{value}</p>
    </div>
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