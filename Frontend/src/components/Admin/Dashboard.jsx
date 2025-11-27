import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardData, fetchFilteredPaymentData, clearFilteredData } from "../../redux/slice/admin/dashSlice.js";
import Header from "../../reuse/Header.jsx";
import Nav from "../../reuse/Nav.jsx";
import PaymentDashboardTable from "./DashboardTable.jsx";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux store
  const { cities, drivers, routes, loading, error, filteredPaymentData, isFiltered } = useSelector(
    (state) => state.dash
  );

  const [filters, setFilters] = useState({
    job: "All",
    driver: "All",
    route: "All",
    startDate: "",
    endDate: "",
    paymentStatus: "All",
    companyEarnings: false,
  });

  const [showExtraFields, setShowExtraFields] = useState(false);

  // Calculate totals from filtered data
  const extraFieldsData = useMemo(() => {
    if (!isFiltered || filteredPaymentData.length === 0) {
      return {
        packages: 0,
        noScanned: 0,
        failedAttempt: 0,
        doubleStop: 0,
        delivered: 0,
        driversPayment: 0,
      };
    }

    return filteredPaymentData.reduce((totals, row) => {
      return {
        packages: totals.packages + (Number(row.packages) || 0),
        noScanned: totals.noScanned + (Number(row.no_scanned) || 0),
        failedAttempt: totals.failedAttempt + (Number(row.failed_attempt) || 0),
        doubleStop: totals.doubleStop + (Number(row.ds) || 0),
        delivered: totals.delivered + (Number(row.delivered) || 0),
        driversPayment: totals.driversPayment + (Number(row.driver_payment) || 0),
      };
    }, {
      packages: 0,
      noScanned: 0,
      failedAttempt: 0,
      doubleStop: 0,
      delivered: 0,
      driversPayment: 0,
    });
  }, [filteredPaymentData, isFiltered]);

  // Fetch dropdown data once on mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleFilterClick = () => {
    setShowExtraFields(filters.companyEarnings);
    
    // Prepare filter params (only send non-"All" values)
    const filterParams = {};
    
    if (filters.job !== "All") filterParams.job = filters.job;
    if (filters.driver !== "All") filterParams.driver = filters.driver;
    if (filters.route !== "All") filterParams.route = filters.route;
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;
    if (filters.paymentStatus !== "All") filterParams.paymentStatus = filters.paymentStatus;
    if (filters.companyEarnings) filterParams.companyEarnings = filters.companyEarnings;

    // Dispatch filtered data fetch
    dispatch(fetchFilteredPaymentData(filterParams));
  };

  const handleClearFilters = () => {
    // Reset all filters to default
    setFilters({
      job: "All",
      driver: "All",
      route: "All",
      startDate: "",
      endDate: "",
      paymentStatus: "All",
      companyEarnings: false,
    });
    setShowExtraFields(false);
    
    // Clear filtered data and reset isFiltered flag
    dispatch(clearFilteredData());
  };

  const handleAddDelivery = useCallback(() => {
    navigate("/admin/journeys");
  }, [navigate]);

  const filterOptions = useMemo(
    () => [
      {
        label: "Job",
        type: "select",
        name: "job",
        options: ["All", ...(cities?.map((city) => city.job) || [])],
      },
      {
        label: "Driver",
        type: "select",
        name: "driver",
        options: ["All", ...(drivers?.map((driver) => driver.name) || [])],
      },
      {
        label: "Route",
        type: "select",
        name: "route",
        options: ["All", ...(routes?.map((route) => route.name) || [])],
      },
      { label: "Start Date", type: "date", name: "startDate" },
      { label: "End Date", type: "date", name: "endDate" },
      {
        label: "Payment status",
        type: "select",
        name: "paymentStatus",
        options: ["All", "Paid", "Pending"],
      },
    ],
    [cities, drivers, routes]
  );

  if (loading) return <div className="text-center py-10">Loading data...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

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
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-[160px_1fr_40px] items-center gap-2 sm:gap-3 px-4 py-3"
              >
                <div className="text-gray-600">{item.label}</div>
                {item.type === "select" ? (
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    name={item.name}
                    value={filters[item.name]}
                    onChange={handleFilterChange}
                  >
                    {item.options.map((opt, j) => (
                      <option key={j} value={opt}>
                        {opt}
                      </option>
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

            {/* Filter Buttons */}
            <div className="px-4 py-3 flex gap-3">
              <button
                onClick={handleFilterClick}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                Filter Data
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
                <button
                  onClick={handleAddDelivery}
                   className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  Add Delivery
                </button>
            </div>

            {/* Extra Fields */}
            {showExtraFields && (
              <div className="px-4 py-3 grid grid-cols-1 gap-3">
                <div className="mb-2 font-semibold text-gray-700">
                  Company Earnings Summary
                </div>
                
                {[
                  { field: "packages", label: "Total Packages" },
                  { field: "noScanned", label: "Total No Scanned" },
                  { field: "failedAttempt", label: "Total Failed Attempt" },
                  { field: "doubleStop", label: "Total Double Stop (DS)" },
                  { field: "delivered", label: "Total Delivered" },
                  { field: "driversPayment", label: "Total Drivers Payment" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <label className="w-48 text-gray-600">{item.label}:</label>
                    <input
                      type="text"
                      name={item.field}
                      value={extraFieldsData[item.field]}
                      readOnly
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-semibold"
                    />
                  </div>
                ))}

              
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