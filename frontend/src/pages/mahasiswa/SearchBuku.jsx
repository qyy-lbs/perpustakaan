import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Mic, Clock } from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { getBooks } from "../../services/book.api";
import { getCategories } from "../../services/category.api";

export default function SearchBuku() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryIdFromUrl = searchParams.get("categoryId") || "";
  const categoryNameFromUrl = searchParams.get("categoryName") || "";
  const showAllFromUrl = searchParams.get("showAll") === "1";

  const [keyword, setKeyword] = useState("");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(categoryIdFromUrl);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const SEARCH_HISTORY_KEY = "mahasiswaSearchHistory";

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const saveHistory = (value) => {
    const cleanKeyword = value.trim();

    if (!cleanKeyword) return;

    const updated = [
      cleanKeyword,
      ...history.filter(
        (item) => item.toLowerCase() !== cleanKeyword.toLowerCase()
      ),
    ].slice(0, 5);

    setHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const handleSearch = async (e, customKeyword, customCategoryId) => {
    if (e) e.preventDefault();

    const finalKeyword = customKeyword ?? keyword;
    const finalCategoryId =
      customCategoryId !== undefined ? customCategoryId : selectedCategoryId;

    try {
      setLoading(true);
      setSearched(true);

      const response = await getBooks({
        search: finalKeyword || undefined,
        categoryId: finalCategoryId || undefined,
      });

      let result = response.data.data || [];

      if (!finalCategoryId && categoryNameFromUrl) {
        result = result.filter(
          (book) =>
            String(book.category?.nama || "").toLowerCase() ===
            categoryNameFromUrl.toLowerCase()
        );
      }

      if (selectedYear) {
        result = result.filter(
          (book) => String(book.tahunTerbit || "") === selectedYear
        );
      }

      if (selectedLanguage) {
        result = result.filter(
          (book) =>
            String(book.bahasa || "").toLowerCase() ===
            selectedLanguage.toLowerCase()
        );
      }

      setBooks(result);
      saveHistory(finalKeyword);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategoryId(categoryIdFromUrl);
    }

    if (categoryIdFromUrl || categoryNameFromUrl || showAllFromUrl) {
      setSearched(true);

      const timer = setTimeout(() => {
        handleSearch(null, "", categoryIdFromUrl);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [categoryIdFromUrl, categoryNameFromUrl, showAllFromUrl]);

  return (
    <MobileLayout role="mahasiswa">
      <div className="min-h-screen bg-white pt-8">
        <div className="relative flex items-center justify-center px-6">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-6 flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-base font-bold">Search</h1>
        </div>

        <div className="px-6 pt-16">
          <form
            onSubmit={handleSearch}
            className="flex h-12 items-center gap-3 rounded-full border border-gray-400 px-4"
          >
            <Search size={19} className="text-gray-500" />

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Masukkan kata kunci..."
              className="flex-1 text-sm outline-none"
            />

            <button type="button">
              <Mic size={19} className="text-gray-500" />
            </button>
          </form>

          <div className="mt-7">
            <h2 className="mb-4 text-base font-bold">Filter</h2>

            <div className="flex gap-3">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="h-9 rounded-lg bg-yellow-200 px-3 text-sm font-medium outline-none"
              >
                <option value="">Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nama}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-9 rounded-lg bg-yellow-200 px-3 text-sm font-medium outline-none"
              >
                <option value="">Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-9 rounded-lg bg-yellow-200 px-3 text-sm font-medium outline-none"
              >
                <option value="">Bahasa</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Inggris">Inggris</option>
              </select>
            </div>

            <button
              onClick={(e) => handleSearch(e)}
              className="mt-4 h-10 rounded-lg bg-black px-5 text-sm font-bold text-white"
            >
              Terapkan Filter
            </button>
          </div>
        </div>

        <div className="mt-8 border-t" />

        <div className="px-6 py-7">
          {!searched ? (
            <>
              <h2 className="mb-5 text-base font-bold">Riwayat Pencarian</h2>

              <div>
                {history.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Belum ada riwayat pencarian.
                  </p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item}
                      onClick={(e) => {
                        setKeyword(item);
                        handleSearch(e, item);
                      }}
                      className="flex w-full items-center justify-between border-b py-4 text-left"
                    >
                      <span className="text-sm">{item}</span>
                      <Clock size={20} />
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-5 text-base font-bold">Hasil Pencarian</h2>

              {loading ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Mencari buku...
                </p>
              ) : books.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Buku tidak ditemukan.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-x-5 gap-y-6">
                  {books.map((book) => (
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
                          <div className="flex h-full w-full items-center justify-center bg-yellow-100 px-2 text-center text-[10px] font-bold">
                            {book.judul}
                          </div>
                        )}
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs font-semibold">
                        {book.judul}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}