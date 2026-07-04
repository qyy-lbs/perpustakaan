import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import { deleteBook, getBooks } from "../../services/book.api";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function ManajemenInventaris() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    book: null,
  });

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const perPage = 3;

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await getBooks({
        search: search || undefined,
      });

      setBooks(response.data.data || []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengambil data buku",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return books;

    const keyword = search.toLowerCase();

    return books.filter((book) => {
      return (
        book.judul?.toLowerCase().includes(keyword) ||
        book.pengarang?.toLowerCase().includes(keyword) ||
        book.isbn?.toLowerCase().includes(keyword)
      );
    });
  }, [books, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / perPage));

  const paginatedBooks = filteredBooks.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModal.book) return;

    try {
      setDeleting(true);

      await deleteBook(deleteModal.book.id);

      showToast("Buku berhasil dihapus", "success");

      setDeleteModal({
        open: false,
        book: null,
      });

      fetchBooks();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menghapus buku",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <StaffLayout>
      <div>
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black lg:text-4xl">
              Manajemen Inventaris
            </h1>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex h-12 w-full max-w-[430px] items-center gap-3 rounded-full border border-gray-400 px-4"
            >
              <Search size={22} className="text-gray-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Buku/ISBN"
                className="flex-1 bg-transparent text-lg outline-none"
              />

              <button type="submit">
                <ChevronDown size={28} className="text-gray-600" />
              </button>
            </form>
          </div>

          <button
            onClick={() => navigate("/pustakawan/inventaris/tambah")}
            className="mt-4 flex h-12 items-center gap-2 rounded-lg bg-yellow-500 px-6 text-lg font-bold text-white shadow-md lg:h-14 lg:px-8 lg:text-xl"
          >
            <Plus size={28} />
            Tambah Buku
          </button>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg bg-white shadow-xl">
          {" "}
          <table className="min-w-[900px] w-full border-collapse text-center">
            {" "}
            <thead>
              <tr className="bg-yellow-200 text-black">
                <th className="border border-black/10 px-6 py-5 text-base font-bold">
                  Judul Buku
                </th>
                <th className="border border-black/10 px-6 py-5 text-base font-bold">
                  Pengarang
                </th>
                <th className="border border-black/10 px-6 py-5 text-base font-bold">
                  Stok
                </th>
                <th className="border border-black/10 px-6 py-5 text-base font-bold">
                  Lokasi Rak
                </th>
                <th className="border border-black/10 px-6 py-5 text-base font-bold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="border border-black/10 py-12 text-center text-gray-500"
                  >
                    Memuat data buku...
                  </td>
                </tr>
              ) : paginatedBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="border border-black/10 py-12 text-center text-gray-500"
                  >
                    Data buku tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((book) => (
                  <tr key={book.id} className="bg-white">
                    <td className="border border-black/10 px-6 py-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex h-[82px] w-[58px] shrink-0 items-center justify-center overflow-hidden bg-gray-100">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.judul}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="px-1 text-center text-[9px] font-bold">
                              {book.judul}
                            </span>
                          )}
                        </div>

                        <p className="max-w-[180px] text-base font-medium leading-tight">
                          {book.judul}
                        </p>
                      </div>
                    </td>

                    <td className="border border-black/10 px-6 py-4 text-base">
                      {book.pengarang || "-"}
                    </td>

                    <td className="border border-black/10 px-6 py-4">
                      <span className="inline-flex rounded-md bg-green-100 px-4 py-2 text-base font-semibold text-green-700">
                        {book.stokTersedia}
                      </span>
                    </td>

                    <td className="border border-black/10 px-6 py-4">
                      <span className="inline-flex rounded-md bg-yellow-100 px-5 py-2 text-base font-medium">
                        {book.rack?.kodeRak || "-"}
                      </span>
                    </td>

                    <td className="border border-black/10 px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() =>
                            navigate(`/pustakawan/inventaris/${book.id}/edit`)
                          }
                          className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-300 text-green-600"
                        >
                          <Pencil size={25} />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              book,
                            })
                          }
                          className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-300 text-red-600"
                        >
                          <Trash2 size={25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-14 flex justify-center gap-8">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-500 disabled:opacity-40"
          >
            <ChevronLeft size={38} />
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-14 w-14 rounded-lg border border-gray-500 text-3xl font-bold ${
                  page === pageNumber ? "bg-yellow-200" : "bg-white"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-500 disabled:opacity-40"
          >
            <ChevronRight size={38} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteModal.open}
        title="Konfirmasi Hapus"
        message="Apakah anda yakin ingin menghapus buku ini?"
        bookTitle={deleteModal.book?.judul}
        bookAuthor={deleteModal.book?.pengarang}
        confirmText="Hapus"
        cancelText="Batal"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteModal({
            open: false,
            book: null,
          })
        }
      />
    </StaffLayout>
  );
}
