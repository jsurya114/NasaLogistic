import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Header from "../../reuse/driver/Header";
import Nav from "../../reuse/driver/Nav";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeliverySummary, resetDeliveries, setDeliveriesFromCache } from "../../redux/slice/driver/deliverySlice.js";
import { accessDriver } from "../../redux/slice/driver/driverSlice.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const Deliveries = () => {
  const dispatch = useDispatch();
  const { deliveries, status, error } = useSelector((state) => state.delivery);
  const driver = useSelector((state) => state.driver?.driver);
  const isAuthenticated = useSelector((state) => state.driver?.isAuthenticated);

  const [filters, setFilters] = useState({ from_date: "", to_date: "" });
  const [hasFiltered, setHasFiltered] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  // Use refs to prevent toast spam
  const lastSuccessToast = useRef(0);
  const lastErrorToast = useRef(0);
  const initialLoadDone = useRef(false);

  // ✅ Memoized summary calculation
  const summary = useMemo(() => {
    if (!deliveries || deliveries.length === 0) return null;
    return deliveries.reduce(
      (acc, d) => ({
        packages: acc.packages + (parseInt(d.packages) || 0),
        no_scanned: acc.no_scanned + (parseInt(d.no_scanned) || 0),
        failed_attempt: acc.failed_attempt + (parseInt(d.failed_attempt) || 0),
        double_stop: acc.double_stop + (parseInt(d.double_stop) || 0),
        delivered: acc.delivered + (parseInt(d.delivered) || 0),
        earning: acc.earning + (parseFloat(d.earning) || 0),
      }),
      { packages: 0, no_scanned: 0, failed_attempt: 0, double_stop: 0, delivered: 0, earning: 0 }
    );
  }, [deliveries]);

  // ✅ Load from localStorage ONCE with cache validation
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const savedFilters = localStorage.getItem("deliveryFilters");
    const savedDeliveries = localStorage.getItem("deliveryData");
    const savedTimestamp = localStorage.getItem("deliveryTimestamp");

    if (savedFilters && savedDeliveries && savedTimestamp) {
      const cacheAge = Date.now() - parseInt(savedTimestamp);
      
      // Only use cache if it's less than 5 minutes old
      if (cacheAge < CACHE_DURATION) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          const parsedDeliveries = JSON.parse(savedDeliveries);
          
          if (parsedDeliveries.length > 0) {
            setFilters(parsedFilters);
            setHasFiltered(true);
            // Use new action instead of direct dispatch
            dispatch(setDeliveriesFromCache(parsedDeliveries));
          }
        } catch (err) {
          console.error("Failed to parse cached data:", err);
          localStorage.removeItem("deliveryData");
          localStorage.removeItem("deliveryFilters");
          localStorage.removeItem("deliveryTimestamp");
        }
      } else {
        // Clear stale cache
        localStorage.removeItem("deliveryData");
        localStorage.removeItem("deliveryFilters");
        localStorage.removeItem("deliveryTimestamp");
      }
    }
  }, [dispatch]);

  // ✅ Fetch driver data once
  useEffect(() => {
    if (!driver && isAuthenticated !== false) {
      dispatch(accessDriver());
    }
  }, [dispatch, driver, isAuthenticated]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetDeliveries());
    };
  }, [dispatch]);

  // ✅ Success toast with debouncing
  useEffect(() => {
    if (status === "succeeded" && hasFiltered && deliveries?.length > 0) {
      const now = Date.now();
      
      // Only show toast if 3 seconds have passed since last one
      if (now - lastSuccessToast.current > 3000) {
        // Save to localStorage with timestamp
        localStorage.setItem("deliveryData", JSON.stringify(deliveries));
        localStorage.setItem("deliveryFilters", JSON.stringify(filters));
        localStorage.setItem("deliveryTimestamp", Date.now().toString());

        toast.success(
          `Successfully fetched ${deliveries.length} delivery record${deliveries.length === 1 ? "" : "s"}!`,
          { position: "top-right", autoClose: 3000, toastId: "delivery-success" }
        );
        lastSuccessToast.current = now;
      }
    }
  }, [status, hasFiltered, deliveries, filters]);

  // ✅ Error toast with debouncing
  useEffect(() => {
    if (status === "failed" && error) {
      const now = Date.now();
      
      // Only show toast if 3 seconds have passed since last one
      if (now - lastErrorToast.current > 3000) {
        toast.error(error, { 
          position: "top-right", 
          autoClose: 4000,
          toastId: "delivery-error" 
        });
        lastErrorToast.current = now;
      }
    }
  }, [status, error]);

  // ✅ Memoized handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  }, []);

  const handleFilter = useCallback(
    (e) => {
      e.preventDefault();

      // Validation
      if (!filters.from_date || !filters.to_date) {
        setValidationError("Please select both From and To dates");
        return;
      }

      if (new Date(filters.from_date) > new Date(filters.to_date)) {
        setValidationError("From Date cannot be after To Date");
        return;
      }

      if (!driver?.id) {
        setValidationError("Driver ID missing. Please log in again.");
        return;
      }

      setValidationError("");
      setHasFiltered(true);
      dispatch(fetchDeliverySummary({ driverId: driver.id, ...filters }));
    },
    [dispatch, filters, driver]
  );

  const handleReset = useCallback(() => {
    setFilters({ from_date: "", to_date: "" });
    setHasFiltered(false);
    setValidationError("");
    dispatch(resetDeliveries());
    localStorage.removeItem("deliveryData");
    localStorage.removeItem("deliveryFilters");
    localStorage.removeItem("deliveryTimestamp");
    // Reset toast timers
    lastSuccessToast.current = 0;
    lastErrorToast.current = 0;
  }, [dispatch]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  }, []);

  // ✅ Memoized table headers
  const tableHeaders = useMemo(() => [
    "Date", "Route", "Start Seq", "End Seq", "Packages", 
    "Not Scanned", "Failed", "Double Stop", "Delivered", "Earning"
  ], []);

  // ✅ Memoized summary labels
  const summaryLabels = useMemo(() => ({
    "Total Packages": summary?.packages,
    Delivered: summary?.delivered,
    Failed: summary?.failed_attempt,
    "Not Scanned": summary?.no_scanned,
    "Double Stop": summary?.double_stop,
    "Total Earning": summary ? `$${summary.earning.toFixed(2)}` : "₹0.00",
  }), [summary]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins">
      <Header />

      <main className="max-w-6xl mx-auto mt-6 mb-24 px-6 pb-36">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Delivery Summary</h2>
            <p className="text-sm text-gray-500 mt-1">Filter deliveries by date range</p>
          </div>

          <form onSubmit={handleFilter} className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">From Date</label>
              <input
                type="date"
                name="from_date"
                value={filters.from_date}
                onChange={handleChange}
                max={filters.to_date || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">To Date</label>
              <input
                type="date"
                name="to_date"
                value={filters.to_date}
                onChange={handleChange}
                min={filters.from_date || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Loading..." : "Filter"}
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                disabled={status === "loading"}
              >
                Reset
              </button>
            </div>

            {validationError && (
              <div className="sm:col-span-4 mt-2 text-red-600 text-sm font-medium">{validationError}</div>
            )}
          </form>

          {/* Summary */}
          {summary && (
            <div className="px-6 pb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(summaryLabels).map(([label, value]) => (
                    <div key={label}>
                      <label className="block text-xs text-gray-600 mb-1">{label}</label>
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="w-full px-3 py-2 text-center text-lg font-bold bg-white border rounded-md cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {hasFiltered && status === "succeeded" && (!deliveries || deliveries.length === 0) && (
            <div className="px-6 pb-6 text-center text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p>No deliveries found for {formatDate(filters.from_date)} to {formatDate(filters.to_date)}</p>
            </div>
          )}

          {error && (
            <div className="px-6 pb-6 text-center text-red-700 bg-red-50 border border-red-200 rounded-md p-4">
              <p>{error}</p>
            </div>
          )}

          {!hasFiltered && status === "idle" && (
            <div className="px-6 pb-6 text-center text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p>Please select a date range and click "Filter" to view delivery records</p>
            </div>
          )}
        </div>

        {/* Table */}
        {deliveries && deliveries.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {tableHeaders.map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d, i) => (
                    <tr key={d.id || i} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(d.journey_date)}</td>
                      <td className="px-4 py-3 text-sm">{d.route_name}</td>
                      <td className="px-4 py-3 text-sm text-center">{d.start_seq}</td>
                      <td className="px-4 py-3 text-sm text-center">{d.end_seq}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 text-center">{d.packages}</td>
                      <td className="px-4 py-3 text-sm text-yellow-600 text-center">{d.no_scanned}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-center">{d.failed_attempt}</td>
                      <td className="px-4 py-3 text-sm text-purple-600 text-center">{d.double_stop}</td>
                      <td className="px-4 py-3 text-sm text-green-600 text-center">{d.delivered}</td>
                      <td className="px-4 py-3 text-sm text-indigo-600 font-semibold">
                        ${parseFloat(d.earning || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Nav />
      <ToastContainer />
    </div>
  );
};

export default Deliveries;