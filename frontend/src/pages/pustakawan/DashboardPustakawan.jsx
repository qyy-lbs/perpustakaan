import { useEffect, useState } from "react";
import { Bell, UserCircle } from "lucide-react";
import { useNavigate} from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StaffLayout from "../../layouts/StaffLayout";
import {
  getCategoryChart,
  getDashboardSummary,
  getLoanChart,
} from "../../services/dashboard.api";
import { useToast } from "../../components/ui/Toast";

export default function DashboardPustakawan() {
  const { showToast } = useToast();

  const [summary, setSummary] = useState({
    peminjamanHariIni: 0,
    pengembalianHariIni: 0,
    bookingAktif: 0,
    terlambat: 0,
  });

  const [loanData, setLoanData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [summaryRes, loanRes, categoryRes] = await Promise.all([
        getDashboardSummary(),
        getLoanChart(),
        getCategoryChart(),
      ]);

      setSummary(summaryRes.data.data || {});

      const loans = loanRes.data.data || [];
      setLoanData(
        loans.map((item) => ({
          hari: item.hari,
          total: Number(item.total || 0),
        }))
      );

      const rawCategory = categoryRes.data.data;

      const categories = Array.isArray(rawCategory)
        ? rawCategory
        : rawCategory?.categories || [];

      setCategoryData(
        categories.map((item) => ({
          name: item.nama || item.name || item.kategori || "-",
          value: Number(item.total || item.value || 0),
          percentage: Number(item.persentase || item.percentage || 0),
        }))
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengambil data dashboard",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totalCategory = categoryData.reduce(
    (total, item) => total + Number(item.value || 0),
    0
  );

  return (
    <StaffLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black lg:text-4xl">
          Dashboard
        </h1>

      <div className="relative flex items-center gap-5">
  <button
    onClick={() => setShowNotif(!showNotif)}
    className="relative rounded-full p-2 hover:bg-yellow-100"
  >
    <Bell size={30} />

    {(summary.bookingAktif > 0 || summary.terlambat > 0) && (
      <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-red-500" />
    )}
  </button>

  <button
    onClick={() => navigate("/pustakawan/pengaturan")}
    className="rounded-full p-2 hover:bg-yellow-100"
  >
    <UserCircle size={40} />
  </button>

  {showNotif && (
    <div className="absolute right-12 top-14 z-50 w-80 rounded-2xl border bg-white p-4 shadow-xl">
      <h3 className="mb-3 font-bold text-black">Notifikasi</h3>

      <button
        onClick={() => navigate("/pustakawan/validasi-booking")}
        className="mb-3 w-full rounded-xl bg-yellow-50 p-3 text-left hover:bg-yellow-100"
      >
        <p className="font-bold">Booking Aktif</p>
        <p className="text-sm text-gray-600">
          Ada {summary.bookingAktif || 0} booking yang perlu divalidasi.
        </p>
      </button>

      <button
        onClick={() => navigate("/pustakawan/pengembalian")}
        className="w-full rounded-xl bg-red-50 p-3 text-left hover:bg-red-100"
      >
        <p className="font-bold">Peminjaman Terlambat</p>
        <p className="text-sm text-gray-600">
          Ada {summary.terlambat || 0} peminjaman terlambat.
        </p>
      </button>
    </div>
  )}
</div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={summary.peminjamanHariIni}
          label="Peminjaman hari ini"
        />

        <StatCard
          value={summary.pengembalianHariIni}
          label="Pengembalian hari ini"
        />

        <StatCard value={summary.bookingAktif} label="Booking aktif" />

        <StatCard value={summary.terlambat} label="Terlambat" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 2xl:grid-cols-[2fr_1.1fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-black">
                Grafik Peminjaman 7 Hari Terakhir
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Jumlah buku yang dipinjam setiap hari selama satu minggu terakhir
              </p>
            </div>

            <select className="h-8 rounded-md border border-gray-300 px-3 text-xs outline-none">
              <option>7 Hari Terakhir</option>
            </select>
          </div>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={loanData}
                margin={{
                  top: 20,
                  right: 25,
                  left: 5,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="hari"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Hari",
                    position: "insideBottom",
                    offset: -12,
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Jumlah Buku",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                  }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="total"
                  name="Peminjaman"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#2563eb",
                    stroke: "#2563eb",
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              Peminjaman
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md">
          <h2 className="font-bold text-black">Peminjaman per Kategori</h2>

          <p className="mt-1 text-xs text-gray-500">
            Distribusi jumlah peminjaman berdasarkan kategori buku
          </p>

          <div className="mt-6 h-[260px]">
            {categoryData.length === 0 || totalCategory === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg bg-gray-50 text-center text-sm text-gray-500">
                Belum ada data peminjaman per kategori.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    dataKey="value"
                    label={({ percent }) => `${Math.round(percent * 100)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {categoryData.length === 0 || totalCategory === 0 ? (
              <div className="flex items-center justify-between pt-3 text-base font-bold">
                <span>Total</span>
                <span>0 (0%)</span>
              </div>
            ) : (
              <>
                {categoryData.map((item, index) => {
                  const percent =
                    totalCategory > 0
                      ? Math.round(
                          (Number(item.value || 0) / totalCategory) * 100
                        )
                      : 0;

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span>{item.name}</span>
                      </div>

                      <span>
                        {item.value} ({percent}%)
                      </span>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{totalCategory} (100%)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-lg bg-yellow-100 px-5 py-4">
      <h2 className="text-4xl font-bold text-black">{value || 0}</h2>
      <p className="mt-1 text-base text-black lg:text-lg">{label}</p>
    </div>
  );
}

const PIE_COLORS = ["#2F80ED", "#27AE60", "#F2C94C", "#9B51E0"];