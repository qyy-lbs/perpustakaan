import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { getBookById } from "../../services/book.api";
import { useToast } from "../../components/ui/Toast";

export default function DetailEbook() {
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
      showToast(
        error.response?.data?.message || "Gagal mengambil detail e-book",
        "error"
      );
      navigate("/dosen/koleksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleReadOnline = () => {
    if (!book?.fileUrl) {
      showToast("File digital belum tersedia", "error");
      return;
    }

    window.open(book.fileUrl, "_blank");
  };

  const handleDownload = () => {
    if (!book?.fileUrl) {
      showToast("File digital belum tersedia", "error");
      return;
    }

    const link = document.createElement("a");
    link.href = book.fileUrl;
    link.target = "_blank";
    link.download = `${book.judul || "ebook"}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <MobilePlain>
        <p className="p-6 text-sm text-gray-500">Memuat detail e-book...</p>
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

          <h1 className="text-base font-bold">Detail E-Book</h1>
        </div>

        <div className="mt-12 flex gap-5">
          <div className="flex h-[120px] w-[80px] shrink-0 items-center justify-center overflow-hidden bg-gray-100">
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

          <div className="flex-1">
            <h2 className="line-clamp-2 text-sm font-bold text-black">
              {book.judul}
            </h2>

            <p className="mt-2 text-xs text-black">
              {book.pengarang || "-"}
            </p>

            <div className="mt-3 flex items-center gap-1">
              <Star size={15} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-black">4.9</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 px-7 py-5">
        <Info label="Penerbit" value={book.penerbit || "-"} />
        <Info label="Tahun Terbit" value={book.tahunTerbit || "-"} />
        <Info label="Bahasa" value={book.bahasa || "-"} />
        <Info label="Jumlah Halaman" value={book.jumlahHalaman || "-"} />
      </div>

      <div className="border-t border-gray-200 px-7 py-5">
        <h2 className="font-bold">Deskripsi</h2>

        <p className="mt-4 text-sm leading-6 text-black">
          {book.deskripsi || "Belum ada deskripsi e-book."}
        </p>
      </div>

      <div className="mt-16 space-y-3 px-7">
        <button
          onClick={handleReadOnline}
          className="h-12 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white shadow-md"
        >
          Baca Online
        </button>

        <button
          onClick={handleDownload}
          className="h-12 w-full rounded-lg border border-gray-400 text-sm font-bold text-gray-600"
        >
          Unduh PDF
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