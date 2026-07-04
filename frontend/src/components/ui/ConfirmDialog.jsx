export default function ConfirmDialog({
  open,
  title = "Konfirmasi",
  message,
  bookTitle,
  bookAuthor,
  confirmText = "Hapus",
  cancelText = "Batal",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-[560px] rounded-xl bg-white px-10 py-8 shadow-2xl">
        <h2 className="text-center text-4xl font-bold text-black">
          {title}
        </h2>

        <div className="mt-8 text-[25px] leading-snug text-black">
          {message && <p>{message}</p>}

          {bookTitle && (
            <p className="font-bold">
              {bookTitle}
            </p>
          )}

          {bookAuthor && (
            <p>
              ({bookAuthor})
            </p>
          )}

          <p className="mt-8">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-[54px] rounded-lg border border-gray-500 bg-white text-3xl font-bold text-black shadow-sm"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-[54px] rounded-lg bg-yellow-400 text-3xl font-bold text-white shadow-md"
          >
            {loading ? "Menghapus..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}