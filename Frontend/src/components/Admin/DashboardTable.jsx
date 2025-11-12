import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentDashboard, clearPaymentDashboard } from "../../redux/slice/admin/paymentDashboardSlice";

export default function PaymentDashboardTable() {
  const dispatch = useDispatch();
  
  // Get data from paymentDashboard slice (unfiltered - initial load)
  const { data: unfilteredData, loading: unfilteredLoading, error: unfilteredError } = useSelector(
    (state) => state.paymentDashboard
  );
  
  // Get filtered data from dash slice
  const { filteredPaymentData, paymentLoading, paymentError, isFiltered } = useSelector(
    (state) => state.dash
  );

  // Fetch initial unfiltered data on mount
  useEffect(() => {
    dispatch(fetchPaymentDashboard());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(clearPaymentDashboard());
    dispatch(fetchPaymentDashboard());
  };

  // Determine which data to show
  // If user has filtered (isFiltered = true), show filtered results (even if empty)
  // Otherwise show unfiltered data
  const displayData = isFiltered ? filteredPaymentData : unfilteredData;
  const isLoading = paymentLoading || unfilteredLoading;
  const displayError = paymentError || unfilteredError;

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3">
        <span>Driver Jobs</span>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          🔄 Refresh
        </button>
      </div>

      {isLoading && <p className="p-4">Loading...</p>}
      {displayError && <p className="p-4 text-red-600">Error: {displayError}</p>}

      {!isLoading && !displayError && displayData.length === 0 && (
        <p className="p-4 text-gray-500">
          {isFiltered 
            ? "No data found for the selected filters. Try adjusting your filter criteria."
            : "No data available."}
        </p>
      )}

      {!isLoading && !displayError && displayData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {[
                  "Driver",
                  "Job Date",
                  "Route",
                  "Sequence",
                  "Packages",
                  "No Scanned",
                  "Failed Attempt",
                  "FS",
                  "DS",
                  "Delivered",
                  "Closed",
                  "Driver Payment",
                  "Paid",
                 
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
              {displayData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b border-gray-200">
                    {row.driver_name}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-200">
                    {new Date(row.journey_date).toLocaleDateString()}
                  </td>
                 <td className="px-3 py-2 border-b border-gray-200">{row.route_name || row.route_id}</td>
                  <td className="px-3 py-2 border-b border-gray-200">
                    {row.start_seq}-{row.end_seq}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-200">{row.packages}</td>
                  <td className="px-3 py-2 border-b border-gray-200">{row.no_scanned}</td>
                  <td className="px-3 py-2 border-b border-gray-200">
                    {row.failed_attempt}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-200">{row.fs}</td>
                  <td className="px-3 py-2 border-b border-gray-200">{row.ds}</td>
                  <td className="px-3 py-2 border-b border-gray-200">{row.delivered}</td>
                  <td
                    className={`px-3 py-2 border-b border-gray-200 ${
                      row.closed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                    }`}
                  >
                    {row.closed ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-200 relative group">
                    {row.driver_payment ? (
                      <span className="cursor-pointer">
                        {row.driver_payment}
                        {/* Tooltip */}
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50
                                       w-max max-w-xs rounded-md bg-gray-800 text-white text-xs px-2 py-1
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <p>Full amount displayed here</p>
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    className={`px-3 py-2 border-b border-gray-200 ${
                      row.paid ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                    }`}
                  >
                    {row.paid ? "Yes" : "No"}
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}