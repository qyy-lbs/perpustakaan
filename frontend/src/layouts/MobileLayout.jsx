import BottomNav from "../components/BottomNav";

export default function MobileLayout({ children, role = "mahasiswa" }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white pb-24 shadow-sm">
        {children}
        <BottomNav role={role} />
      </div>
    </div>
  );
}