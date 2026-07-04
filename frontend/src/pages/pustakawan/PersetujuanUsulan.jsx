import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Search,
  RefreshCcw,
  Eye,
  BookOpen,
} from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import {
  approveSuggestion,
  getAllSuggestions,
  rejectSuggestion,
  updateSuggestionStatus,
} from "../../services/suggestion.api";

export default function PersetujuanUsulan() {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [catatan, setCatatan] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const response = await getAllSuggestions({
        status: status || undefined,
      });

      const data = response.data.data || [];

      const filtered = search
        ? data.filter((item) => {
            const keyword = search.toLowerCase();

            return (
              item.judul?.toLowerCase().includes(keyword) ||
              item.penulis?.toLowerCase().includes(keyword) ||
              item.user?.nama?.toLowerCase().includes(keyword) ||
              item.nomorUsulan?.toLowerCase().includes(keyword)
            );
          })
        : data;

      setSuggestions(filtered);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengambil data usulan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuggestions();
  };

  const handleSelect = (item) => {
    setSelectedSuggestion(item);
    setCatatan(item.catatan || "");
  };

  const handleApprove = async () => {
    if (!selectedSuggestion) return;

    const confirmApprove = window.confirm(
      "Apakah kamu yakin ingin menyetujui usulan buku ini?"
    );

    if (!confirmApprove) return;

    try {
      setProcessing(true);

      const response = await approveSuggestion(selectedSuggestion.id, {
        catatan: catatan || "Usulan buku disetujui untuk proses pengadaan.",
      });

      alert("Usulan berhasil disetujui");
      setSelectedSuggestion(response.data.data);
      fetchSuggestions();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyetujui usulan");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSuggestion) return;

    if (!catatan.trim()) {
      alert("Catatan wajib diisi saat menolak usulan");
      return;
    }

    const confirmReject = window.confirm(
      "Apakah kamu yakin ingin menolak usulan buku ini?"
    );

    if (!confirmReject) return;

    try {
      setProcessing(true);

      const response = await rejectSuggestion(selectedSuggestion.id, {
        catatan,
      });

      alert("Usulan berhasil ditolak");
      setSelectedSuggestion(response.data.data);
      fetchSuggestions();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menolak usulan");
    } finally {
      setProcessing(false);
    }
  };

  const handleSetReviewed = async () => {
    if (!selectedSuggestion) return;

    try {
      setProcessing(true);

      const response = await updateSuggestionStatus(selectedSuggestion.id, {
        status: "DITINJAU",
        catatan: catatan || "Usulan sedang ditinjau oleh pustakawan.",
      });

      alert("Status usulan berhasil diubah menjadi ditinjau");
      setSelectedSuggestion(response.data.data);
      fetchSuggestions();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengubah status usulan");
    } finally {
      setProcessing(false);
    }
  };

  const handleSetAvailable = async () => {
    if (!selectedSuggestion) return;

    const confirmAvailable = window.confirm(
      "Apakah buku dari usulan ini sudah tersedia di perpustakaan?"
    );

    if (!confirmAvailable) return;

    try {
      setProcessing(true);

      const response = await updateSuggestionStatus(selectedSuggestion.id, {
        status: "TERSEDIA",
        catatan: catatan || "Buku sudah tersedia di perpustakaan.",
      });

      alert("Status usulan berhasil diubah menjadi tersedia");
      setSelectedSuggestion(response.data.data);
      fetchSuggestions();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengubah status usulan");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Persetujuan Usulan Buku</h1>
        <p className="text-gray-500">
          Tinjau, setujui, atau tolak usulan buku dari dosen
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 gap-3">
              <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border px-4">
                <Search size={20} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul, penulis, pengusul, atau nomor usulan..."
                  className="w-full outline-none"
                />
              </div>

              <button className="rounded-xl bg-black px-5 font-semibold text-white">
                Cari
              </button>
            </form>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 rounded-xl border px-4 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DITINJAU">Ditinjau</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="TERSEDIA">Tersedia</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm text-gray-500">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Usulan Buku</th>
                  <th className="px-4 py-3">Pengusul</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Memuat data usulan...
                    </td>
                  </tr>
                ) : suggestions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Belum ada data usulan.
                    </td>
                  </tr>
                ) : (
                  suggestions.map((item, index) => (
                    <tr key={item.id} className="border-b text-sm">
                      <td className="px-4 py-4">{index + 1}</td>

                      <td className="px-4 py-4">
                        <p className="font-semibold">{item.judul}</p>
                        <p className="text-gray-500">{item.penulis}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {item.nomorUsulan}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold">{item.user?.nama}</p>
                        <p className="text-gray-500">
                          {item.user?.prodi || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-4">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleSelect(item)}
                            className="rounded-lg bg-yellow-100 p-2 text-yellow-700"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold">Detail Usulan</h2>

          {!selectedSuggestion ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center text-sm text-gray-500">
              Pilih salah satu usulan untuk melihat detail.
            </div>
          ) : (
            <>
              <div className="space-y-4 text-sm">
                <Info label="Nomor Usulan" value={selectedSuggestion.nomorUsulan} />
                <Info label="Judul Buku" value={selectedSuggestion.judul} />
                <Info label="Penulis" value={selectedSuggestion.penulis} />
                <Info label="Penerbit" value={selectedSuggestion.penerbit || "-"} />
                <Info
                  label="Tahun Terbit"
                  value={selectedSuggestion.tahunTerbit || "-"}
                />
                <Info label="Kategori" value={selectedSuggestion.kategori || "-"} />
                <Info
                  label="Mata Kuliah"
                  value={selectedSuggestion.mataKuliah || "-"}
                />
                <Info label="Pengusul" value={selectedSuggestion.user?.nama} />
                <Info label="Status" value={selectedSuggestion.status} />

                <div>
                  <p className="text-xs text-gray-500">Alasan Usulan</p>
                  <p className="mt-1 rounded-xl bg-gray-50 p-3 font-medium leading-6">
                    {selectedSuggestion.alasan || "-"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs text-gray-500">Catatan</p>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows="4"
                    placeholder="Tambahkan catatan untuk dosen..."
                    className="w-full rounded-xl border p-3 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {selectedSuggestion.status === "MENUNGGU" && (
                  <button
                    onClick={handleSetReviewed}
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border font-semibold"
                  >
                    <RefreshCcw size={18} />
                    Tandai Ditinjau
                  </button>
                )}

                {selectedSuggestion.status !== "DISETUJUI" &&
                  selectedSuggestion.status !== "DITOLAK" &&
                  selectedSuggestion.status !== "TERSEDIA" && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 font-bold text-black"
                      >
                        <CheckCircle size={18} />
                        Setujui Usulan
                      </button>

                      <button
                        onClick={handleReject}
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-100 font-bold text-red-700"
                      >
                        <XCircle size={18} />
                        Tolak Usulan
                      </button>
                    </>
                  )}

                {selectedSuggestion.status === "DISETUJUI" && (
                  <button
                    onClick={handleSetAvailable}
                    disabled={processing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-100 font-bold text-green-700"
                  >
                    <BookOpen size={18} />
                    Tandai Buku Tersedia
                  </button>
                )}

                {selectedSuggestion.status === "DITOLAK" && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    Usulan ini sudah ditolak.
                  </div>
                )}

                {selectedSuggestion.status === "TERSEDIA" && (
                  <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                    Buku dari usulan ini sudah tersedia.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    MENUNGGU: "bg-yellow-100 text-yellow-700",
    DITINJAU: "bg-blue-100 text-blue-700",
    DISETUJUI: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",
    TERSEDIA: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}