import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileHeader({
  title,
  subtitle,
  showBack = false,
  children,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-yellow-400 px-6 pb-8 pt-10">
      {showBack && (
        <button onClick={() => navigate(-1)} className="mb-5">
          <ArrowLeft size={24} />
        </button>
      )}

      <h1 className="text-xl font-bold text-black">{title}</h1>

      {subtitle && (
        <p className="mt-1 text-sm text-black/70">
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}