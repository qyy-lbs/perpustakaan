import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Plus, Search } from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { getMySuggestions } from "../../services/suggestion.api";
import { useToast } from "../../components/ui/Toast";

export default function UsulanBuku() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [suggestions, setSuggestions] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const response = await getMySuggestions();
      setSuggestions(response.data.data || []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengambil data usulan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const filteredSuggestions = suggestions.filter((item) => {
    const matchKeyword =
      item.judul?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.penulis?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.nomorUsulan?.toLowerCase().includes(keyword.toLowerCase());

    const matchStatus =
      statusFilter === "SEMUA" ? true : item.status === statusFilter;

    return matchKeyword && matchStatus;
  });

  return (
    <MobileLayout role="dosen">
      <div className="relative min-h-screen bg-white px-7 pt-10">
        <h1 className="text-center text-base font-bold text-black">
          Usulan Buku
        </h1>

        <form className="mt-9 flex h-10 items-center gap-3 rounded-full border border-gray-300 px-4">
          <Search size={16} className="text-gray-500" />

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari usulan buku..."
            className="flex-1 text-xs outline-none"
          />

          <button type="button">
            <Mic size={16} className="text-gray-500" />
          </button>
        </form>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
          <FilterButton
            active={statusFilter === "SEMUA"}
            onClick={() => setStatusFilter("SEMUA")}
          >
            Semua
          </FilterButton>

          <FilterButton
            active={statusFilter === "MENUNGGU"}
            onClick={() => setStatusFilter("MENUNGGU")}
          >
            Diajukan
          </FilterButton>

          <FilterButton
            active={statusFilter === "DITINJAU"}
            onClick={() => setStatusFilter("DITINJAU")}
          >
            Ditinjau
          </FilterButton>

          <FilterButton
            active={statusFilter === "DISETUJUI"}
            onClick={() => setStatusFilter("DISETUJUI")}
          >
            Disetujui
          </FilterButton>

          <FilterButton
            active={statusFilter === "TERSEDIA"}
            onClick={() => setStatusFilter("TERSEDIA")}
          >
            Tersedia
          </FilterButton>
        </div>

        <div className="mt-8 space-y-5 pb-28">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Memuat usulan...
            </p>
          ) : filteredSuggestions.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Belum ada usulan buku.
            </p>
          ) : (
            filteredSuggestions.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-gray-200 pb-5"
              >
                <div className="flex h-[105px] w-[70px] shrink-0 items-center justify-center overflow-hidden bg-yellow-100 px-2 text-center">
                  <span className="text-[10px] font-bold leading-tight text-black">
                    {item.judul}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-bold text-black">
                    {item.judul}
                  </h2>

                  <p className="mt-2 text-xs text-black">
                    {item.penulis || "-"}
                  </p>

                  <p className="mt-2 text-xs text-black">
                    {item.tahunTerbit || "-"}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {formatStatus(item.status)}
                    </span>

                    <button
                      onClick={() => navigate(`/dosen/usulan/${item.id}`)}
                      className="text-xs font-bold text-blue-500"
                    >
                      Lihat detail
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => navigate("/dosen/usulan/create")}
          className="fixed bottom-24 left-1/2 z-40 ml-[120px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-yellow-400 text-white shadow-lg"
        >
          <Plus size={36} />
        </button>
      </div>
    </MobileLayout>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded px-3 py-2 text-xs ${
        active
          ? "bg-yellow-300 text-black"
          : "border border-gray-300 bg-white text-black"
      }`}
    >
      {children}
    </button>
  );
}

function formatStatus(status) {
  const map = {
    MENUNGGU: "Diajukan",
    DITINJAU: "Ditinjau",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
    TERSEDIA: "Tersedia",
  };

  return map[status] || status || "-";
}

function getStatusColor(status) {
  const map = {
    MENUNGGU: "text-yellow-500",
    DITINJAU: "text-yellow-500",
    DISETUJUI: "text-green-600",
    DITOLAK: "text-red-600",
    TERSEDIA: "text-green-600",
  };

  return map[status] || "text-gray-500";
}