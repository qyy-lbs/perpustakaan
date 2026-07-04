import { useEffect, useState } from "react";
import { Download, RefreshCcw } from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import {
  getFineReport,
  getLoanReport,
  getReportSummary,
  getReturnReport,
  getSuggestionReport,
} from "../../services/report.api";

export default function LaporanPustakawan() {
  const [tab, setTab] = useState("loans");
  const [summary, setSummary] = useState(null);

  const [loans, setLoans] = useState([]);
  const [returns, setReturns] = useState([]);
  const [fines, setFines] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    const response = await getReportSummary();
    setSummary(response.data.data);
  };

  const fetchReport = async () => {
    try {
      setLoading(true);

      if (tab === "loans") {
        const response = await getLoanReport({
          startDate: filter.startDate || undefined,
          endDate: filter.endDate || undefined,
          status: filter.status || undefined,
        });
        setLoans(response.data.data || []);
      }

      if (tab === "returns") {
        const response = await getReturnReport({
          startDate: filter.startDate || undefined,
          endDate: filter.endDate || undefined,
        });
        setReturns(response.data.data || []);
      }

      if (tab === "fines") {
        const response = await getFineReport({
          status: filter.status || undefined,
        });
        setFines(response.data.data?.fines || []);
      }

      if (tab === "suggestions") {
        const response = await getSuggestionReport({
          status: filter.status || undefined,
        });
        setSuggestions(response.data.data || []);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [tab]);

  const handleChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const getCurrentData = () => {
    if (tab === "loans") return loans;
    if (tab === "returns") return returns;
    if (tab === "fines") return fines;
    if (tab === "suggestions") return suggestions;
    return [];
  };

  const exportCSV = () => {
    const data = getCurrentData();

    if (data.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    let rows = [];

    if (tab === "loans" || tab === "returns") {
      rows = data.map((item) => ({
        id: item.id,
        nama: item.user?.nama || "-",
        nimNidn: item.user?.nimNidn || "-",
        judulBuku: item.book?.judul || "-",
        tanggalPinjam: item.tanggalPinjam,
        jatuhTempo: item.jatuhTempo,
        tanggalKembali: item.tanggalKembali || "-",
        status: item.status,
      }));
    }

    if (tab === "fines") {
      rows = data.map((item) => ({
        id: item.id,
        nama: item.loan?.user?.nama || "-",
        judulBuku: item.loan?.book?.judul || "-",
        hariTerlambat: item.hariTerlambat,
        jumlah: item.jumlah,
        status: item.status,
        metodeBayar: item.payment?.metode || "-",
      }));
    }

    if (tab === "suggestions") {
      rows = data.map((item) => ({
        id: item.id,
        nomorUsulan: item.nomorUsulan,
        pengusul: item.user?.nama || "-",
        judul: item.judul,
        penulis: item.penulis,
        status: item.status,
        createdAt: item.createdAt,
      }));
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-${tab}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <StaffLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan Perpustakaan</h1>
          <p className="text-gray-500">
            Rekap data peminjaman, pengembalian, denda, dan usulan buku
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-4 gap-5">
          <SummaryCard title="Total Buku" value={summary.totalBuku} />
          <SummaryCard title="Mahasiswa" value={summary.totalMahasiswa} />
          <SummaryCard title="Dosen" value={summary.totalDosen} />
          <SummaryCard title="Pinjaman Aktif" value={summary.peminjamanAktif} />
          <SummaryCard title="Booking Aktif" value={summary.totalReservasiAktif} />
          <SummaryCard title="Usulan Menunggu" value={summary.totalUsulanMenunggu} />
          <SummaryCard title="Denda Belum Dibayar" value={summary.totalDendaBelumDibayar} />
          <SummaryCard title="Denda Dibayar" value={summary.totalDendaDibayar} />
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap gap-3">
          <TabButton active={tab === "loans"} onClick={() => setTab("loans")}>
            Peminjaman
          </TabButton>
          <TabButton active={tab === "returns"} onClick={() => setTab("returns")}>
            Pengembalian
          </TabButton>
          <TabButton active={tab === "fines"} onClick={() => setTab("fines")}>
            Denda
          </TabButton>
          <TabButton
            active={tab === "suggestions"}
            onClick={() => setTab("suggestions")}
          >
            Usulan Buku
          </TabButton>
        </div>

        <form onSubmit={handleFilter} className="mb-6 grid grid-cols-4 gap-4">
          {(tab === "loans" || tab === "returns") && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filter.startDate}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filter.endDate}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border px-4 outline-none"
                />
              </div>
            </>
          )}

          {(tab === "loans" || tab === "fines" || tab === "suggestions") && (
            <div>
              <label className="mb-2 block text-sm font-semibold">Status</label>
              <select
                name="status"
                value={filter.status}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border px-4 outline-none"
              >
                <option value="">Semua Status</option>

                {tab === "loans" && (
                  <>
                    <option value="AKTIF">Aktif</option>
                    <option value="TERLAMBAT">Terlambat</option>
                    <option value="SELESAI">Selesai</option>
                  </>
                )}

                {tab === "fines" && (
                  <>
                    <option value="BELUM_DIBAYAR">Belum Dibayar</option>
                    <option value="DIBAYAR">Dibayar</option>
                  </>
                )}

                {tab === "suggestions" && (
                  <>
                    <option value="MENUNGGU">Menunggu</option>
                    <option value="DITINJAU">Ditinjau</option>
                    <option value="DISETUJUI">Disetujui</option>
                    <option value="DITOLAK">Ditolak</option>
                    <option value="TERSEDIA">Tersedia</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button className="flex h-12 items-center gap-2 rounded-xl bg-black px-5 font-semibold text-white">
              <RefreshCcw size={18} />
              Terapkan
            </button>
          </div>
        </form>

        {loading ? (
          <p className="py-8 text-center text-gray-500">Memuat laporan...</p>
        ) : (
          <>
            {tab === "loans" && <LoanTable data={loans} />}
            {tab === "returns" && <LoanTable data={returns} />}
            {tab === "fines" && <FineTable data={fines} />}
            {tab === "suggestions" && <SuggestionTable data={suggestions} />}
          </>
        )}
      </div>
    </StaffLayout>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold">{value}</h3>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-5 py-3 font-semibold ${
        active ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function LoanTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-gray-500">
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Peminjam</th>
            <th className="px-4 py-3">Buku</th>
            <th className="px-4 py-3">Tanggal Pinjam</th>
            <th className="px-4 py-3">Jatuh Tempo</th>
            <th className="px-4 py-3">Tanggal Kembali</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-500">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-4">{index + 1}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold">{item.user?.nama}</p>
                  <p className="text-gray-500">{item.user?.nimNidn || "-"}</p>
                </td>
                <td className="px-4 py-4">{item.book?.judul}</td>
                <td className="px-4 py-4">
                  {new Date(item.tanggalPinjam).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-4">
                  {new Date(item.jatuhTempo).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-4">
                  {item.tanggalKembali
                    ? new Date(item.tanggalKembali).toLocaleDateString("id-ID")
                    : "-"}
                </td>
                <td className="px-4 py-4">{item.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function FineTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-gray-500">
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Peminjam</th>
            <th className="px-4 py-3">Buku</th>
            <th className="px-4 py-3">Terlambat</th>
            <th className="px-4 py-3">Denda</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Metode Bayar</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-500">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-4">{index + 1}</td>
                <td className="px-4 py-4">{item.loan?.user?.nama || "-"}</td>
                <td className="px-4 py-4">{item.loan?.book?.judul || "-"}</td>
                <td className="px-4 py-4">{item.hariTerlambat} hari</td>
                <td className="px-4 py-4">
                  Rp {Number(item.jumlah).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-4">{item.status}</td>
                <td className="px-4 py-4">{item.payment?.metode || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SuggestionTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-gray-500">
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Nomor</th>
            <th className="px-4 py-3">Pengusul</th>
            <th className="px-4 py-3">Judul</th>
            <th className="px-4 py-3">Penulis</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Tanggal</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-8 text-center text-gray-500">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-4">{index + 1}</td>
                <td className="px-4 py-4">{item.nomorUsulan}</td>
                <td className="px-4 py-4">{item.user?.nama || "-"}</td>
                <td className="px-4 py-4">{item.judul}</td>
                <td className="px-4 py-4">{item.penulis}</td>
                <td className="px-4 py-4">{item.status}</td>
                <td className="px-4 py-4">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}