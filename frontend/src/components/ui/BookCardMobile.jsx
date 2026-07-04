import StatusBadge from "./StatusBadge";

export default function BookCardMobile({ book, onClick, showStatus = true }) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
    >
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-200">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.judul}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No Cover
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 font-bold leading-tight text-gray-900">
          {book.judul}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {book.pengarang}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          Rak: {book.rack?.kodeRak || "-"}
        </p>

        {showStatus && (
          <div className="mt-2">
            <StatusBadge
              status={book.stokTersedia > 0 ? "TERSEDIA" : "TIDAK_TERSEDIA"}
            />
          </div>
        )}
      </div>
    </div>
  );
}