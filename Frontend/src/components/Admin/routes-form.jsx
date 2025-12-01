import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";
import { fetchRoutes, addRoute, toggleRouteStatus, deleteRoute, updateRoute } from "../../redux/slice/admin/routeSlice";
import { fetchAllCities } from "../../redux/slice/admin/jobSlice"; // Import the new action
import Pagination from "../../reuse/Pagination.jsx";
import SearchBar from "../../reuse/Search.jsx";

export default function RoutesForm() {
  const dispatch = useDispatch();
  const { routes, status: routesStatus, error: routesError, page, totalPages, limit } = useSelector((state) => state.routes);
  const { allCities, allCitiesStatus, error: jobsError } = useSelector((state) => state.jobs); // Use allCities

  const [formData, setFormData] = useState({
    route: "",
    job: "",
    companyRoutePrice: 0,
    driverRoutePrice: 0,
    companyDoubleStopPrice: 0,
    driverDoubleStopPrice: 0,
    routeCodeInString: "",
    enabled: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch ALL cities (not paginated) only once on mount
  useEffect(() => {
    dispatch(fetchAllCities());
  }, [dispatch]);

  // Debounced search with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchRoutes({ page: 1, limit: 4, search: searchTerm }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Memoized enabled jobs - allCities already contains only enabled cities
  const enabledJobs = useMemo(() => {
    if (Array.isArray(allCities) && allCities.length > 0) {
      return allCities; // allCities already returns only enabled cities from backend
    }
    return [];
  }, [allCities]);

  // Memoized page change handler
  const handlePageChange = useCallback((newPage) => {
    dispatch(fetchRoutes({ page: newPage, limit: 4, search: searchTerm }));
  }, [dispatch, searchTerm]);

  // Memoized input change handler
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field.includes("Price") ? parseFloat(value) || 0 : value,
    }));
    setSubmitError(null);
  }, []);

  // Memoized edit handler
  const handleEdit = useCallback((route) => {
    setFormData({
      route: route.route,
      job: route.job,
      companyRoutePrice: route.companyRoutePrice,
      driverRoutePrice: route.driverRoutePrice,
      companyDoubleStopPrice: route.companyDoubleStopPrice,
      driverDoubleStopPrice: route.driverDoubleStopPrice,
      routeCodeInString: route.routeCodeInString || "",
      enabled: route.enabled,
    });
    setEditingId(route.id);
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Memoized cancel edit handler
  const handleCancelEdit = useCallback(() => {
    setFormData({
      route: "",
      job: "",
      companyRoutePrice: 0,
      driverRoutePrice: 0,
      companyDoubleStopPrice: 0,
      driverDoubleStopPrice: 0,
      routeCodeInString: "",
      enabled: false,
    });
    setEditingId(null);
    setSubmitError(null);
  }, []);

  // Memoized submit handler
  const handleSubmit = useCallback(async (e) => {
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

    try {
      if (editingId) {
        await dispatch(updateRoute({ id: editingId, routeData: formData })).unwrap();
        toast.success('Route updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        setEditingId(null);
      } else {
        await dispatch(addRoute(formData)).unwrap();
        toast.success('Route added successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setFormData({
        route: "",
        job: "",
        companyRoutePrice: 0,
        driverRoutePrice: 0,
        companyDoubleStopPrice: 0,
        driverDoubleStopPrice: 0,
        routeCodeInString: "",
        enabled: false,
      });
      setSubmitError(null);
      
      dispatch(fetchRoutes({ page: page || 1, limit: 4, search: searchTerm }));
    } catch (error) {
      setSubmitError(error.message || `Failed to ${editingId ? 'update' : 'add'} route`);
      toast.error(error.message || `Failed to ${editingId ? 'update' : 'add'} route. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [formData, editingId, dispatch, page, searchTerm]);

  // Memoized toggle handler
  const handleToggle = useCallback(async (id) => {
    try {
      await dispatch(toggleRouteStatus(id)).unwrap();
      toast.success('Route status updated successfully!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error('Failed to update route status. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [dispatch]);

  // Memoized delete handler
  const handleDelete = useCallback(async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this route?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteRoute(id)).unwrap();
      toast.success('Route deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Failed to delete route. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [dispatch]);

  // Memoized price fields configuration
  const priceFields = useMemo(() => [
    { label: "Company Route Price", field: "companyRoutePrice" },
    { label: "Driver Route Price", field: "driverRoutePrice" },
    { label: "Company Double Stop Price", field: "companyDoubleStopPrice" },
    { label: "Driver Double Stop Price", field: "driverDoubleStopPrice" },
  ], []);

  // Memoized table headers
  const tableHeaders = useMemo(() => 
    ["Route", "Job", "Company Price", "Driver Price", "Status", "Actions"],
  []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl flex-1">
              {editingId ? 'Edit Route' : 'Add Route'}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
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

            <div>
              <label className="block mb-1 font-medium">Route Code (String)</label>
              <input
                type="text"
                placeholder="Enter route code string (optional)"
                value={formData.routeCodeInString}
                onChange={(e) => handleInputChange("routeCodeInString", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Job</label>
              <select
                value={formData.job}
                onChange={(e) => handleInputChange("job", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 bg-white"
              >
                <option value="">Select Job</option>
                {enabledJobs.length > 0 ? (
                  enabledJobs.map((job) => (
                    <option key={job.id} value={job.job}>
                      {job.job}
                    </option>
                  ))
                ) : (
                  <option disabled>No jobs available</option>
                )}
              </select>
              {allCitiesStatus === "loading" && (
                <div className="flex items-center mt-1">
                  <svg className="animate-spin h-6 w-6 mr-2 text-purple-600" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-purple-600 font-medium">Loading jobs...</p>
                </div>
              )}
              {allCitiesStatus === "failed" && (
                <p className="text-red-500 mt-1">Error loading jobs: {jobsError || "Unknown error"}</p>
              )}
            </div>

            {priceFields.map(({ label, field }) => (
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleInputChange("enabled", e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <label className="font-medium">Enabled (to save)</label>
            </div>

            {submitError && <p className="text-red-500">{submitError}</p>}
            {submitSuccess && <p className="text-green-500">{submitSuccess}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className={`px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800 ${
                  !formData.enabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!formData.enabled}
              >
                {editingId ? 'Update Route' : 'Add Route'}
              </button>
            </div>
          </form>
        </section>

        {/* Table Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            Route List
          </h2>
          
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search routes..."
          />
          
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {tableHeaders.map((head, i) => (
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
                    No routes found
                  </td>
                </tr>
              ) : (
                routes.map((route, index) => (
                  <tr 
                    key={route.id} 
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} ${
                      editingId === route.id ? "ring-2 ring-purple-500" : ""
                    }`}
                  >
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
                      <div className="flex items-center gap-10">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={route.enabled}
                            onChange={() => handleToggle(route.id)}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                            route.enabled ? 'bg-purple-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${
                              route.enabled ? 'translate-x-5' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </label>
                        
                        <button
                          onClick={() => handleEdit(route)}
                          className="group relative px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                          title="Edit Route"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
        
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>

      <Nav />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
}
  