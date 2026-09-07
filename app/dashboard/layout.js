import Sidebar from "../_HeaderComponent/Sidebar";
import TopHeader from "../_HeaderComponent/TopHeader";


export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050b14] text-white">
      <TopHeader />
        <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
