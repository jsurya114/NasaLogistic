import React from "react";
import logo from "../../assets/logo.png"
const DriverDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#1f2633] font-poppins">
      {/* Topbar */}
      <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center h-[72px] bg-[#462976] text-white px-4 border-b border-white/10">
        <div className="font-semibold justify-self-start">Driver Dashboard</div>
        <div className="logo justify-self-center mt-1">
          <span className="inline-block font-extrabold">
            <img src={logo} alt="Nasa Logistic Carriers Logo" className="w-44" />
          </span>
        </div>
        <div className="flex items-center gap-3 justify-self-end">
          <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
            👤
          </div>
          <div className="font-semibold">Nasa Logistic Carriers LLC ▾</div>
          <button className="bg-[#e53935] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#c62828] transition-colors">
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1450px] mx-auto mt-4 mb-24 px-4 pb-36">
        {/* Card */}
        <div className="bg-white border border-[#e4e7eb] rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="divide-y divide-[#e4e7eb]">
            <div className="grid grid-cols-[160px_1fr_40px] items-center gap-2 px-4 py-3">
              <div className="text-gray-600">Date:</div>
              <div>07/25/2025</div>
            </div>
            <div className="grid grid-cols-[160px_1fr_40px] items-center gap-2 px-4 py-3">
              <div className="text-gray-600">Route:</div>
              <div>37</div>
            </div>
            <div className="grid grid-cols-[160px_1fr_40px] items-center gap-2 px-4 py-3">
              <div className="text-gray-600">Start Package Sequence:</div>
              <div>81</div>
            </div>
            <div className="grid grid-cols-[160px_1fr_40px] items-center gap-2 px-4 py-3">
              <div className="text-gray-600">End Package Sequence:</div>
              <div>210</div>
            </div>
            <div className="grid grid-cols-[160px_1fr_40px] items-center gap-2 px-4 py-3">
              <div className="text-gray-600">Num Packages:</div>
              <div>130</div>
            </div>
            <div className="grid grid-cols-[160px_1fr_40px] items-center gap-2 px-4 py-3">
              <div className="text-gray-600">Failed Attempt:</div>
              <div>0</div>
            </div>
          </div>
        </div>
      </main>

      {/* Dock */}
      <nav className="fixed left-0 right-0 bottom-0 bg-[#153a6a] border-t border-white/10">
        <div className="grid grid-flow-col gap-4 justify-center px-4 py-3 max-w-[1200px] mx-auto">
          <a
            href="index.html"
            className="bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
              📊
            </div>
            <small className="text-[13px] font-semibold">Dashboard</small>
          </a>
          <a
            href="routes.html"
            className="bg-white text-[#1f2633] rounded-xl px-4 py-2 min-w-[105px] flex flex-col items-center gap-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-2xl">
              🧭
            </div>
            <small className="text-[13px] font-semibold">Routes</small>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default DriverDashboard;
