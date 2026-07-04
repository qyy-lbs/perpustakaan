import { useState } from "react";
import StaffSidebar from "../components/StaffSidebar";

export default function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      <StaffSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      <main
        className={`min-h-screen bg-white px-6 py-8 transition-all duration-300 lg:px-10 xl:px-14 ${
          sidebarOpen ? "ml-[280px]" : "ml-[86px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}