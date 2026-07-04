import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy } from "lucide-react";
import { getMyReservationById } from "../../services/reservation.api";
import { useToast } from "../../components/ui/Toast";

export default function QRReservasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReservation = async () => {
    try {
      setLoading(true);

      const response = await getMyReservationById(id);
      setReservation(response.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal mengambil QR reservasi", "error");
      navigate("/mahasiswa/aktivitas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reservation.kodeBooking);
      showToast("Kode booking berhasil disalin", "success");
    } catch {
      showToast("Gagal menyalin kode booking", "error");
    }
  };

  const handleDownloadQR = () => {
    if (!reservation?.qrCodeData) return;

    const link = document.createElement("a");
    link.href = reservation.qrCodeData;
    link.download = `${reservation.kodeBooking}.png`;
    link.click();
  };

  if (loading) {
    return (
      <MobilePlain>
        <p className="p-6 text-sm text-gray-500">Memuat QR reservasi...</p>
      </MobilePlain>
    );
  }

  return (
    <MobilePlain>
      <div className="px-8 pt-24 text-center">
        <h1 className="text-lg font-bold">Booking Berhasil</h1>

        <p className="mx-auto mt-3 max-w-[250px] text-sm leading-6 text-black">
          Tunjukan QR Code ini ke Pustakawan saat pengambilan buku.
        </p>

        <div className="mx-auto mt-7 flex h-[180px] w-[180px] items-center justify-center">
          {reservation.qrCodeData ? (
            <img
              src={reservation.qrCodeData}
              alt="QR Reservasi"
              className="h-full w-full object-contain"
            />
          ) : (
            <p className="text-sm text-gray-500">QR tidak tersedia</p>
          )}
        </div>

        <p className="mt-4 text-sm font-bold">Kode Booking:</p>

        <div className="mt-1 flex items-center justify-center gap-2">
          <p className="font-bold">{reservation.kodeBooking}</p>

          <button onClick={handleCopy}>
            <Copy size={17} />
          </button>
        </div>

        <div className="mt-8 rounded-lg bg-yellow-100 p-4 text-left">
          <h2 className="mb-3 font-bold">Detail Reservasi</h2>

          <DetailRow label="Buku" value={reservation.book?.judul || "-"} />
          <DetailRow label="Tanggal" value={formatDate(reservation.tanggalAmbil)} />
          <DetailRow label="Waktu" value={formatTimeRange(reservation.tanggalAmbil)} />
          <DetailRow
            label="Berlaku Sampai"
            value={formatDateTime(reservation.berlakuSampai)}
          />
        </div>

        <button
          onClick={handleDownloadQR}
          className="mt-8 h-12 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white"
        >
          Download QR
        </button>

        <button
          onClick={() => navigate("/mahasiswa/beranda")}
          className="mt-5 h-12 w-full rounded-lg border border-gray-300 text-sm font-bold text-gray-500"
        >
          Beranda
        </button>
      </div>
    </MobilePlain>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="mb-2 grid grid-cols-[90px_1fr] text-sm">
      <p>{label}</p>
      <p className="text-right">{value}</p>
    </div>
  );
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

function formatTimeRange(value) {
  if (!value) return "-";

  const start = new Date(value);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const startTime = start.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startTime}-${endTime}`;
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