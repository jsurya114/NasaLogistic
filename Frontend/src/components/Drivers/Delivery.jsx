import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Header from "../../reuse/driver/Header";
import Nav from "../../reuse/driver/Nav";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchDeliverySummary, 
  resetDeliveries, 
  setDeliveriesFromCache 
} from "../../redux/slice/driver/deliverySlice.js";
import { accessDriver } from "../../redux/slice/driver/driverSlice.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TOAST_COOLDOWN = 3000; // 3 seconds between toasts

// ✅ Cache utilities extracted
const DeliveryCache = {
  save: (filters, deliveries) => {
    try {
      localStorage.setItem("deliveryData", JSON.stringify(deliveries));
      localStorage.setItem("deliveryFilters", JSON.stringify(filters));
      localStorage.setItem("deliveryTimestamp", Date.now().toString());
    } catch (err) {
      console.error("Failed to save cache:", err);
    }
  },
  
  load: () => {
    try {
      const savedFilters = localStorage.getItem("deliveryFilters");
      const savedDeliveries = localStorage.getItem("deliveryData");
      const savedTimestamp = localStorage.getItem("deliveryTimestamp");

      if (!savedFilters || !savedDeliveries || !savedTimestamp) return null;

      const cacheAge = Date.now() - parseInt(savedTimestamp);
      if (cacheAge >= CACHE_DURATION) {
        DeliveryCache.clear();
        return null;
      }

      return {
        filters: JSON.parse(savedFilters),
        deliveries: JSON.parse(savedDeliveries)
      };
    } catch (err) {
      console.error("Failed to load cache:", err);
      DeliveryCache.clear();
      return null;
    }
  },
  
  clear: () => {
    localStorage.removeItem("deliveryData");
    localStorage.removeItem("deliveryFilters");
    localStorage.removeItem("deliveryTimestamp");
  }
};

// ✅ Date validation utility
const validateDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return "Please select both From and To dates";
  }
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return "Invalid date format";
  }
  
  if (from > to) {
    return "From Date cannot be after To Date";
  }
  
  return null;
};

