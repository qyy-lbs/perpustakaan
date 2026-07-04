export default function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "yellow",
  className = "",
}) {
  const variants = {
    yellow: "bg-yellow-400 text-black hover:bg-yellow-300",
    black: "bg-black text-white hover:bg-gray-800",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    border: "border border-gray-200 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}