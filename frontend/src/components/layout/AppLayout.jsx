import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AnimatedPage from "../common/AnimatedPage";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-700">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex min-w-0 flex-grow flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="flex-grow overflow-y-auto">
          <div className="mx-auto min-h-full max-w-6xl p-4 sm:p-6 lg:p-10">
            <AnimatePresence mode="wait">
              <AnimatedPage key={location.pathname}>
                <Outlet />
              </AnimatedPage>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
