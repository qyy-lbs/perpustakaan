import { createContext, useContext, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const styles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-black text-white",
  };

  const Icon = toast ? icons[toast.type] || Info : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed right-6 top-6 z-[9999]">
          <div
            className={`flex min-w-[320px] items-center gap-3 rounded-2xl px-5 py-4 shadow-xl ${
              styles[toast.type] || styles.info
            }`}
          >
            {Icon && <Icon size={22} />}

            <p className="flex-1 text-sm font-semibold">{toast.message}</p>

            <button onClick={() => setToast(null)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }

  return context;
}