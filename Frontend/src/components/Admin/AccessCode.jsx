import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccessCodeRoutes, createAccessCode, clearError } from "../../redux/slice/admin/accessCodeSlice";
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";

export default function AddAccessCodePage() {
  const dispatch = useDispatch();
  const { routes = [], status = "idle", error: reduxError } = useSelector((state) => state.accessCodes || {});
  const [address, setAddress] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAccessCodeRoutes());
    }
  }, [dispatch, status]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0].id.toString());
    }
  }, [routes, selectedRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!selectedRoute || !address.trim() || !accessCode.trim()) {
      setSuccess("All fields are required.");
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(accessCode)) {
      setSuccess("Access code must be alphanumeric (letters and numbers only).");
      return;
    }

    const routeId = parseInt(selectedRoute);
    if (isNaN(routeId) || !routes.some(route => route.id === routeId)) {
      setSuccess("Please select a valid route.");
      return;
    }

    try {
      await dispatch(createAccessCode({ route_id: routeId, address: address.trim(), access_code: accessCode.trim() })).unwrap();
      setSuccess("Access code saved successfully!");
      setAddress("");
      setAccessCode("");
      setSelectedRoute(routes.length > 0 ? routes[0].id.toString() : "");
    } catch (err) {
      setSuccess(err.message || "Failed to save access code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
      <Header />

      {/* Notifications */}
      <div className="text-center mt-6">
        {success && (
          <p className={`${success.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"} px-4 py-2 rounded-lg inline-block shadow-md`}>
            {success}
          </p>
        )}
        {reduxError && status === "failed" && (
          <p className="bg-red-100 text-red-600 px-4 py-2 rounded-lg inline-block shadow-md">
            {reduxError}
          </p>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 py-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">
            Add New Access Code
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Dropdown */}
            <div>
              <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                id="route"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={status === "loading"}
              >
                <option value="">Select a Route</option>
                {status === "succeeded" && Array.isArray(routes) && routes.length > 0 ? (
                  routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      Route {route.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {status === "succeeded" && (!Array.isArray(routes) || routes.length === 0) ? "No routes available" : "Select a Route"}
                  </option>
                )}
              </select>
              {status === "loading" && (
                <div className="flex items-center mt-2">
                  <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-sm text-indigo-600 font-medium">Loading routes...</p>
                </div>
              )}
              {status === "failed" && (
                <p className="text-sm text-red-600 mt-2">Error loading routes: {reduxError || "Unknown error"}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={status === "loading"}
              />
            </div>

            {/* Access Code */}
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                id="accessCode"
                type="text"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status === "loading"}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 ${status === "loading" || !routes || routes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={status === "loading" || !routes || routes.length === 0}
              >
                {status === "loading" ? "Saving..." : "Save Access Code"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Nav />
    </div>
  );
}