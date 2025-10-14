import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../reuse/Header.jsx"; 
import Nav from "../../reuse/Nav.jsx";
import PaymentDashboardTable from "./DashboardTable.jsx";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cities } = useSelector((state) => state.jobs);
  const { drivers } = useSelector((state) => state.users);
  const { routes } = useSelector((state) => state.routes);

  const [filters, setFilters] = useState({
    job: "All",
    driver: "All",
    route: "All",
    startDate: "2025-07-26",
    endDate: "2025-07-26",
    paymentStatus: "All",
    companyEarnings: false,
  });

  const [showExtraFields, setShowExtraFields] = useState(false);
  const [extraFieldsData] = useState({
    packages: "",
    noScanned: "",
    failedAttempt: "",
    doubleStop: "",
    delivered: "",
    driversPayment: "",
  });

  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleFilterClick = () => {
    // Only show extra fields if Company Earnings is checked
    if (filters.companyEarnings) {
      setShowExtraFields(true);
    } else {
      setShowExtraFields(false);
    }
  };

  const handleAddDelivery = useCallback(() => {
    navigate("/admin/journeys");
  }, [navigate]);

  const filterOptions = useMemo(() => [
    { label: "Job", type: "select", name: "job", options: ["All", ...cities.map(city => city.job)] },
    { label: "Driver", type: "select", name: "driver", options: ["All", ...drivers.map(driver => driver.name)] },
    { label: "Route", type: "select", name: "route", options: ["All", ...routes.map(route => route.name)] },
    { label: "Start Date", type: "date", name: "startDate" },
    { label: "End Date", type: "date", name: "endDate" },
    { label: "Payment status", type: "select", name: "paymentStatus", options: ["All", "Paid", "Pending"] },
  ], [cities, drivers, routes]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />

      <main className="max-w-[1450px] mx-auto p-2 sm:p-4 pb-20 sm:pb-40">
        {/* Filters Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
          <div className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3">
            Data Filters
          </div>
          <div className="divide-y">
            {filterOptions.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_40px] items-center gap-2 sm:gap-3 px-4 py-3">
                <div className="text-gray-600">{item.label}</div>
                {item.type === "select" ? (
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    name={item.name}
                    value={filters[item.name]}
                    onChange={handleFilterChange}
                  >
                    {item.options.map((opt, j) => (
                      <option key={j} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={item.type}
                    name={item.name}
                    value={filters[item.name]}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                )}
                <div className="text-gray-400 text-center hidden sm:block">
                  {item.type === "select" ? "▾" : "📅"}
                </div>
              </div>
            ))}

            {/* Checkbox */}
            <div className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                name="companyEarnings"
                checked={filters.companyEarnings}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span>Company Earnings</span>
            </div>

            {/* Filter Button */}
            <div className="px-4 py-3">
              <button
                onClick={handleFilterClick}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
              >
                Filter Data
              </button>
            </div>

            {/* Extra Fields (Read-Only) */}
            {showExtraFields && (
              <div className="px-4 py-3 grid grid-cols-1 gap-3">
                {["packages", "noScanned", "failedAttempt", "doubleStop", "delivered", "driversPayment"].map((field, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={extraFieldsData[field]}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                ))}

                {/* Add Delivery Button */}
                <button
                  onClick={handleAddDelivery}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 w-full sm:w-40 mx-auto"
                >
                  Add Delivery
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Table */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <div className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3">
            Driver Jobs
          </div>
          <PaymentDashboardTable showExtraFields={showExtraFields} />
        </section>
      </main>

      <Nav />
    </div>
  );
}