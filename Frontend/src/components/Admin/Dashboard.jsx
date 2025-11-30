import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboardData,
  fetchFilteredPaymentData,
  clearFilteredData,
  selectAllCities,
  selectAllDrivers,
  selectAllRoutes,
} from "../../redux/slice/admin/dashSlice.js";
import Header from "../../reuse/Header.jsx";
import Nav from "../../reuse/Nav.jsx";
import PaymentDashboardTable from "./DashboardTable.jsx";

const INITIAL_FILTERS = {
  job: "All",
  driver: "All",
  route: "All",
  startDate: "",
  endDate: "",
  paymentStatus: "All",
  companyEarnings: false,
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Use memoized selectors
  const cities = useSelector(selectAllCities);
  const drivers = useSelector(selectAllDrivers);
  const routes = useSelector(selectAllRoutes);

  const {
    dropdownStatus,
    paymentStatus,
    error,
    filteredPaymentData,
    isFiltered,
  } = useSelector((state) => state.dash);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showExtraFields, setShowExtraFields] = useState(false);

  // Refs
  const dataFetchedRef = useRef(false);

  // ✅ Fetch dropdown data once on mount
  useEffect(() => {
    if (!dataFetchedRef.current && dropdownStatus === "idle") {
      dispatch(fetchDashboardData());
      dataFetchedRef.current = true;
    }
  }, [dispatch, dropdownStatus]);

  // ✅ Memoized totals calculation
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

    return filteredPaymentData.reduce(
      (totals, row) => ({
        packages: totals.packages + (Number(row.packages) || 0),
        noScanned: totals.noScanned + (Number(row.no_scanned) || 0),
        failedAttempt: totals.failedAttempt + (Number(row.failed_attempt) || 0),
        doubleStop: totals.doubleStop + (Number(row.ds) || 0),
        delivered: totals.delivered + (Number(row.delivered) || 0),
        driversPayment: totals.driversPayment + (Number(row.driver_payment) || 0),
      }),
      {
        packages: 0,
        noScanned: 0,
        failedAttempt: 0,
        doubleStop: 0,
        delivered: 0,
        driversPayment: 0,
      }
    );
  }, [filteredPaymentData, isFiltered]);

  // ✅ Memoized filter change handler
  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // ✅ Memoized filter preparation
  const prepareFilterParams = useCallback((filterState) => {
    const params = {};

    if (filterState.job !== "All") params.job = filterState.job;
    if (filterState.driver !== "All") params.driver = filterState.driver;
    if (filterState.route !== "All") params.route = filterState.route;
    if (filterState.startDate) params.startDate = filterState.startDate;
    if (filterState.endDate) params.endDate = filterState.endDate;
    if (filterState.paymentStatus !== "All") params.paymentStatus = filterState.paymentStatus;
    if (filterState.companyEarnings) params.companyEarnings = filterState.companyEarnings;

    return params;
  }, []);

  // ✅ Memoized filter click handler
  const handleFilterClick = useCallback(() => {
    setShowExtraFields(filters.companyEarnings);
    const filterParams = prepareFilterParams(filters);
    dispatch(fetchFilteredPaymentData(filterParams));
  }, [filters, dispatch, prepareFilterParams]);

  // ✅ Memoized clear filters handler
  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setShowExtraFields(false);
    dispatch(clearFilteredData());
  }, [dispatch]);

  // ✅ Memoized navigation handler
  const handleAddDelivery = useCallback(() => {
    navigate("/admin/journeys");
  }, [navigate]);

  // ✅ Memoized filter options
  const filterOptions = useMemo(
    () => [
      {
        label: "Job",
        type: "select",
        name: "job",
        options: ["All", ...cities.map((city) => city.job)],
      },
      {
        label: "Driver",
        type: "select",
        name: "driver",
        options: ["All", ...drivers.map((driver) => driver.name)],
      },
      {
        label: "Route",
        type: "select",
        name: "route",
        options: ["All", ...routes.map((route) => route.name || route.route)],
      },
      { label: "Start Date", type: "date", name: "startDate" },
      { label: "End Date", type: "date", name: "endDate" },
      {
        label: "Payment Status",
        type: "select",
        name: "paymentStatus",
        options: ["All", "Paid", "Pending"],
      },
    ],
    [cities, drivers, routes]
  );

  // ✅ Memoized summary fields
  const summaryFields = useMemo(
    () => [
      { field: "packages", label: "Total Packages" },
      { field: "noScanned", label: "Total No Scanned" },
      { field: "failedAttempt", label: "Total Failed Attempt" },
      { field: "doubleStop", label: "Total Double Stop (DS)" },
      { field: "delivered", label: "Total Delivered" },
      { field: "driversPayment", label: "Total Drivers Payment" },
    ],
    []
  );

  // Loading states
  const isLoadingDropdowns = dropdownStatus === "loading";
  const isLoadingPayments = paymentStatus === "loading";

  if (isLoadingDropdowns && cities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && dropdownStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600 py-10">
          <p className="text-xl font-semibold mb-2">Error Loading Dashboard</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />

      <main className="max-w-[1450px] mx-auto p-2 sm:p-4 pb-20 sm:pb-40">
        {/* Filters Card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
          <div className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            Data Filters
          </div>

          <div className="divide-y">
            {filterOptions.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2 sm:gap-3 px-4 py-3"
              >
                <label className="text-gray-600 font-medium">{item.label}</label>
                {item.type === "select" ? (
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    name={item.name}
                    value={filters[item.name]}
                    onChange={handleFilterChange}
                    disabled={isLoadingPayments}
                  >
                    {item.options.map((opt) => (
                      <option key={opt} value={opt}>
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
                    disabled={isLoadingPayments}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                )}
              </div>
            ))}

            {/* Checkbox */}
            <div className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                name="companyEarnings"
                checked={filters.companyEarnings}
                onChange={handleFilterChange}
                disabled={isLoadingPayments}
                className="w-4 h-4 text-blue-600 disabled:opacity-50"
              />
              <label className="font-medium">Show Company Earnings Summary</label>
            </div>

            {/* Filter Buttons */}
            <div className="px-4 py-3 flex flex-wrap gap-3">
              <button
                onClick={handleFilterClick}
                disabled={isLoadingPayments}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingPayments ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Filtering...</span>
                  </>
                ) : (
                  "Filter Data"
                )}
              </button>

              <button
                onClick={handleClearFilters}
                disabled={isLoadingPayments}
                className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Filters
              </button>

              <button
                onClick={handleAddDelivery}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors"
              >
                Add Delivery
              </button>
            </div>

            {/* Extra Fields */}
            {showExtraFields && (
              <div className="px-4 py-3 bg-blue-50 border-t-2 border-blue-200">
                <div className="mb-3 font-semibold text-blue-900 text-lg">
                  Company Earnings Summary
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summaryFields.map((item) => (
                    <div key={item.field} className="flex items-center gap-3">
                      <label className="w-48 text-gray-700 font-medium">
                        {item.label}:
                      </label>
                      <input
                        type="text"
                        value={extraFieldsData[item.field].toLocaleString()}
                        readOnly
                        className="flex-1 border border-blue-300 rounded-lg px-3 py-2 bg-white text-gray-900 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Table */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <div className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            Driver Jobs
          </div>

          {isLoadingPayments ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">Loading payment data...</p>
              </div>
            </div>
          ) : (
            <PaymentDashboardTable showExtraFields={showExtraFields} />
          )}
        </section>
      </main>

      <Nav />
    </div>
  );
}