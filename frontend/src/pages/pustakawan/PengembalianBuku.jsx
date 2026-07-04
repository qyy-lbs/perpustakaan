import { useEffect, useRef, useState } from "react";
import {
  Barcode,
  Search,
  UserCircle,
  BookOpen,
  CheckCircle,
  CreditCard,
  ArrowLeft,
  Camera,
  Keyboard,
  RotateCcw,
} from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import { checkReturn, confirmReturn } from "../../services/return.api";
import { createPayment } from "../../services/payment.api";
import { useToast } from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function PengembalianBuku() {
  const { showToast } = useToast();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [mode, setMode] = useState("scan"); // scan | manual | detail
  const [cameraActive, setCameraActive] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  const [form, setForm] = useState({
    isbn: "",
    nimNidn: "",
  });

  const [returnData, setReturnData] = useState(null);
  const [returnResult, setReturnResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    metode: "TUNAI",
    jumlahBayar: "",
  });

  const loan = returnData?.loan || null;
  const resultLoan = returnResult?.loan || null;
  const fine = returnResult?.fine || loan?.fine || null;

  const hariTerlambat =
    returnResult?.hariTerlambat ??
    returnData?.hariTerlambat ??
    fine?.hariTerlambat ??
    0;

  const totalDenda =
    returnResult?.denda ??
    returnData?.denda ??
    fine?.jumlah ??
    0;

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
    setScanLoading(false);
  };

  const startCameraScan = async () => {
    if (!("BarcodeDetector" in window)) {
      showToast(
        "Browser belum mendukung scan barcode. Gunakan Input Manual.",
        "error"
      );
      return;
    }

    try {
      setScanLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setScanLoading(false);

      const barcodeDetector = new window.BarcodeDetector({
        formats: [
          "ean_13",
          "ean_8",
          "code_128",
          "code_39",
          "upc_a",
          "upc_e",
        ],
      });

      scanIntervalRef.current = setInterval(async () => {
        try {
          if (!videoRef.current) return;

          const barcodes = await barcodeDetector.detect(videoRef.current);

          if (barcodes.length > 0) {
            const detectedCode = barcodes[0].rawValue;

            if (detectedCode) {
              stopCamera();

              setForm((prev) => ({
                ...prev,
                isbn: detectedCode,
              }));

              showToast(`Barcode terdeteksi: ${detectedCode}`, "success");

              await handleCheckReturn(null, {
                isbn: detectedCode,
                nimNidn: form.nimNidn,
              });
            }
          }
        } catch (error) {
          console.error(error);
        }
      }, 700);
    } catch (error) {
      console.error(error);
      setScanLoading(false);
      showToast(
        "Kamera tidak bisa dibuka. Izinkan akses kamera atau gunakan Input Manual.",
        "error"
      );
    }
  };

  const handleCheckReturn = async (e, customForm) => {
    if (e) e.preventDefault();

    const payloadForm = customForm || form;

    if (!payloadForm.isbn.trim()) {
      showToast("ISBN buku wajib diisi", "error");
      return;
    }

    try {
      setLoading(true);
      setReturnData(null);
      setReturnResult(null);

      const response = await checkReturn({
        isbn: payloadForm.isbn.trim(),
        nimNidn: payloadForm.nimNidn?.trim() || undefined,
      });

      setReturnData(response.data.data);

      const denda = response.data.data?.denda || 0;

      setPaymentForm((prev) => ({
        ...prev,
        jumlahBayar: denda > 0 ? String(denda) : "",
      }));

      setMode("detail");
      showToast("Data peminjaman ditemukan", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Data peminjaman tidak ditemukan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!loan?.id) {
      showToast("Data loan tidak ditemukan", "error");
      return;
    }

    try {
      setConfirming(true);

      const response = await confirmReturn(loan.id);

      setReturnResult(response.data.data);
      setConfirmModal(false);

      const denda =
        response.data.data?.denda || response.data.data?.fine?.jumlah || 0;

      setPaymentForm((prev) => ({
        ...prev,
        jumlahBayar: denda > 0 ? String(denda) : "",
      }));

      showToast("Pengembalian buku berhasil diproses", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal memproses pengembalian",
        "error"
      );
    } finally {
      setConfirming(false);
    }
  };

  const handlePayment = async () => {
    const fineId = fine?.id;

    if (!fineId) {
      showToast("Data denda tidak ditemukan", "error");
      return;
    }

    if (Number(paymentForm.jumlahBayar || 0) < Number(totalDenda || 0)) {
      showToast("Jumlah bayar kurang dari nominal denda", "error");
      return;
    }

    try {
      setPaying(true);

      await createPayment({
        fineId,
        metode: paymentForm.metode,
        jumlahBayar: Number(paymentForm.jumlahBayar),
      });

      showToast("Pembayaran denda berhasil diterima", "success");

      setReturnResult((prev) => ({
        ...prev,
        fine: {
          ...prev?.fine,
          status: "DIBAYAR",
        },
      }));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Gagal menerima pembayaran denda",
        "error"
      );
    } finally {
      setPaying(false);
    }
  };

  const resetPage = () => {
    stopCamera();

    setMode("scan");
    setForm({
      isbn: "",
      nimNidn: "",
    });
    setReturnData(null);
    setReturnResult(null);
    setPaymentForm({
      metode: "TUNAI",
      jumlahBayar: "",
    });
    setConfirmModal(false);
  };

  const goManualInput = () => {
    stopCamera();
    setMode("manual");
  };

  const goScanPage = () => {
    stopCamera();
    setMode("scan");
    setReturnData(null);
    setReturnResult(null);
  };

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Pengembalian Buku</h1>

        {mode === "scan" && (
          <p className="mt-1 text-gray-500">
            Scan barcode buku yang dikembalikan mahasiswa
          </p>
        )}

        {mode === "manual" && (
          <p className="mt-1 text-gray-500">
            Masukkan ISBN buku untuk mencari peminjaman aktif
          </p>
        )}

        {mode === "detail" && (
          <p className="mt-1 text-gray-500">
            Detail data peminjaman yang ditemukan
          </p>
        )}
      </div>

      {mode === "scan" && (
        <div className="flex justify-center">
          <div className="w-full max-w-[430px] rounded-lg border border-gray-400 bg-white px-14 py-10 shadow-sm">
            <h2 className="mb-8 text-center text-xl font-semibold text-black">
              Scan Barcode Buku
            </h2>

            <div className="relative mx-auto mb-8 flex h-[180px] w-full items-center justify-center overflow-hidden">
              {!cameraActive ? (
                <>
                  <div className="absolute left-0 top-0 h-12 w-12 border-l border-t border-gray-400" />
                  <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-gray-400" />
                  <div className="absolute bottom-0 left-0 h-12 w-12 border-b border-l border-gray-400" />
                  <div className="absolute bottom-0 right-0 h-12 w-12 border-b border-r border-gray-400" />

                  <div className="flex h-20 w-44 items-center justify-center bg-white">
                    <FakeBarcode />
                  </div>
                </>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="h-full w-full rounded-lg object-cover"
                    muted
                    playsInline
                  />

                  <div className="pointer-events-none absolute inset-6 border-2 border-yellow-400" />
                </>
              )}
            </div>

            <div className="space-y-4">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCameraScan}
                  disabled={scanLoading}
                  className="mx-auto flex h-11 w-full items-center justify-center gap-2 rounded-md bg-black px-6 text-sm font-bold text-white shadow"
                >
                  <Camera size={18} />
                  {scanLoading ? "Membuka Kamera..." : "Mulai Scan Kamera"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="mx-auto flex h-11 w-full items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-6 text-sm font-bold text-black"
                >
                  Hentikan Kamera
                </button>
              )}

              <button
                type="button"
                onClick={goManualInput}
                className="mx-auto flex h-11 w-full items-center justify-center gap-2 rounded-md bg-yellow-400 px-6 text-sm font-bold text-white shadow"
              >
                <Keyboard size={18} />
                Input Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="flex justify-center">
          <div className="w-full max-w-[520px] rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <button
              type="button"
              onClick={goScanPage}
              className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-600"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <Barcode size={46} className="text-black" />
              </div>

              <h2 className="text-2xl font-bold text-black">Input Manual</h2>

              <p className="mt-2 text-sm text-gray-500">
                Masukkan ISBN buku yang dikembalikan mahasiswa
              </p>
            </div>

            <form onSubmit={handleCheckReturn} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  ISBN Buku
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-300 px-4">
                  <Search size={20} className="text-gray-400" />

                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="Masukkan ISBN buku"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  NIM Mahasiswa{" "}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </label>

                <input
                  name="nimNidn"
                  value={form.nimNidn}
                  onChange={handleChange}
                  placeholder="Isi jika ingin lebih spesifik"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-yellow-400"
                />
              </div>

              <button
                disabled={loading}
                className="h-12 w-full rounded-xl bg-yellow-400 font-bold text-black shadow-md"
              >
                {loading ? "Mencari..." : "Cari Peminjaman"}
              </button>
            </form>
          </div>
        </div>
      )}

      {mode === "detail" && returnData && (
        <div>
          <button
            type="button"
            onClick={resetPage}
            className="mb-6 flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 font-bold text-black shadow-sm"
          >
            <ArrowLeft size={18} />
            Cari ISBN Lain
          </button>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <UserCircle size={90} className="text-black" />

                  <div>
                    <h2 className="text-3xl font-bold text-black">
                      {loan?.user?.nama || "-"}
                    </h2>
                    <p className="text-xl text-black">
                      NIM. {loan?.user?.nimNidn || "-"}
                    </p>
                    <p className="text-xl text-black">
                      {loan?.user?.role || "-"}
                    </p>
                  </div>
                </div>

                <StatusBox hariTerlambat={hariTerlambat} />
              </div>

              <div className="border-t border-gray-300 py-6">
                <div className="flex gap-4">
                  <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {loan?.book?.coverUrl ? (
                      <img
                        src={loan.book.coverUrl}
                        alt={loan.book.judul}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <BookOpen size={32} className="text-gray-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-xl text-black">Buku</p>
                    <h3 className="text-2xl font-bold text-black">
                      {loan?.book?.judul || "-"}
                    </h3>
                    <p className="text-xl text-black">
                      {loan?.book?.pengarang || "-"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      ISBN: {loan?.book?.isbn || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-gray-300 py-6 md:grid-cols-2">
                <Info
                  label="Tanggal Pinjam"
                  value={formatDate(loan?.tanggalPinjam)}
                />

                <Info
                  label="Jatuh Tempo"
                  value={formatDate(loan?.jatuhTempo)}
                />

                <Info label="Status" value={resultLoan?.status || loan?.status} />

                <Info
                  label="Tanggal Kembali"
                  value={
                    resultLoan?.tanggalKembali
                      ? formatDate(resultLoan.tanggalKembali)
                      : "-"
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl bg-gray-50 p-6">
                <p className="text-xl text-black">Total Denda</p>

                <h2
                  className={`mt-2 text-4xl font-bold ${
                    totalDenda > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Rp {Number(totalDenda || 0).toLocaleString("id-ID")}
                </h2>
              </div>

              {!returnResult ? (
                <button
                  onClick={() => setConfirmModal(true)}
                  disabled={confirming}
                  className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 text-xl font-bold text-white shadow-md"
                >
                  <CheckCircle size={24} />
                  Konfirmasi Pengembalian
                </button>
              ) : totalDenda > 0 && fine?.status !== "DIBAYAR" ? (
                <PaymentBox
                  paymentForm={paymentForm}
                  setPaymentForm={setPaymentForm}
                  totalDenda={totalDenda}
                  paying={paying}
                  onPay={handlePayment}
                />
              ) : (
                <SuccessBox totalDenda={totalDenda} onDone={resetPage} />
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-black">
                Ringkasan Pengembalian
              </h2>

              <div className="space-y-5">
                <SummaryItem label="Nama Peminjam" value={loan?.user?.nama} />
                <SummaryItem label="NIM/NIDN" value={loan?.user?.nimNidn} />
                <SummaryItem label="Email" value={loan?.user?.email} />
                <SummaryItem label="Judul Buku" value={loan?.book?.judul} />
                <SummaryItem label="ISBN" value={loan?.book?.isbn} />
                <SummaryItem
                  label="Status Peminjaman"
                  value={resultLoan?.status || loan?.status}
                />
                <SummaryItem
                  label="Keterlambatan"
                  value={
                    hariTerlambat > 0
                      ? `${hariTerlambat} hari`
                      : "Tidak terlambat"
                  }
                />
                <SummaryItem
                  label="Denda"
                  value={`Rp ${Number(totalDenda || 0).toLocaleString(
                    "id-ID"
                  )}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmModal}
        title="Konfirmasi Pengembalian"
        message="Apakah anda yakin ingin memproses pengembalian buku ini?"
        bookTitle={loan?.book?.judul}
        bookAuthor={loan?.user?.nama}
        confirmText="Kembalikan"
        cancelText="Batal"
        loading={confirming}
        onConfirm={handleConfirmReturn}
        onCancel={() => setConfirmModal(false)}
      />
    </StaffLayout>
  );
}

function FakeBarcode() {
  const bars = [
    3, 2, 2, 4, 1, 3, 2, 5, 2, 1, 4, 2, 3, 1, 2, 5, 3, 2, 1, 4, 2, 3, 2,
    5, 1, 3, 2, 2,
  ];

  return (
    <div className="flex h-16 items-center gap-[3px]">
      {bars.map((width, index) => (
        <span
          key={index}
          className="block h-full bg-black"
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  );
}

function StatusBox({ hariTerlambat }) {
  if (hariTerlambat > 0) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-black">Status</h2>

        <div className="mt-5 rounded-xl bg-red-100 px-8 py-4 text-center text-2xl font-bold text-red-600">
          Terlambat {hariTerlambat} hari
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-black">Status</h2>

      <div className="mt-5 rounded-xl bg-green-100 px-8 py-4 text-center text-2xl font-bold text-green-600">
        Tepat Waktu
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-lg text-black">{label}</p>
      <p className="mt-1 text-xl font-bold text-black">{value || "-"}</p>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-black">{value || "-"}</p>
    </div>
  );
}

function PaymentBox({
  paymentForm,
  setPaymentForm,
  totalDenda,
  paying,
  onPay,
}) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 p-6">
      <h2 className="mb-5 text-2xl font-bold text-black">
        Terima Pembayaran
      </h2>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold">
            Metode Pembayaran
          </label>

          <select
            value={paymentForm.metode}
            onChange={(e) =>
              setPaymentForm({
                ...paymentForm,
                metode: e.target.value,
              })
            }
            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none"
          >
            <option value="TUNAI">Tunai</option>
            <option value="TRANSFER">Transfer</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Jumlah Bayar</label>

          <input
            type="number"
            value={paymentForm.jumlahBayar}
            onChange={(e) =>
              setPaymentForm({
                ...paymentForm,
                jumlahBayar: e.target.value,
              })
            }
            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none"
          />
        </div>

        <div className="rounded-xl bg-yellow-50 p-4 text-sm">
          <div className="flex justify-between">
            <span>Nominal Denda</span>
            <strong>
              Rp {Number(totalDenda || 0).toLocaleString("id-ID")}
            </strong>
          </div>

          <div className="mt-2 flex justify-between">
            <span>Kembalian</span>
            <strong>
              Rp{" "}
              {Math.max(
                0,
                Number(paymentForm.jumlahBayar || 0) - Number(totalDenda || 0)
              ).toLocaleString("id-ID")}
            </strong>
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={paying}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 font-bold text-white shadow-md"
        >
          <CreditCard size={22} />
          {paying ? "Memproses..." : "Bayar Denda"}
        </button>
      </div>
    </div>
  );
}

function SuccessBox({ totalDenda, onDone }) {
  return (
    <div className="mt-8 rounded-2xl bg-green-100 p-6 text-center text-green-700">
      <CheckCircle className="mx-auto mb-3" size={48} />

      <h2 className="text-2xl font-bold">Pengembalian Berhasil</h2>

      <p className="mt-2">
        {totalDenda > 0
          ? "Denda sudah dibayarkan."
          : "Tidak ada denda yang harus dibayarkan."}
      </p>

      <button
        onClick={onDone}
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-10 font-bold text-white"
      >
        <RotateCcw size={18} />
        Cari ISBN Lain
      </button>
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