const Deliveries = () => {
  const dispatch = useDispatch();
  const { deliveries, status, error } = useSelector((state) => state.delivery);
  const driver = useSelector((state) => state.driver?.driver);
  const isAuthenticated = useSelector((state) => state.driver?.isAuthenticated);

  const [filters, setFilters] = useState({ from_date: "", to_date: "" });
  const [hasFiltered, setHasFiltered] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  // ✅ Refs for controlling side effects
  const lastSuccessToast = useRef(0);
  const lastErrorToast = useRef(0);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const lastSavedDataRef = useRef(null); // Track last saved data to avoid duplicate saves

  // ✅ Memoized summary calculation
  const summary = useMemo(() => {
    if (!deliveries?.length) return null;
    
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

  // ✅ Load from cache ONCE on mount
  useEffect(() => {
    const cached = DeliveryCache.load();
    
    if (cached && cached.deliveries.length > 0) {
      setFilters(cached.filters);
      setHasFiltered(true);
      dispatch(setDeliveriesFromCache(cached.deliveries));
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, []); // No dependencies - truly runs once

  // ✅ Fetch driver data if needed
  useEffect(() => {
    if (!driver && isAuthenticated !== false) {
      dispatch(accessDriver());
    }
  }, [dispatch, driver, isAuthenticated]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      dispatch(resetDeliveries());
    };
  }, [dispatch]);

  // ✅ Smart cache saving - only when data actually changes
  useEffect(() => {
    if (status !== "succeeded" || !hasFiltered || !deliveries?.length) return;
    
    // Create a stable string representation for comparison
    const currentData = JSON.stringify({
      filters,
      count: deliveries.length,
      firstId: deliveries[0]?.id,
      lastId: deliveries[deliveries.length - 1]?.id
    });
    
    // Only save if data actually changed
    if (lastSavedDataRef.current !== currentData) {
      DeliveryCache.save(filters, deliveries);
      lastSavedDataRef.current = currentData;
      
      // Show success toast with cooldown
      const now = Date.now();
      if (now - lastSuccessToast.current > TOAST_COOLDOWN) {
        toast.success(
          `Successfully fetched ${deliveries.length} delivery record${deliveries.length === 1 ? "" : "s"}!`,
          { position: "top-right", autoClose: 3000, toastId: "delivery-success" }
        );
        lastSuccessToast.current = now;
      }
    }
  }, [status, hasFiltered, deliveries, filters]);

  // ✅ Error toast with cooldown
  useEffect(() => {
    if (status !== "failed" || !error) return;
    
    const now = Date.now();
    if (now - lastErrorToast.current > TOAST_COOLDOWN) {
      toast.error(error, { 
        position: "top-right", 
        autoClose: 4000,
        toastId: "delivery-error" 
      });
      lastErrorToast.current = now;
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
      const dateError = validateDateRange(filters.from_date, filters.to_date);
      if (dateError) {
        setValidationError(dateError);
        return;
      }

      if (!driver?.id) {
        setValidationError("Driver ID missing. Please log in again.");
        return;
      }

      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setValidationError("");
      setHasFiltered(true);
      
      dispatch(fetchDeliverySummary({ 
        driverId: driver.id, 
        ...filters 
      }));
    },
    [dispatch, filters, driver]
  );

  const handleReset = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setFilters({ from_date: "", to_date: "" });
    setHasFiltered(false);
    setValidationError("");
    dispatch(resetDeliveries());
    DeliveryCache.clear();
    
    // Reset refs
    lastSuccessToast.current = 0;
    lastErrorToast.current = 0;
    lastSavedDataRef.current = null;
  }, [dispatch]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return "-";
    }
  }, []);

  // ✅ Memoized static data
  const tableHeaders = useMemo(() => [
    "Date", "Route", "Start Seq", "End Seq", "Packages", 
    "Not Scanned", "Failed", "Double Stop", "Delivered", "Earning"
  ], []);

  const summaryLabels = useMemo(() => {
    if (!summary) return {};
    
    return {
      "Total Packages": summary.packages,
      Delivered: summary.delivered,
      Failed: summary.failed_attempt,
      "Not Scanned": summary.no_scanned,
      "Double Stop": summary.double_stop,
      "Total Earning": `$${summary.earning.toFixed(2)}`,
    };
  }, [summary]);

  // ✅ Memoized loading state
  const isLoading = useMemo(() => status === "loading", [status]);

  // ✅ Memoized empty state message
  const emptyStateMessage = useMemo(() => {
    if (!hasFiltered && status === "idle") {
      return {
        type: "info",
        message: 'Please select a date range and click "Filter" to view delivery records'
      };
    }
    
    if (hasFiltered && status === "succeeded" && !deliveries?.length) {
      return {
        type: "warning",
        message: `No deliveries found for ${formatDate(filters.from_date)} to ${formatDate(filters.to_date)}`
      };
    }
    
    return null;
  }, [hasFiltered, status, deliveries, filters, formatDate]);

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Filter"}
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Reset
              </button>
            </div>

            {validationError && (
              <div className="sm:col-span-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium">{validationError}</p>
              </div>
            )}
          </form>

          {/* Summary Section */}
          {summary && (
            <div className="px-6 pb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(summaryLabels).map(([label, value]) => (
                    <div key={label}>
                      <label className="block text-xs text-gray-600 mb-1">{label}</label>
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="w-full px-3 py-2 text-center text-lg font-bold bg-white border border-gray-200 rounded-md cursor-default focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State Messages */}
          {emptyStateMessage && (
            <div className={`mx-6 mb-6 p-4 rounded-md border ${
              emptyStateMessage.type === 'info' 
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <p className="text-center">{emptyStateMessage.message}</p>
            </div>
          )}

          {/* Error Display */}
          {error && status === "failed" && (
            <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-center text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Table */}
        {deliveries?.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th 
                        key={header} 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deliveries.map((delivery, index) => (
                    <tr 
                      key={delivery.id || index} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(delivery.journey_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {delivery.route_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {delivery.start_seq}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {delivery.end_seq}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 text-center font-medium">
                        {delivery.packages}
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600 text-center font-medium">
                        {delivery.no_scanned}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 text-center font-medium">
                        {delivery.failed_attempt}
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-600 text-center font-medium">
                        {delivery.double_stop}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-center font-medium">
                        {delivery.delivered}
                      </td>
                      <td className="px-4 py-3 text-sm text-indigo-600 font-semibold whitespace-nowrap">
                        ${parseFloat(delivery.earning || 0).toFixed(2)}
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
      <ToastContainer limit={3} />
    </div>
  );
};

export default Deliveries;