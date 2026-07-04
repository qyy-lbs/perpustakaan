import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, Bookmark } from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { getBooks } from "../../services/book.api";
import { useToast } from "../../components/ui/Toast";

export default function KoleksiDigital() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("SEMUA");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchBooks = async () => {
  try {
    setLoading(true);

    const response = await getBooks({
      search: keyword || undefined,
    });

    let data = response.data.data || [];

    if (filter !== "SEMUA") {
      data = data.filter((book) => book.jenisKoleksi === filter);
    }

    setBooks(data);
  } catch (error) {
    showToast(
      error.response?.data?.message || "Gagal mengambil koleksi buku",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBooks();
  }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <MobileLayout role="dosen">
      <div className="min-h-screen bg-white px-7 pt-10">
        <h1 className="text-center text-base font-bold text-black">
          Koleksi Buku
        </h1>

        <form
          onSubmit={handleSearch}
          className="mt-9 flex h-10 items-center gap-3 rounded-full border border-gray-300 px-4"
        >
          <Search size={16} className="text-gray-500" />

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari buku, e-book atau jurnal..."
            className="flex-1 text-xs outline-none"
          />

          <button type="button">
            <Mic size={16} className="text-gray-500" />
          </button>
        </form>

        <div className="mt-6 flex gap-3">
       <FilterButton
  active={filter === "SEMUA"}
  onClick={() => setFilter("SEMUA")}
>
  Semua
</FilterButton>

<FilterButton
  active={filter === "FISIK"}
  onClick={() => setFilter("FISIK")}
>
  Buku
</FilterButton>

<FilterButton
  active={filter === "EBOOK"}
  onClick={() => setFilter("EBOOK")}
>
  E-book
</FilterButton>
        </div>

        <div className="mt-8 space-y-5 pb-8">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Memuat koleksi buku...
            </p>
          ) : books.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Koleksi buku tidak ditemukan.
            </p>
          ) : (
            books.map((book) => (
              <button
                key={book.id}
                onClick={() => navigate(`/dosen/koleksi/${book.id}`)}
                className="flex w-full items-center gap-4 border-b border-gray-200 pb-5 text-left"
              >
                <div className="flex h-[95px] w-[62px] shrink-0 items-center justify-center overflow-hidden bg-gray-100">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.judul}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-yellow-100 px-1 text-center text-[9px] font-bold">
                      {book.judul}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-bold text-black">
                    {book.judul}
                  </h2>

                  <p className="mt-2 text-xs text-black">
                    {book.pengarang || "-"}
                  </p>

                  <p className="mt-2 text-xs text-black">
                    {book.tahunTerbit || "-"}
                  </p>
                </div>

                <Bookmark size={28} className="shrink-0 text-black" />
              </button>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-2 text-xs ${
        active
          ? "bg-yellow-300 text-black"
          : "border border-gray-300 bg-white text-black"
      }`}
    >
      {children}
    </button>
  );
}