import React from "react";


import Header from "../reuse/Header.jsx"; 
import Nav from "../reuse/Nav.jsx";
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      {/* Topbar */}
    
   <Header/>
      {/* Container */}
      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Filters Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
          <div className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3">
            Data Filters
          </div>
          <div className="divide-y">
            {[
              { label: "Job", type: "select", options: ["All", "Pickup", "Delivery"] },
              { label: "Driver", type: "select", options: ["All", "Driver 1", "Driver 2"] },
              { label: "Route", type: "select", options: ["All", "Route A", "Route B"] },
              { label: "Start Date", type: "date" },
              { label: "End Date", type: "date" },
              { label: "Payment status", type: "select", options: ["All", "Paid", "Pending"] },
            ].map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[160px_1fr_40px] items-center gap-3 px-4 py-3"
              >
                <div className="text-gray-600">{item.label}</div>
                {item.type === "select" ? (
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                    {item.options.map((opt, j) => (
                      <option key={j}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={item.type}
                    defaultValue="2025-07-26"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  />
                )}
                <div className="text-gray-400 text-center">
                  {item.type === "select" ? "▾" : "📅"}
                </div>
              </div>
            ))}

            {/* Checkbox */}
            <div className="flex items-center gap-3 px-4 py-3">
              <input type="checkbox" className="w-4 h-4" />
              <span>Company Earnings</span>
            </div>

            {/* Button */}
            <div className="px-4 py-3">
              <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">
                Filter Data
              </button>
            </div>
          </div>
        </section>

        {/* Table Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <div className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3">
            Driver Jobs
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {[
                    "Driver",
                    "Phone",
                    "Job",
                    "Date",
                    "Route",
                    "Sequence",
                    "Packages",
                    "No Scanned",
                    "Failed Attempt",
                    "DS",
                    "Delivered",
                    "Closed",
                    "Driver Payment",
                    "Paid",
                    "-",
                  ].map((head, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 border-b border-gray-200 font-semibold text-gray-800"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Brian N Adkins", "2144060222", "DALLAS", "04/08/25", "36", "1-88", "88", "2", "0", "1", "86", "Yes", "136.25", "Yes"],
                  ["Brian N Adkins", "2144060222", "DALLAS", "05/08/25", "37", "66-125", "60", "0", "0", "0", "60", "Yes", "96.00", "No"],
                  ["Brian N Adkins", "2144060222", "DALLAS", "06/08/25", "40", "76-153", "78", "1", "0", "5", "77", "Yes", "116.45", "Yes"],
                  ["Brian N Adkins", "2144060222", "DALLAS", "08/08/25", "40", "1-75", "75", "1", "0", "6", "74", "Yes", "110.30", "No"],
                  ["Brian N Adkins", "2144060222", "DALLAS", "09/08/25", "40", "1-104", "104", "0", "4", "2", "100", "Yes", "157.30", "No"],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-3 py-2 border-b border-gray-200 ${
                          cell === "Yes" ? "text-green-600 font-semibold" : ""
                        } ${cell === "No" ? "text-red-600 font-semibold" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="px-3 py-2 border-b border-gray-200 text-center">✏️</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Bottom Dock */}
     <Nav/>
    </div>
  );
}
