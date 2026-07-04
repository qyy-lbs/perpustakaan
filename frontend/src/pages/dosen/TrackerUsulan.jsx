import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { getSuggestionById } from "../../services/suggestion.api";
import { useToast } from "../../components/ui/Toast";

export default function TrackerUsulan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  const fetchSuggestion = async () => {
    try {
      setLoading(true);

      const response = await getSuggestionById(id);
      setSuggestion(response.data.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal mengambil detail usulan",
        "error"
      );
      navigate("/dosen/usulan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, [id]);

  if (loading) {
    return (
      <MobilePlain>
        <p className="p-6 text-sm text-gray-500">Memuat tracker usulan...</p>
      </MobilePlain>
    );
  }

  const currentStep = getCurrentStep(suggestion.status);

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

          <h1 className="text-base font-bold">Tracker Usulan</h1>
        </div>

        <div className="mt-14 px-4">
          <TimelineItem
            title="Diajukan"
            date={formatDateTime(suggestion.createdAt)}
            active={currentStep >= 0}
            last={false}
          />

          <TimelineItem
            title="Ditinjau"
            date={
              currentStep >= 1
                ? formatDateTime(suggestion.updatedAt)
                : "Menunggu Peninjauan"
            }
            active={currentStep >= 1}
            last={false}
          />

          <TimelineItem
            title="Disetujui"
            date={
              suggestion.status === "DITOLAK"
                ? "Usulan Ditolak"
                : currentStep >= 2
                ? "Menunggu Persetujuan"
                : "Menunggu Persetujuan"
            }
            active={currentStep >= 2}
            rejected={suggestion.status === "DITOLAK"}
            last={false}
          />

          <TimelineItem
            title="Tersedia"
            date={
              currentStep >= 3
                ? "Buku sudah tersedia"
                : "Menunggu Pengadaan"
            }
            active={currentStep >= 3}
            last
          />
        </div>

        <div className="mt-8 rounded-lg bg-yellow-100 p-4">
          <h2 className="mb-4 font-bold">Detail Usulan</h2>

          <DetailRow label="Nomor Usulan" value={suggestion.nomorUsulan} />
          <DetailRow label="Judul" value={suggestion.judul} />
          <DetailRow
            label="Tgl. Diajukan"
            value={formatDate(suggestion.createdAt)}
          />
          <DetailRow label="Mata Kuliah" value={suggestion.mataKuliah || "-"} />

          {showDetail && (
            <div className="mt-4 border-t border-yellow-300 pt-4">
              <DetailRow label="Penulis" value={suggestion.penulis || "-"} />
              <DetailRow label="Penerbit" value={suggestion.penerbit || "-"} />
              <DetailRow
                label="Tahun"
                value={suggestion.tahunTerbit || "-"}
              />
              <DetailRow label="Kategori" value={suggestion.kategori || "-"} />

              <div className="mt-3">
                <p className="text-xs font-semibold">Alasan</p>
                <p className="mt-1 text-xs leading-5">
                  {suggestion.alasan || "-"}
                </p>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold">Catatan</p>
                <p className="mt-1 text-xs leading-5">
                  {suggestion.catatan || "-"}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDetail(!showDetail)}
          className="mt-24 h-12 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white shadow-md"
        >
          {showDetail ? "Tutup Detail" : "Lihat Detail"}
        </button>
      </div>
    </MobilePlain>
  );
}

function TimelineItem({
  title,
  date,
  active = false,
  rejected = false,
  last = false,
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            rejected
              ? "bg-red-200 text-red-600"
              : active
              ? "bg-yellow-100 text-yellow-500"
              : "bg-gray-300 text-gray-300"
          }`}
        >
          {active && !rejected ? <Check size={18} /> : null}
          {rejected ? <span className="text-sm font-bold">!</span> : null}
        </div>

        {!last && <div className="h-10 w-[2px] bg-gray-200" />}
      </div>

      <div className="pb-6">
        <h2 className="text-sm font-bold text-black">{title}</h2>
        <p className="mt-1 text-xs text-black">{date}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="mb-2 grid grid-cols-[120px_1fr] gap-2 text-xs">
      <p>{label}</p>
      <p>{value || "-"}</p>
    </div>
  );
}

function getCurrentStep(status) {
  const map = {
    MENUNGGU: 0,
    DITINJAU: 1,
    DISETUJUI: 2,
    TERSEDIA: 3,
    DITOLAK: 1,
  };

  return map[status] ?? 0;
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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