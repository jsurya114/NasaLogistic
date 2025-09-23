import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../reuse/Header";
import Nav from "../reuse/Nav";
import { fetchRoutes, addRoute, toggleRouteStatus, deleteRoute } from "../redux/slice/routeSlice";
import { fetchJobs } from "../redux/slice/jobSlice";

export default function RoutesForm() {
  const dispatch = useDispatch();
  const { routes, status: routesStatus, error: routesError } = useSelector((state) => state.routes);
  const { cities, status: jobsStatus, error: jobsError } = useSelector((state) => state.jobs);

  const [formData, setFormData] = useState({
    route: "",
    job: "",
    companyRoutePrice: 0,
    driverRoutePrice: 0,
    companyDoubleStopPrice: 0,
    driverDoubleStopPrice: 0,
    enabled: false,
  });
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    console.log("RoutesForm - Jobs state:", { cities, jobsStatus, jobsError }); // Debug log
    console.log("RoutesForm - Routes state:", { routes, routesStatus, routesError }); // Debug log
    dispatch(fetchRoutes());
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    console.log(`Updating form field ${field}:`, value); // Debug log
    setFormData((prev) => ({
      ...prev,
      [field]: field.includes("Price") ? parseFloat(value) || 0 : value,
    }));
    setSubmitError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
 if (!formData.route.trim()) {
    setSubmitError("Route name is required.");
    return;
  }
  if (!formData.job.trim()) {
    setSubmitError("Please select a Job.");
    return;
  }
  if (!formData.enabled) {
    setSubmitError("Route can only be saved if Enabled is checked.");
    return;
  }

    if (!formData.enabled) {
      setSubmitError("Route can only be saved if Enabled is checked.");
      console.log("Submit blocked: Enabled is false"); // Debug log
      return;
    }
    console.log("Submitting route with formData:", formData); // Debug log
    try {
      await dispatch(addRoute(formData)).unwrap();
      setFormData({
        route: "",
        job: "",
        companyRoutePrice: 0,
        driverRoutePrice: 0,
        companyDoubleStopPrice: 0,
        driverDoubleStopPrice: 0,
        enabled: false,
      });
      setSubmitError(null);
      setSubmitSuccess("Route added successfully!");
      setTimeout(() => setSubmitSuccess(null), 3000);
      console.log("Route submitted successfully"); // Debug log
    } catch (error) {
      console.error("Submit error:", error.message); // Debug log
      setSubmitError(error.message || "Failed to add route");
    }
  };

  const handleToggle = (id) => {
    console.log(`Toggling route id: ${id}`); // Debug log
    dispatch(toggleRouteStatus(id));
  };

  const handleDelete = async (id) => {
    console.log(`Deleting route id: ${id}`); // Debug log
    try {
      await dispatch(deleteRoute(id)).unwrap();
      setSubmitSuccess(`Route ${id} deleted successfully!`);
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (error) {
      console.error("Delete error:", error.message); // Debug log
      setSubmitError(error.message || "Failed to delete route");
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer'
        } ${
          checked 
            ? 'bg-purple-600' 
            : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            Add Route
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            {/* Route Name */}
            <div>
              <label className="block mb-1 font-medium">Route</label>
              <input
                type="text"
                placeholder="Enter route name"
                value={formData.route}
                onChange={(e) => handleInputChange("route", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                
              />
            </div>

            {/* Job Dropdown */}
            <div>
              <label className="block mb-1 font-medium">Job</label>
              <select
                value={formData.job}
                onChange={(e) => handleInputChange("job", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 bg-white"
                
              >
                <option value="">Select Job</option>
                {jobsStatus === "succeeded" && Array.isArray(cities) && cities.length > 0 ? (
                  cities.map((job) => (
                    <option key={job.id} value={job.job}>
                      {job.job}
                    </option>
                  ))
                ) : (
                  <option disabled>No jobs available</option>
                )}
              </select>
              {jobsStatus === "loading" && (
                <div className="flex items-center mt-1">
                  <svg className="animate-spin h-6 w-6 mr-2 text-purple-600" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-purple-600 font-medium">Loading jobs...</p>
                </div>
              )}
              {jobsStatus === "failed" && (
                <p className="text-red-500 mt-1">Error loading jobs: {jobsError || "Unknown error"}</p>
              )}
              {jobsStatus === "succeeded" && (!Array.isArray(cities) || cities.length === 0) && (
                <p className="text-yellow-500 mt-1">No jobs found</p>
              )}
            </div>

            {/* Prices */}
            {[
              { label: "Company Route Price", field: "companyRoutePrice" },
              { label: "Driver Route Price", field: "driverRoutePrice" },
              { label: "Company Double Stop Price", field: "companyDoubleStopPrice" },
              { label: "Driver Double Stop Price", field: "driverDoubleStopPrice" },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block mb-1 font-medium">{label}</label>
                <input
                  type="number"
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                  min="0"
                  step="0.01"
                  
                />
              </div>
            ))}

            {/* Enabled */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleInputChange("enabled", e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <label className="font-medium">Enabled ( to save)</label>
            </div>

            {/* Submit Feedback */}
            {submitError && (
              <div>
                <p className="text-red-500">{submitError}</p>
              </div>
            )}
            {submitSuccess && (
              <div>
                <p className="text-green-500">{submitSuccess}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800 ${
                  !formData.enabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!formData.enabled}
              >
                Add Route
              </button>
            </div>
          </form>
        </section>

        {/* Table Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            Route List
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Route", "Job", "Company Price", "Driver Price", "Status", "Actions"].map((head, i) => (
                  <th key={i} className="px-3 py-2 border-b border-gray-200 font-semibold text-gray-800">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
  {routesStatus === "loading" && routes.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-gray-500 font-medium">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 mr-2 text-purple-600" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading routes...
        </div>
      </td>
    </tr>
  ) : routesStatus === "failed" ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-red-500 font-medium">
        Error loading routes: {routesError || "Unknown error"}
      </td>
    </tr>
  ) : routesStatus === "succeeded" && (!Array.isArray(routes) || routes.length === 0) ? (
    <tr>
      <td colSpan="6" className="text-center py-4 text-gray-500 font-medium">
        No routes added yet
      </td>
    </tr>
  ) : (
    routes.map((route, index) => (
      <tr key={route.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
        <td className="px-3 py-2 border-b border-gray-200">{route.route}</td>
        <td className="px-3 py-2 border-b border-gray-200">{route.job}</td>
        <td className="px-3 py-2 border-b border-gray-200">{route.companyRoutePrice}</td>
        <td className="px-3 py-2 border-b border-gray-200">{route.driverRoutePrice}</td>
        <td className="px-3 py-2 border-b border-gray-200">
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              route.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {route.enabled ? "Enabled" : "Disabled"}
          </span>
        </td>
        <td className="px-3 py-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ToggleSwitch
              checked={route.enabled}
              onChange={() => handleToggle(route.id)}
            />
            <span className="text-sm text-gray-600">
              {route.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        </section>
      </main>
      <Nav />
    </div>
  );
}