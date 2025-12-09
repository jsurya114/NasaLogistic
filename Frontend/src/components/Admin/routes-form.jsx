import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const citiesFetchedRef = useRef(false);

  const isEditing = editingId !== null;
  const loading = routesStatus === "loading";

  // Fetch ALL cities (not paginated) only once on mount
  useEffect(() => {
    dispatch(fetchAllCities());
  }, [dispatch]);

  // ✅ Fetch routes with debouncing and abort controller
  const fetchRoutesData = useCallback(async (params = {}) => {
    const { pageNum = currentPage, q = searchTerm } = params;
    
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await dispatch(fetchRoutes({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: q,
        signal: controller.signal,
      })).unwrap();
    } catch (err) {
      if (err !== 'Request cancelled') {
        toast.error('Failed to fetch routes');
      }
    }
  }, [dispatch, currentPage, searchTerm]);

  // ✅ Single effect for fetching with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchRoutesData();
    }, searchTerm ? DEBOUNCE_MS : 0);

    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [currentPage, searchTerm, fetchRoutesData]);

  // Memoized enabled jobs - allCities already contains only enabled cities
  const enabledJobs = useMemo(() => {
    if (Array.isArray(allCities) && allCities.length > 0) {
      return allCities; // allCities already returns only enabled cities from backend
    }
    return [];
  }, [allCities]);

  // ✅ Memoized validation
  const validateForm = useCallback(() => {
    if (!formData.route.trim()) return "Route name is required.";
    if (!formData.job.trim()) return "Please select a Job.";
    if (!formData.enabled && !isEditing) return "Route can only be saved if Enabled is checked.";
    return null;
  }, [formData.route, formData.job, formData.enabled, isEditing]);

  // ✅ Memoized input change handler
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field.includes("Price") ? parseFloat(value) || 0 : value,
    }));
    setSubmitError(null);
  }, []);

  // ✅ Memoized edit handler
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

  // ✅ Memoized cancel edit handler
  const handleCancelEdit = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
    setSubmitError(null);
  }, []);

  // ✅ OPTIMIZED: Removed redundant refetch
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateRoute({ id: editingId, routeData: formData })).unwrap();
        toast.success('Route updated successfully!');
      } else {
        await dispatch(addRoute(formData)).unwrap();
        toast.success('Route added successfully!');
        setCurrentPage(1); // ✅ This triggers refetch via useEffect
      }
      
      setFormData(INITIAL_FORM_STATE);
      setEditingId(null);
      setSubmitError(null);
      
      // ✅ No manual refetch needed - Redux state updates handle it
    } catch (error) {
      const errorMsg = error || `Failed to ${isEditing ? 'update' : 'add'} route`;
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  }, [formData, isEditing, editingId, dispatch, validateForm]);

  // ✅ Memoized toggle handler with optimistic update
  const handleToggle = useCallback(async (id) => {
    try {
      await dispatch(toggleRouteStatus(id)).unwrap();
      toast.success('Route status updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update route status');
    }
  }, [dispatch]);

  // ✅ Memoized delete handler
  const handleDelete = useCallback(async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this route?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteRoute(id)).unwrap();
      toast.success('Route deleted successfully!');
    } catch (error) {
      toast.error(error || 'Failed to delete route');
    }
  }, [dispatch]);

  // ✅ Memoized page change handler
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // ✅ Memoized price fields configuration
  const priceFields = useMemo(() => [
    { label: "Company Route Price", field: "companyRoutePrice" },
    { label: "Driver Route Price", field: "driverRoutePrice" },
    { label: "Company Double Stop Price", field: "companyDoubleStopPrice" },
    { label: "Driver Double Stop Price", field: "driverDoubleStopPrice" },
  ], []);

  // ✅ Memoized table headers
  const tableHeaders = useMemo(() => 
    ["Route", "Job", "Company Price", "Driver Price", "Status", "Actions"],
  []);

  // ✅ Memoized loading state
  const isJobsLoading = allCitiesStatus === "loading";
  const hasRoutes = Array.isArray(routes) && routes.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl flex-1">
              {isEditing ? 'Edit Route' : 'Add Route'}
            </h2>
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                disabled={isJobsLoading}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 bg-white disabled:opacity-50"
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
                  <svg className="animate-spin h-5 w-5 mr-2 text-purple-600" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-purple-600 text-sm">Loading jobs...</p>
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
              <label className="font-medium">Enabled {!isEditing && "(required to save)"}</label>
            </div>

            {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={loading || (!formData.enabled && !isEditing)}
                className={`px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors ${
                  (loading || (!formData.enabled && !isEditing)) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  isEditing ? 'Update Route' : 'Add Route'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Table Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            Route List
          </h2>
          
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search routes..."
            />
          </div>
          
          <div className="relative min-h-[300px] px-6 py-4">
            {loading && !hasRoutes && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-gray-600 font-medium">Loading routes...</p>
                </div>
              </div>
            )}

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
                {!loading && routesStatus === "failed" ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-red-500 font-medium">
                      Error: {routesError || "Failed to load routes"}
                    </td>
                  </tr>
                ) : !loading && !hasRoutes ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">
                      {searchTerm ? "No routes found matching your search" : "No routes added yet"}
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
                      <td className="px-3 py-2 border-b border-gray-200">${route.companyRoutePrice}</td>
                      <td className="px-3 py-2 border-b border-gray-200">${route.driverRoutePrice}</td>
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
                        <div className="flex items-center gap-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={route.enabled}
                              onChange={() => handleToggle(route.id)}
                              className="sr-only"
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                              route.enabled ? 'bg-purple-600' : 'bg-gray-300'
                            }`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${
                                route.enabled ? 'translate-x-5' : 'translate-x-0.5'
                              } mt-0.5`}></div>
                            </div>
                          </label>
                          
                          <button
                            onClick={() => handleEdit(route)}
                            className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
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
          </div>
        </section>
        
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>

      <Nav />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
}
  