export default function StatusBadge({ status }) {
  const styles = {
    TERSEDIA: "bg-green-100 text-green-700",
    TIDAK_TERSEDIA: "bg-red-100 text-red-700",

    MENUNGGU_PENGAMBILAN: "bg-yellow-100 text-yellow-700",
    DIPINJAM: "bg-blue-100 text-blue-700",
    DIBATALKAN: "bg-red-100 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-700",

    AKTIF: "bg-green-100 text-green-700",
    TERLAMBAT: "bg-red-100 text-red-700",
    SELESAI: "bg-gray-100 text-gray-700",

    MENUNGGU: "bg-yellow-100 text-yellow-700",
    DITINJAU: "bg-blue-100 text-blue-700",
    DISETUJUI: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",

    BELUM_DIBAYAR: "bg-red-100 text-red-700",
    DIBAYAR: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "-"}
    </span>
  );
}