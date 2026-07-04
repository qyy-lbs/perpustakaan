import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { createReservation } from "../../services/reservation.api";
import { useToast } from "../../components/ui/Toast";

export default function PilihWaktuPengambilan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tanggal, setTanggal] = useState(getTomorrowDate());
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [loading, setLoading] = useState(false);

  const times = [
    { label: "09:00-10:00", value: "09:00" },
    { label: "10:00-11:00", value: "10:00" },
    { label: "11:00-12:00", value: "11:00" },
    { label: "13:00-14:00", value: "13:00" },
    { label: "14:00-15:00", value: "14:00" },
    { label: "15:00-16:00", value: "15:00" },
  ];

  const handleConfirm = async () => {
    if (!tanggal || !selectedTime) {
      showToast("Tanggal dan waktu pengambilan wajib dipilih", "error");
      return;
    }

    try {
      setLoading(true);

      const tanggalAmbil = new Date(`${tanggal}T${selectedTime}:00`);

      const response = await createReservation({
        bookId: Number(id),
        tanggalAmbil: tanggalAmbil.toISOString(),
      });

      const reservation = response.data.data;

      showToast("Booking berhasil dibuat", "success");
      navigate(`/mahasiswa/qr-reservasi/${reservation.id}`);
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal membuat booking", "error");
    } finally {
      setLoading(false);
    }
  };

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

          <h1 className="text-base font-bold">Pilih Waktu Pengambilan</h1>
        </div>

        <div className="mt-14">
          <label className="relative block">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 pr-10 text-sm outline-none"
            />

            <CalendarDays
              size={19}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
            />
          </label>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {times.map((time) => (
              <button
                key={time.value}
                onClick={() => setSelectedTime(time.value)}
                className={`h-10 rounded-lg border text-sm ${
                  selectedTime === time.value
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-gray-400 bg-white text-black"
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-7">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="h-12 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white"
        >
          {loading ? "Memproses..." : "Konfirmasi Booking"}
        </button>
      </div>
    </MobilePlain>
  );
}

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return date.toISOString().split("T")[0];
}

function MobilePlain({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative mx-auto min-h-screen max-w-[430px] bg-white">
        {children}
      </div>
    </div>
  );
}