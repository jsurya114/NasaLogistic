import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Header from "../../reuse/driver/Header";
import Nav from "../../reuse/driver/Nav";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchRoutes,
  clearRoutesError,
  fetchTodayJourney,
  saveJourney,
  clearJourneyError,
} from "../../redux/slice/driver/journeySlice.js";

const Journey = () => {
  const { driver } = useSelector((state) => state.driver);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isJourneySaved, setIsJourneySaved] = useState(false);

  // ✅ Use refs to track if data has been fetched
  const routesFetchedRef = useRef(false);
  const journeyFetchedRef = useRef(false);
  const prevDriverIdRef = useRef(null);

  const { routes, routesStatus, routesError, journeys, journeyStatus, journeyError } = useSelector(
    (state) => state.journey
  );

  // ✅ Memoize current date calculation (only once)
  const currentDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

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
          setIsJourneySaved(data.length > 0);
        })
        .catch(() => {
          setIsJourneySaved(false);
        });
    }
  }, [dispatch, driver?.id]);

  // ✅ Consolidated error handling with single effect
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

  // ✅ Optimized handleChange with useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      // Avoid re-render if value hasn't changed
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });

    // Clear error for this field
    setErrors((prevErrors) => {
      const errorField = fieldMap[name] || name;
      if (!prevErrors[errorField]) return prevErrors; // Avoid re-render if no error
      const { [errorField]: _, ...rest } = prevErrors;
      return rest;
    });
  }, [fieldMap]);

  // ✅ Calculate packages in frontend for display only
  const calculatePackages = useCallback((journey) => {
    if (journey.end_seq && journey.start_seq) {
      return journey.end_seq - journey.start_seq + 1;
    }
    return journey.packages || 0;
  }, []);

  // ✅ Optimized handleSubmit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (isJourneySaved) return;
    
    setErrors({});

    const journeyData = {
      driver_id: driver?.id,
      driver_name: driver?.name || "",
      journey_date: formData.journey_date,
      route_id: formData.route,
      start_seq: formData.start_sequence,
      end_seq: formData.end_sequence,
      // Backend will calculate packages
    };

    try {
      await dispatch(saveJourney(journeyData)).unwrap();
      
      // Fetch updated journey data
      await dispatch(fetchTodayJourney(driver.id)).unwrap();
      
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
        if (err.errors['sequenceConflict']) {
          toast.error(err.errors['sequenceConflict']);
        }
      } else {
        console.error(err.message || "Failed to save journey");
      }
    }
  }, [formData, driver, dispatch, isJourneySaved]);

  // ✅ Memoize filtered routes
  const enabledRoutes = useMemo(
    () => routes.filter((route) => route.enabled),
    [routes]
  );

  // ✅ Memoize loading states
  const isLoadingRoutes = routesStatus === 'loading';
  const isLoadingJourney = journeyStatus === 'loading';

  // ✅ Memoize table rows to prevent re-renders
  const journeyRows = useMemo(() => {
    if (journeyStatus !== "succeeded" || !Array.isArray(journeys)) {
      return null;
    }

    return journeys.map((row) => (
      <tr key={row.id || row.journey_date} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {driver?.name}
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
  }, [journeys, journeyStatus, driver?.name, calculatePackages]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins">
      <Header />

      <main className="max-w-5xl mx-auto mt-6 mb-24 px-6 pb-36">
        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">
              Start Your Journey
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="journey_date"
                value={formData.journey_date}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Sequence
              </label>
              <input
                type="number"
                name="start_sequence"
                value={formData.start_sequence}
                onChange={handleChange}
                disabled={isJourneySaved}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.start_seq && (
                <p className="text-red-500 text-sm mt-1">{errors.start_seq}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Sequence
              </label>
              <input
                type="number"
                name="end_sequence"
                value={formData.end_sequence}
                onChange={handleChange}
                disabled={isJourneySaved}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.end_seq && (
                <p className="text-red-500 text-sm mt-1">{errors.end_seq}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                name="route"
                value={formData.route}
                onChange={handleChange}
                disabled={isJourneySaved || isLoadingRoutes}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                <p className="text-red-500 text-sm mt-1">{errors.route_id}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isJourneySaved || isLoadingJourney}
              className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isJourneySaved || isLoadingJourney
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoadingJourney 
                ? "Saving..." 
                : isJourneySaved 
                ? "Route Already Saved" 
                : "Save Route"}
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Records</h2>
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
            {journeyStatus === 'loading' && (
              <div className="text-center py-8 text-gray-500">
                Loading journeys...
              </div>
            )}
            {journeyStatus === 'succeeded' && journeys.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No journeys found for today
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