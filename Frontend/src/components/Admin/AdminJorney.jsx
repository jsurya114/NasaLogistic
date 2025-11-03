import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllJourneys,
  updateJourney,
  addJourney,
  fetchAdminRoutes,
  fetchAllDrivers,
  clearJourneyError,
} from "../../redux/slice/driver/journeySlice.js";
import { toast } from "react-toastify";
import Header from "../../reuse/Header.jsx";
import Nav from "../../reuse/Nav.jsx";
import Select from "react-select";


const AdminJourney = () => {
  const dispatch = useDispatch();
  const { adminJourneys, adminStatus, adminError, routes, routesStatus, drivers, driversStatus } = useSelector(
    (state) => state.journey
  );

  const [editableJourneyId, setEditableJourneyId] = useState(null);
  const [formData, setFormData] = useState({});
  const [editValidationErrors, setEditValidationErrors] = useState({});
  const [newJourneyData, setNewJourneyData] = useState({
    driver_id: "",
    route_id: "",
    start_seq: "",
    end_seq: "",
    journey_date: new Date().toISOString().split('T')[0],
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [errorTimeout, setErrorTimeout] = useState(null);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
  };

  // ✅ Fetch data only once on mount with proper checks
  useEffect(() => {
    // Only fetch if not already loaded or loading
    if (adminStatus === "idle" || (adminStatus === "failed" && adminJourneys.length === 0)) {
      dispatch(fetchAllJourneys());
    }
    if (routesStatus === "idle" || (routesStatus === "failed" && routes.length === 0)) {
      dispatch(fetchAdminRoutes());
    }
    if (driversStatus === "idle" || (driversStatus === "failed" && drivers.length === 0)) {
      dispatch(fetchAllDrivers());
    }
  }, [dispatch, adminStatus, routesStatus, driversStatus, adminJourneys.length, routes.length, drivers.length]);

  // ✅ Auto-clear validation errors after 5 seconds
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      // Clear any existing timeout
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
      
      // Set new timeout to clear errors after 5 seconds
      const timeout = setTimeout(() => {
        setValidationErrors({});
      }, 5000);
      
      setErrorTimeout(timeout);
      
      // Cleanup function
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [validationErrors]);

  // ✅ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [errorTimeout]);

  // ✅ Handle errors without causing re-renders
  useEffect(() => {
    if (adminError) {
      toast.error(adminError);
      dispatch(clearJourneyError());
    }
  }, [adminError, dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchAllJourneys());
  }, [dispatch]);

  const handleEdit = useCallback((journey) => {
    setEditableJourneyId(journey.id);
    setFormData({
      driver_id: journey.driver_id,
      start_seq: journey.start_seq,
      end_seq: journey.end_seq,
      route_id: journey.route_id,
    });
    setEditValidationErrors({});
  }, []);

  const handleCancel = useCallback(() => {
    setEditableJourneyId(null);
    setFormData({});
    setEditValidationErrors({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Prevent negative numbers and zero for sequence fields
    if ((name === 'start_seq' || name === 'end_seq') && value !== '') {
      const numValue = parseInt(value);
      if (numValue < 1) {
        return; // Don't update if less than 1
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when user starts typing
    if (editValidationErrors[name]) {
      setEditValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Also clear general error when user makes changes
    if (editValidationErrors.general) {
      setEditValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  }, [editValidationErrors]);

  // ✅ Memoize validation function to prevent recreating on every render
  const validateSequenceOverlap = useCallback((driver_id, routeId, startSeq, endSeq, excludeJourneyId = null) => {
    const start = parseInt(startSeq);
    const end = parseInt(endSeq);

    const overlapping = adminJourneys.find(journey => {
      if (excludeJourneyId && journey.id === excludeJourneyId) return false;
      if (journey.driver_id !== parseInt(driver_id) || journey.route_id !== parseInt(routeId)) return false;

      const existingStart = parseInt(journey.start_seq);
      const existingEnd = parseInt(journey.end_seq);
      
      return (start <= existingEnd && end >= existingStart);
    });
    
    return overlapping;
  }, [adminJourneys]);

  const handleSave = useCallback(
    async (id) => {
      // Reset validation errors
      setEditValidationErrors({});
      
      // Validate fields
      const errors = {};
      
      if (!formData.start_seq || formData.start_seq === '') {
        errors.start_seq = "Start sequence is required";
      }
      if (!formData.end_seq || formData.end_seq === '') {
        errors.end_seq = "End sequence is required";
      }
      
      const start = parseInt(formData.start_seq);
      const end = parseInt(formData.end_seq);
      
      if (formData.start_seq && start < 1) {
        errors.start_seq = "Must be greater than zero";
      }
      if (formData.end_seq && end < 1) {
        errors.end_seq = "Must be greater than zero";
      }
      
      if (formData.start_seq && formData.end_seq && start >= end) {
        errors.end_seq = "Must be greater than start";
      }
      
      // If there are validation errors, show them and return
      if (Object.keys(errors).length > 0) {
        setEditValidationErrors(errors);
        return;
      }
      
      const overlapping = validateSequenceOverlap(
        formData.driver_id,
        formData.route_id,
        formData.start_seq,
        formData.end_seq,
        id
      );
      
      if (overlapping) {
        setEditValidationErrors({
          general: `Overlap! Driver has sequences ${overlapping.start_seq}-${overlapping.end_seq} on this route`
        });
        return;
      }

      try {
        await dispatch(updateJourney({ journey_id: id, updatedData: formData })).unwrap();
        toast.success("Journey updated successfully!");
        setEditableJourneyId(null);
        setEditValidationErrors({});
      } catch (err) {
        // Handle backend validation errors
        if (err.errors) {
          const backendErrors = {};
          if (err.errors.sequence) {
            backendErrors.general = err.errors.sequence;
          }
          if (err.errors.start_seq) {
            backendErrors.start_seq = err.errors.start_seq;
          }
          if (err.errors.end_seq) {
            backendErrors.end_seq = err.errors.end_seq;
          }
          setEditValidationErrors(backendErrors);
        } else {
          setEditValidationErrors({ general: err.message || "Failed to update journey" });
        }
      }
    },
    [dispatch, formData, validateSequenceOverlap]
  );

  const handleNewJourneyChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewJourneyData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Also clear general error when user makes changes
    if (validationErrors.general) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleAddJourney = useCallback(
    async () => {
      // Clear any existing timeout
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        setErrorTimeout(null);
      }
      
      // Reset validation errors
      setValidationErrors({});
      
      // Validate all fields
      const errors = {};
      
      if (!newJourneyData.driver_id) {
        errors.driver_id = "Driver is required";
      }
      if (!newJourneyData.route_id) {
        errors.route_id = "Route is required";
      }
      if (!newJourneyData.start_seq) {
        errors.start_seq = "Start sequence is required";
      }
      if (!newJourneyData.end_seq) {
        errors.end_seq = "End sequence is required";
      }
      if (!newJourneyData.journey_date) {
        errors.journey_date = "Journey date is required";
      }
      
      // If there are validation errors, show them and return
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const start = parseInt(newJourneyData.start_seq);
      const end = parseInt(newJourneyData.end_seq);

      if (start <= 0) {
        setValidationErrors({ start_seq: "Start sequence must be greater than zero" });
        return;
      }
      if (end <= 0) {
        setValidationErrors({ end_seq: "End sequence must be greater than zero" });
        return;
      }

      if (start >= end) {
        setValidationErrors({ end_seq: "End sequence must be greater than start sequence" });
        return;
      }
      
      const overlapping = validateSequenceOverlap(
        newJourneyData.driver_id,
        newJourneyData.route_id,
        newJourneyData.start_seq,
        newJourneyData.end_seq
      );
      
      if (overlapping) {
        setValidationErrors({ 
          general: `Sequence overlap detected! This driver already has sequences ${overlapping.start_seq}-${overlapping.end_seq} on this route.`
        });
        return;
      }

      try {
        await dispatch(addJourney(newJourneyData)).unwrap();
        toast.success("Journey added successfully!");
        setNewJourneyData({
          driver_id: "",
          route_id: "",
          start_seq: "",
          end_seq: "",
          journey_date: new Date().toISOString().split('T')[0],
        });
        setValidationErrors({});
        // Refresh the journey list after adding
        dispatch(fetchAllJourneys());
      } catch (err) {
        setValidationErrors({ general: err.message || "Failed to add journey" });
      }
    },
    [dispatch, newJourneyData, validateSequenceOverlap, errorTimeout]
  );

  // ✅ Memoize route lookup map for O(1) lookup instead of O(n) for each row
  const routeMap = useMemo(() => {
    const map = new Map();
    routes.forEach(route => {
      map.set(route.id, route.route || route.name || route.route_name || `Route ${route.id}`);
    });
    return map;
  }, [routes]);

  // ✅ Memoize table rows with proper dependencies
  const tableRows = useMemo(() => {
    if (adminStatus !== "succeeded") return null;

    return adminJourneys.map((journey) => {
      const displayRouteName = routeMap.get(journey.route_id) || journey.route_name || 'Unknown Route';
      const displayDate = formatDate(journey.journey_date);
      const isEditing = editableJourneyId === journey.id;
      
      return (
        <React.Fragment key={journey.id}>
          <tr className="border-t hover:bg-gray-50">
            <td className="px-4 py-2">{journey.driver_name}</td>
            <td className="px-4 py-2">{displayDate}</td>
            <td className="px-4 py-2">
              {isEditing ? (
                <select
                  name="route_id"
                  value={formData.route_id}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select Route</option>
                  {routes.map((routeItem) => (
                    <option key={routeItem.id} value={routeItem.id}>
                      {routeItem.route || routeItem.name || `Route ${routeItem.id}`}
                    </option>
                  ))}
                </select>
              ) : (
                displayRouteName
              )}
            </td>
            <td className="px-4 py-2 text-center">
              {isEditing ? (
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    name="start_seq"
                    value={formData.start_seq}
                    onChange={handleChange}
                    className={`w-20 border rounded px-2 py-1 ${
                      editValidationErrors.start_seq 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    min="1"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                  />
                  {editValidationErrors.start_seq && (
                    <span className="text-xs text-red-500 mt-1 whitespace-nowrap">
                      {editValidationErrors.start_seq}
                    </span>
                  )}
                </div>
              ) : (
                journey.start_seq
              )}
            </td>
            <td className="px-4 py-2 text-center">
              {isEditing ? (
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    name="end_seq"
                    value={formData.end_seq}
                    onChange={handleChange}
                    className={`w-20 border rounded px-2 py-1 ${
                      editValidationErrors.end_seq 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    min="1"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                  />
                  {editValidationErrors.end_seq && (
                    <span className="text-xs text-red-500 mt-1 whitespace-nowrap">
                      {editValidationErrors.end_seq}
                    </span>
                  )}
                </div>
              ) : (
                journey.end_seq
              )}
            </td>
            <td className="px-4 py-2 text-center">{journey.packages}</td>
            <td className="px-4 py-2 space-x-2 text-center">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleSave(journey.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEdit(journey)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              )}
            </td>
          </tr>
          {isEditing && editValidationErrors.general && (
            <tr>
              <td colSpan="7" className="px-4 py-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <span>{editValidationErrors.general}</span>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });
  }, [adminJourneys, adminStatus, editableJourneyId, formData, routes, routeMap, editValidationErrors, handleChange, handleEdit, handleCancel, handleSave]);

  // ✅ Memoize route options to prevent recreating on every render
  const routeOptions = useMemo(() => (
    routes.map((routeItem) => (
      <option key={routeItem.id} value={routeItem.id}>
        {routeItem.route || routeItem.name || `Route ${routeItem.id}`}
      </option>
    ))
  ), [routes]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
      <Header />

      <main className="max-w-[1450px] mx-auto p-4 pt-16 pb-40">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">All Driver Journeys</h1>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
            disabled={adminStatus === "loading"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Add Journey Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4 border-2 border-green-200">
          <h2 className="text-lg font-semibold mb-4 text-green-700">Add New Journey</h2>
          
          {/* General Error Message with fade animation */}
          {validationErrors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span>{validationErrors.general}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Driver *</label>
              <Select
                name="driver_id"
                options={drivers.map((driver) => ({
                  value: driver.id,
                  label: driver.name,
                }))}
                value={
                  drivers.find(driver => driver.id === newJourneyData.driver_id)
                    ? {
                        value: newJourneyData.driver_id,
                        label: drivers.find(driver => driver.id === newJourneyData.driver_id).name,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setNewJourneyData(prev => ({ ...prev, driver_id: selectedOption?.value || '' }))
                }
                placeholder="Search or select driver..."
                isClearable
                isSearchable
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: validationErrors.driver_id ? '#ef4444' : '#22c55e',
                    boxShadow: state.isFocused ? '0 0 0 1px #22c55e' : base.boxShadow,
                    minHeight: '38px',
                    borderRadius: '0.375rem',
                  }),
                  menu: base => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
              {validationErrors.driver_id && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.driver_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Route *</label>
              <Select
                name="route_id"
                options={routes.map((route) => ({
                  value: route.id,
                  label: route.route || route.name || `Route ${route.id}`,
                }))}
                value={
                  routes.find(route => route.id === newJourneyData.route_id)
                    ? {
                        value: newJourneyData.route_id,
                        label: routes.find(route => route.id === newJourneyData.route_id).route || routes.find(route => route.id === newJourneyData.route_id).name,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setNewJourneyData(prev => ({ ...prev, route_id: selectedOption?.value || '' }))
                }
                placeholder="Search or select route..."
                isClearable
                isSearchable
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: validationErrors.route_id ? '#ef4444' : '#22c55e',
                    boxShadow: state.isFocused ? '0 0 0 1px #22c55e' : base.boxShadow,
                    minHeight: '38px',
                    borderRadius: '0.375rem',
                  }),
                  menu: base => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
              {validationErrors.route_id && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.route_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Journey Date *</label>
              <input
                type="date"
                name="journey_date"
                value={newJourneyData.journey_date}
                onChange={handleNewJourneyChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  validationErrors.journey_date 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'focus:ring-green-500'
                }`}
              />
              {validationErrors.journey_date && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.journey_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Seq *</label>
              <input
                type="number"
                name="start_seq"
                value={newJourneyData.start_seq}
                onChange={handleNewJourneyChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  validationErrors.start_seq 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'focus:ring-green-500'
                }`}
                min="1"
                placeholder="e.g. 1"
              />
              {validationErrors.start_seq && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.start_seq}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Seq *</label>
              <input
                type="number"
                name="end_seq"
                value={newJourneyData.end_seq}
                onChange={handleNewJourneyChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                  validationErrors.end_seq 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'focus:ring-green-500'
                }`}
                min="1"
                placeholder="e.g. 10"
              />
              {validationErrors.end_seq && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.end_seq}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddJourney}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Journey
            </button>
          </div>
        </div>

        {/* Journey Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-center">Start Seq</th>
                <th className="px-4 py-3 text-center">End Seq</th>
                <th className="px-4 py-3 text-center">Packages</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminStatus === "loading" ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative w-12 h-12">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <span className="text-gray-600 font-medium">Loading journeys...</span>
                    </div>
                  </td>
                </tr>
              ) : adminJourneys.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No journeys found</td>
                </tr>
              ) : (
                tableRows
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Nav />
    </div>
  );
};

export default AdminJourney;