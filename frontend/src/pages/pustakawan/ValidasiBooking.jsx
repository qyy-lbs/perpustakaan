import { useState } from "react";
import { Search, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import {
  getReservationByCode,
  validateReservation,
  rejectReservation,
} from "../../services/reservation.api";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function ValidasiBooking() {
  const { showToast } = useToast();

  const [kodeBooking, setKodeBooking] = useState("");
  const [reservation, setReservation] = useState(null);
  const [loanResult, setLoanResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
  });

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!kodeBooking.trim()) {
      setError("Kode booking wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReservation(null);
      setLoanResult(null);

      const response = await getReservationByCode(kodeBooking.trim());
      setReservation(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Kode booking tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const openValidateModal = () => {
    if (!reservation?.kodeBooking) return;

    setConfirmModal({
      open: true,
      type: "validate",
    });
  };

  const openRejectModal = () => {
    if (!reservation?.kodeBooking) return;

    setConfirmModal({
      open: true,
      type: "reject",
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      type: "",
    });
  };

  const refreshReservation = async () => {
    if (!reservation?.kodeBooking) return;

    try {
      const response = await getReservationByCode(reservation.kodeBooking);
      setReservation(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentStatus = () => {
    if (!reservation) return "";

    const status = reservation.status;

    if (status !== "MENUNGGU_PENGAMBILAN") {
      return status;
    }

    if (
      reservation.berlakuSampai &&
      new Date(reservation.berlakuSampai).getTime() < Date.now()
    ) {
      return "EXPIRED";
    }

    return status;
  };

  const currentStatus = getCurrentStatus();
  const canProcessBooking = currentStatus === "MENUNGGU_PENGAMBILAN";

  const handleValidate = async () => {
    if (!reservation?.kodeBooking) return;

    try {
      setValidating(true);
      setError("");

      const response = await validateReservation(reservation.kodeBooking);
      setLoanResult(response.data.data);

      showToast(
        "Booking berhasil divalidasi. Buku berhasil dipinjamkan.",
        "success",
      );

      closeConfirmModal();

      const updatedReservation = await getReservationByCode(
        reservation.kodeBooking,
      );

      setReservation(updatedReservation.data.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal validasi booking",
        "error",
      );

      closeConfirmModal();
      await refreshReservation();
    } finally {
      setValidating(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!reservation?.kodeBooking) return;

    try {
      setRejecting(true);
      setError("");

      await rejectReservation(reservation.kodeBooking);

      showToast("Booking berhasil ditolak", "success");

      closeConfirmModal();

      setReservation(null);
      setKodeBooking("");
      setLoanResult(null);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menolak booking",
        "error",
      );

      closeConfirmModal();
      await refreshReservation();
    } finally {
      setRejecting(false);
    }
  };

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Validasi Booking</h1>
        <p className="mt-1 text-gray-500">
          Masukkan kode booking dari QR reservasi mahasiswa
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border px-4">
            <Search size={20} className="text-gray-400" />

            <input
              value={kodeBooking}
              onChange={(e) => setKodeBooking(e.target.value)}
              placeholder="Contoh: BK1234567890"
              className="w-full outline-none"
            />
          </div>

          <button
            disabled={loading}
            className="rounded-xl bg-black px-6 font-semibold text-white"
          >
            {loading ? "Mencari..." : "Cari Booking"}
          </button>
        </form>

        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-red-100 px-4 py-3 text-red-700">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {reservation && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
            <h2 className="mb-5 text-lg font-bold">Detail Booking</h2>

            <div className="flex gap-5">
              <div className="flex h-44 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                {reservation.book?.coverUrl ? (
                  <img
                    src={reservation.book.coverUrl}
                    alt={reservation.book.judul}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No Cover
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold">{reservation.book?.judul}</h3>

                <p className="mt-1 text-gray-500">
                  {reservation.book?.pengarang}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Info label="Kode Booking" value={reservation.kodeBooking} />
                  <Info label="Status" value={currentStatus} />

                  <Info
                    label="Tanggal Ambil"
                    value={new Date(reservation.tanggalAmbil).toLocaleString(
                      "id-ID",
                    )}
                  />

                  <Info
                    label="Berlaku Sampai"
                    value={new Date(reservation.berlakuSampai).toLocaleString(
                      "id-ID",
                    )}
                  />

                  <Info
                    label="Kategori"
                    value={reservation.book?.category?.nama || "-"}
                  />

                  <Info
                    label="Rak"
                    value={reservation.book?.rack?.kodeRak || "-"}
                  />

                  <Info
                    label="Stok Tersedia"
                    value={reservation.book?.stokTersedia}
                  />

                  <Info label="ISBN" value={reservation.book?.isbn || "-"} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold">Data Peminjam</h2>

            <div className="space-y-4 text-sm">
              <Info label="Nama" value={reservation.user?.nama} />
              <Info label="Email" value={reservation.user?.email} />
              <Info label="NIM/NIDN" value={reservation.user?.nimNidn || "-"} />
              <Info label="Prodi" value={reservation.user?.prodi || "-"} />
              <Info label="Role" value={reservation.user?.role} />
            </div>

            {canProcessBooking ? (
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                  onClick={openRejectModal}
                  disabled={rejecting || validating}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-400 bg-white font-bold text-black"
                >
                  <XCircle size={20} />
                  Tolak
                </button>

                <button
                  onClick={openValidateModal}
                  disabled={validating || rejecting}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-yellow-400 font-bold text-black"
                >
                  <CheckCircle size={20} />
                  Validasi
                </button>
              </div>
            ) : (
              <div className="mt-8 rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-600">
                Booking sudah berstatus {reservation.status}
              </div>
            )}
          </div>
        </div>
      )}

      {loanResult && (
        <div className="mt-6 rounded-2xl bg-green-100 p-5 text-green-800">
          <h2 className="font-bold">Berhasil Dipinjam</h2>

          <p className="mt-1 text-sm">
            Buku berhasil dipinjamkan kepada {loanResult.user?.nama}.
          </p>

          <p className="mt-1 text-sm">
            Jatuh tempo:{" "}
            {new Date(loanResult.jatuhTempo).toLocaleDateString("id-ID")}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmModal.open}
        title={
          confirmModal.type === "reject" ? "Tolak Booking" : "Validasi Booking"
        }
        message={
          confirmModal.type === "reject"
            ? "Apakah anda yakin ingin menolak booking ini?"
            : "Apakah anda yakin ingin memvalidasi booking ini menjadi peminjaman?"
        }
        bookTitle={reservation?.book?.judul}
        bookAuthor={reservation?.user?.nama}
        confirmText={confirmModal.type === "reject" ? "Tolak" : "Validasi"}
        cancelText="Batal"
        loading={confirmModal.type === "reject" ? rejecting : validating}
        onConfirm={
          confirmModal.type === "reject" ? handleRejectBooking : handleValidate
        }
        onCancel={closeConfirmModal}
      />
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
