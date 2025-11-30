import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Header from "../../reuse/driver/Header";
import Nav from "../../reuse/driver/Nav";
import {
  fetchRoutes,
  clearRoutesError,
  fetchTodayJourney,
  saveJourney,
  clearJourneyError,
  selectAllRoutes,
} from "../../redux/slice/driver/journeySlice.js";

// ✅ Utility: Calculate current date once
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

const Journey = () => {
  const dispatch = useDispatch();
  const { driver } = useSelector((state) => state.driver);

  // ✅ Use entity adapter selector
  const allRoutes = useSelector(selectAllRoutes);
  
  const { 
    routesStatus, 
    routesError, 
    journeys, 
    journeyStatus, 
    journeyError 
  } = useSelector((state) => state.journey);

  const [errors, setErrors] = useState({});
  const [isJourneySaved, setIsJourneySaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const routesFetchedRef = useRef(false);
  const journeyFetchedRef = useRef(false);
  const prevDriverIdRef = useRef(null);

  // ✅ Memoize current date (only once)
  const currentDate = useMemo(() => getCurrentDate(), []);

  const [formData, setFormData] = useState({
    journey_date: currentDate,
    start_sequence: "",
    end_sequence: "",
    route: "",
  });

  // ✅ Fetch routes only once
  useEffect(() => {
    if (!routesFetchedRef.current && routesStatus === 'idle') {
      dispatch(fetchRoutes());
      routesFetchedRef.current = true;
    }
  }, [dispatch, routesStatus]);

  // ✅ Fetch journey only when driver changes or on mount
  useEffect(() => {
    if (!driver?.id) return;

    const driverChanged = prevDriverIdRef.current !== driver.id;
    const shouldFetch = driverChanged || !journeyFetchedRef.current;

    if (shouldFetch) {
      prevDriverIdRef.current = driver.id;
      journeyFetchedRef.current = true;

      dispatch(fetchTodayJourney(driver.id))
        .unwrap()
        .then((data) => {
          setIsJourneySaved(Array.isArray(data) && data.length > 0);
        })
        .catch(() => {
          setIsJourneySaved(false);
        });
    }
  }, [dispatch, driver?.id]);

  // ✅ Consolidated error handling
  useEffect(() => {
    if (routesError) {
      toast.error(routesError);
      dispatch(clearRoutesError());
    }
    if (journeyError) {
      toast.error(journeyError);
      dispatch(clearJourneyError());
    }
  }, [routesError, journeyError, dispatch]);

  // ✅ Memoize error field mapping
  const fieldMap = useMemo(() => ({
    start_sequence: "start_seq",
    end_sequence: "end_seq",
    route: "route_id",
  }), []);

  // ✅ Optimized handleChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    setErrors((prevErrors) => {
      const errorField = fieldMap[name] || name;
      if (!prevErrors[errorField]) return prevErrors;
      
      const { [errorField]: _, ...rest } = prevErrors;
      return rest;
    });
  }, [fieldMap]);

  // ✅ Memoized calculate packages
  const calculatePackages = useCallback((journey) => {
    if (journey.end_seq && journey.start_seq) {
      return journey.end_seq - journey.start_seq + 1;
    }
    return journey.packages || 0;
  }, []);

  // ✅ Optimized handleSubmit - removed redundant refetch
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (isJourneySaved || isSubmitting) return;
    
    setErrors({});
    setIsSubmitting(true);

    const journeyData = {
      driver_id: driver?.id,
      driver_name: driver?.name || "",
      journey_date: formData.journey_date,
      route_id: formData.route,
      start_seq: formData.start_sequence,
      end_seq: formData.end_sequence,
    };

    try {
      // ✅ saveJourney already updates Redux state via entity adapter
      await dispatch(saveJourney(journeyData)).unwrap();
      
      setIsJourneySaved(true);
      
      toast.success("Journey saved successfully!", {
        position: "bottom-center",
        autoClose: 3000,
      });

      // Reset form fields
      setFormData((prev) => ({
        ...prev,
        start_sequence: "",
        end_sequence: "",
        route: "",
      }));
    } catch (err) {
      setIsJourneySaved(false);
      
      if (err.errors) {
        setErrors(err.errors);
        if (err.errors.sequenceConflict) {
          toast.error(err.errors.sequenceConflict);
        }
      } else {
        toast.error(err.message || "Failed to save journey");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, driver, dispatch, isJourneySaved, isSubmitting]);

  // ✅ Memoize enabled routes using selector
  const enabledRoutes = useMemo(
    () => allRoutes.filter((route) => route.enabled),
    [allRoutes]
  );

  // ✅ Memoize loading states
  const isLoadingRoutes = routesStatus === 'loading';
  const isLoadingJourney = journeyStatus === 'loading';

  // ✅ Memoize journeys array from entity adapter
  const journeyList = useMemo(() => {
    return Array.isArray(journeys.ids) 
      ? journeys.ids.map(id => journeys.entities[id]) 
      : [];
  }, [journeys]);

  // ✅ Memoize table rows
  const journeyRows = useMemo(() => {
    if (journeyStatus !== "succeeded" || journeyList.length === 0) {
      return null;
    }

    return journeyList.map((row) => (
      <tr key={row.id || `${row.journey_date}-${row.route_id}`} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {driver?.name || row.driver_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {row.journey_date}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {row.route_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
          {row.start_seq}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
          {row.end_seq}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
          {calculatePackages(row)}
        </td>
      </tr>
    ));
  }, [journeyList, journeyStatus, driver?.name, calculatePackages]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins">
      <Header />

      <main className="max-w-5xl mx-auto mt-6 mb-24 px-6 pb-36">
        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h1 className="text-lg font-semibold text-gray-900">
              Start Your Journey
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="journey_date"
                value={formData.journey_date}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Start Sequence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Sequence <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="start_sequence"
                value={formData.start_sequence}
                onChange={handleChange}
                disabled={isJourneySaved || isSubmitting}
                min="1"
                placeholder="Enter start sequence"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.start_seq 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.start_seq && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.start_seq}
                </p>
              )}
            </div>

            {/* End Sequence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Sequence <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="end_sequence"
                value={formData.end_sequence}
                onChange={handleChange}
                disabled={isJourneySaved || isSubmitting}
                min="1"
                placeholder="Enter end sequence"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.end_seq 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
              {errors.end_seq && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.end_seq}
                </p>
              )}
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                name="route"
                value={formData.route}
                onChange={handleChange}
                disabled={isJourneySaved || isSubmitting || isLoadingRoutes}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  errors.route_id 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {isLoadingRoutes ? "Loading routes..." : "Select Route"}
                </option>
                {enabledRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.route}
                  </option>
                ))}
              </select>
              {errors.route_id && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.route_id}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isJourneySaved || isSubmitting}
              className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 ${
                isJourneySaved || isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Saving...</span>
                </>
              ) : isJourneySaved ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Journey Already Saved</span>
                </>
              ) : (
                "Save Journey"
              )}
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Journey Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Seq
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Seq
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packages
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {journeyRows}
              </tbody>
            </table>

            {/* Loading State */}
            {isLoadingJourney && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-gray-600 font-medium">Loading journeys...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {journeyStatus === 'succeeded' && journeyList.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-500 font-medium">No journeys found for today</p>
                <p className="text-sm text-gray-400">Start by creating your first journey</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Nav />
    </div>
  );
};

export default Journey;