import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/MobileLayout";
import { getMyReservations } from "../../services/reservation.api";
import { getMyLoans } from "../../services/loan.api";

export default function AktivitasSaya() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("reservasi");
  const [reservations, setReservations] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reservationRes, loanRes] = await Promise.all([
        getMyReservations(),
        getMyLoans(),
      ]);

      setReservations(reservationRes.data.data || []);
      setLoans(loanRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeReservations = reservations.filter(
    (item) => item.status === "MENUNGGU_PENGAMBILAN"
  );

  const activeLoans = loans.filter(
    (item) => item.status === "AKTIF" || item.status === "TERLAMBAT"
  );

  const historyItems = [
    ...reservations.filter(
      (item) =>
        item.status === "DIBATALKAN" ||
        item.status === "EXPIRED" ||
        item.status === "DIPINJAM"
    ),
    ...loans.filter((item) => item.status === "SELESAI"),
  ];

  return (
    <MobileLayout role="mahasiswa">
      <div className="min-h-screen bg-white px-5 pt-8">
        <h1 className="text-center text-base font-bold text-black">
          Aktivitas Saya
        </h1>

        <div className="mt-10 grid grid-cols-3 text-center">
          <TabButton
            active={tab === "pinjaman"}
            onClick={() => setTab("pinjaman")}
          >
            Pinjaman
          </TabButton>

          <TabButton
            active={tab === "reservasi"}
            onClick={() => setTab("reservasi")}
          >
            Reservasi
          </TabButton>

          <TabButton
            active={tab === "riwayat"}
            onClick={() => setTab("riwayat")}
          >
            Riwayat
          </TabButton>
        </div>

        <div className="mt-7">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Memuat aktivitas...
            </p>
          ) : (
            <>
              {tab === "reservasi" && (
                <div className="space-y-4">
                  {activeReservations.length === 0 ? (
                    <EmptyText text="Belum ada reservasi." />
                  ) : (
                    activeReservations.map((item) => (
                      <ReservationCard
                        key={item.id}
                        item={item}
                        onQr={() =>
                          navigate(`/mahasiswa/qr-reservasi/${item.id}`)
                        }
                      />
                    ))
                  )}
                </div>
              )}

              {tab === "pinjaman" && (
                <div className="space-y-4">
                  {activeLoans.length === 0 ? (
                    <EmptyText text="Belum ada pinjaman aktif." />
                  ) : (
                    activeLoans.map((item) => (
                      <LoanCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              )}

              {tab === "riwayat" && (
                <div className="space-y-4">
                  {historyItems.length === 0 ? (
                    <EmptyText text="Belum ada riwayat aktivitas." />
                  ) : (
                    historyItems.map((item) =>
                      item.kodeBooking ? (
                        <ReservationCard
                          key={`reservation-${item.id}`}
                          item={item}
                          showQr={false}
                        />
                      ) : (
                        <LoanCard key={`loan-${item.id}`} item={item} />
                      )
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`mx-auto pb-2 text-base ${
        active
          ? "border-b border-black font-semibold text-black"
          : "font-medium text-black"
      }`}
    >
      {children}
    </button>
  );
}

function ReservationCard({ item, onQr, showQr = true }) {
  const book = item.book;

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4">
      <div className="flex gap-4">
        <BookCover book={book} />

        <div className="flex-1">
          <h2 className="line-clamp-2 text-sm font-bold text-black">
            {book?.judul || "-"}
          </h2>

          <p className="mt-2 text-xs text-black">{book?.pengarang || "-"}</p>

          <p className="mt-3 text-xs text-black">
            {book?.tahunTerbit || "-"}
          </p>

          <div className="mt-7 grid grid-cols-2 text-xs text-black">
            <p>{formatDate(item.tanggalAmbil)}</p>
            <p className="text-right">{formatTimeRange(item.tanggalAmbil)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="grid grid-cols-2 gap-4 text-xs text-black">
          <div>
            <p>Status</p>
            <p className="mt-1 font-bold">{formatStatus(item.status)}</p>
          </div>

          <div>
            <p>Berlaku Sampai</p>
            <p className="mt-1 font-bold">
              {formatDateTime(item.berlakuSampai)}
            </p>
          </div>
        </div>

        {showQr && (
          <button
            onClick={onQr}
            className="mt-4 h-11 w-full rounded-lg bg-yellow-400 text-sm font-bold text-white"
          >
            Lihat QR
          </button>
        )}
      </div>
    </div>
  );
}

function LoanCard({ item }) {
  const book = item.book;

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4">
      <div className="flex gap-4">
        <BookCover book={book} />

        <div className="flex-1">
          <h2 className="line-clamp-2 text-sm font-bold text-black">
            {book?.judul || "-"}
          </h2>

          <p className="mt-2 text-xs text-black">{book?.pengarang || "-"}</p>

          <p className="mt-3 text-xs text-black">
            {book?.tahunTerbit || "-"}
          </p>

          <div className="mt-7 grid grid-cols-2 text-xs text-black">
            <p>{formatDate(item.tanggalPinjam)}</p>
            <p className="text-right">Jatuh tempo</p>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="grid grid-cols-2 gap-4 text-xs text-black">
          <div>
            <p>Status</p>
            <p className="mt-1 font-bold">{formatStatus(item.status)}</p>
          </div>

          <div>
            <p>Jatuh Tempo</p>
            <p className="mt-1 font-bold">{formatDate(item.jatuhTempo)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCover({ book }) {
  return (
    <div className="h-[120px] w-[80px] shrink-0 overflow-hidden rounded-sm bg-gray-100">
      {book?.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.judul}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-yellow-100 px-2 text-center text-[10px] font-bold text-black">
          {book?.judul || "No Cover"}
        </div>
      )}
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <p className="py-20 text-center text-sm text-gray-500">
      {text}
    </p>
  );
}

function formatStatus(status) {
  const map = {
    MENUNGGU_PENGAMBILAN: "Menunggu Pengambilan",
    DIPINJAM: "Dipinjam",
    DIBATALKAN: "Dibatalkan",
    EXPIRED: "Expired",
    AKTIF: "Aktif",
    TERLAMBAT: "Terlambat",
    SELESAI: "Selesai",
  };

  return map[status] || status || "-";
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