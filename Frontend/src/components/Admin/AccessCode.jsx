"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAccessCodeRoutes,
  fetchAccessCodes,
  createAccessCode,
  updateAccessCode,
  clearError,
  setPage,
  setPageLimit,
  setSearchTerm,
  setRouteFilter,
} from "../../redux/slice/admin/accessCodeSlice";
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function AddAccessCodePage() {
  const dispatch = useDispatch();
  const {
    routes = [],
    accessCodes = [],
    status = "idle",
    error: reduxError,
    currentPage,
    pageLimit,
    totalPages,
    totalItems,
    searchTerm,
    routeFilter,
  } = useSelector((state) => state.accessCodes || {});

  const [address, setAddress] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localSearch, setLocalSearch] = useState("");
  const [localRouteFilter, setLocalRouteFilter] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAccessCodeRoutes());
      dispatch(fetchAccessCodes({ page: currentPage, limit: pageLimit, search: searchTerm, routeFilter }));
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0].id.toString());
    }
  }, [routes, selectedRoute]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "selectedRoute":
        if (!value) {
          error = "Please select a route";
        }
        break;
      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;
      case "accessCode":
        if (!value.trim()) {
          error = "Access code is required";
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          error = "Only letters and numbers allowed";
        } else if (value.length < 4) {
          error = "Access code must be at least 4 characters";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const value = field === "selectedRoute" ? selectedRoute : field === "address" ? address : accessCode;
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
  };

  const handleFieldChange = (field, value) => {
    if (field === "selectedRoute") {
      setSelectedRoute(value);
    } else if (field === "address") {
      setAddress(value);
    } else if (field === "accessCode") {
      setAccessCode(value);
    }

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      selectedRoute: validateField("selectedRoute", selectedRoute),
      address: validateField("address", address),
      accessCode: validateField("accessCode", accessCode),
    };

    setErrors(newErrors);
    setTouched({ selectedRoute: true, address: true, accessCode: true });

    if (Object.values(newErrors).some((error) => error !== "")) {
      toast.error("Please fix all validation errors", { position: "top-right" });
      return;
    }

    const routeId = Number.parseInt(selectedRoute);

    try {
      await dispatch(
        createAccessCode({ route_id: routeId, address: address.trim(), access_code: accessCode.trim() }),
      ).unwrap();

      toast.success("Access code created successfully!", { position: "top-right", autoClose: 3000 });

      setAddress("");
      setAccessCode("");
      setSelectedRoute(routes.length > 0 ? routes[0].id.toString() : "");
      setErrors({});
      setTouched({});
    } catch (err) {
      toast.error(err || "Failed to create access code", { position: "top-right", autoClose: 4000 });
    }
  };

  const handleEdit = (ac) => {
    Swal.fire({
      title: '<div style="color: #1f2937; font-size: 24px; font-weight: 600;">Edit Access Code</div>',
      html: `
        <div style="text-align: left; padding: 0 8px;">
          <div style="margin-bottom: 20px;">
            <label for="swal-route" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Route</label>
            <select id="swal-route" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; background: white;">
              ${routes.map((r) => `<option value="${r.id}" ${r.id === ac.route_id ? "selected" : ""}>Route ${r.name}</option>`).join("")}
            </select>
          </div>
          <div style="margin-bottom: 20px;">
            <label for="swal-address" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Address</label>
            <input id="swal-address" value="${ac.address}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937;" placeholder="Enter address">
          </div>
          <div style="margin-bottom: 8px;">
            <label for="swal-accesscode" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Access Code</label>
            <input id="swal-accesscode" value="${ac.access_code}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937;" placeholder="Enter access code">
          </div>
        </div>
      `,
      focusConfirm: false,
      width: "500px",
      padding: "32px",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        confirmButton: "text-white font-medium py-3 px-6 rounded-lg mr-3",
        cancelButton: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg",
      },
      buttonsStyling: false,
      didOpen: () => {
        const confirmButton = document.querySelector(".swal2-confirm");
        if (confirmButton) {
          confirmButton.style.backgroundColor = "#8200db";
          confirmButton.style.borderColor = "#8200db";
          confirmButton.addEventListener("mouseenter", () => {
            confirmButton.style.backgroundColor = "#7300c4";
          });
          confirmButton.addEventListener("mouseleave", () => {
            confirmButton.style.backgroundColor = "#8200db";
          });
        }
      },
      preConfirm: () => {
        const routeId = document.getElementById("swal-route").value;
        const address = document.getElementById("swal-address").value.trim();
        const accessCode = document.getElementById("swal-accesscode").value.trim();

        if (!routeId || !address || !accessCode) {
          Swal.showValidationMessage("All fields are required");
          return;
        }
        if (address.length < 5) {
          Swal.showValidationMessage("Address must be at least 5 characters");
          return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(accessCode)) {
          Swal.showValidationMessage("Access code must be alphanumeric");
          return;
        }
        if (accessCode.length < 4) {
          Swal.showValidationMessage("Access code must be at least 4 characters");
          return;
        }

        return { id: ac.id, route_id: Number.parseInt(routeId), address, access_code: accessCode };
      },
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(updateAccessCode(result.value)).unwrap();
          toast.success("Access code updated successfully!", { position: "top-right", autoClose: 3000 });
        } catch (err) {
          toast.error(err || "Failed to update access code", { position: "top-right", autoClose: 4000 });
        }
      }
    });
  };

  const handleSearch = () => {
    dispatch(setSearchTerm(localSearch));
    dispatch(setPage(1));
    dispatch(fetchAccessCodes({ page: 1, limit: pageLimit, search: localSearch, routeFilter: localRouteFilter }));
  };

  const handleFilterChange = (filter) => {
    setLocalRouteFilter(filter);
    dispatch(setRouteFilter(filter));
    dispatch(setPage(1));
    dispatch(fetchAccessCodes({ page: 1, limit: pageLimit, search: localSearch, routeFilter: filter }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchAccessCodes({ page: newPage, limit: pageLimit, search: searchTerm, routeFilter }));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setPageLimit(newLimit));
    dispatch(fetchAccessCodes({ page: 1, limit: newLimit, search: searchTerm, routeFilter }));
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <Header />

      <main className="max-w-7xl mx-auto p-3 sm:p-6 py-6 sm:py-12 pb-32">
        {/* Add New Access Code Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-[#8200db] to-[#9d00ff] p-3 rounded-xl mb-4 sm:mb-0 sm:mr-4 w-fit">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Add New Access Code
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Create secure access codes for specific routes and addresses
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Route Dropdown */}
            <div className="space-y-2">
              <label htmlFor="route" className="block text-sm font-semibold text-gray-800 mb-2">
                Select Route <span className="text-red-500">*</span>
              </label>
              <select
                id="route"
                value={selectedRoute}
                onChange={(e) => handleFieldChange("selectedRoute", e.target.value)}
                onBlur={() => handleBlur("selectedRoute")}
                className={`w-full px-4 py-3 border-2 ${
                  touched.selectedRoute && errors.selectedRoute ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-[#8200db] bg-white text-gray-900 transition-all`}
                disabled={status === "loading"}
              >
                <option value="">Choose a route...</option>
                {routes
                .filter((route) => !route.enabled) 
                .map((route) => (
                  <option key={route.id} value={route.id}>
                    Route {route.name}
                  </option>
                ))}
              </select>
              {touched.selectedRoute && errors.selectedRoute && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.selectedRoute}
                </p>
              )}
            </div>

            {/* Address Input */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter the complete address..."
                value={address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                onBlur={() => handleBlur("address")}
                className={`w-full px-4 py-3 border-2 ${
                  touched.address && errors.address ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-[#8200db] text-gray-900 transition-all`}
                disabled={status === "loading"}
              />
              {touched.address && errors.address && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.address}
                </p>
              )}
            </div>

            {/* Access Code Input */}
            <div className="space-y-2">
              <label htmlFor="accessCode" className="block text-sm font-semibold text-gray-800 mb-2">
                Access Code <span className="text-red-500">*</span>
              </label>
              <input
                id="accessCode"
                type="text"
                placeholder="Enter alphanumeric access code..."
                value={accessCode}
                onChange={(e) => handleFieldChange("accessCode", e.target.value)}
                onBlur={() => handleBlur("accessCode")}
                className={`w-full px-4 py-3 border-2 ${
                  touched.accessCode && errors.accessCode ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-[#8200db] text-gray-900 transition-all`}
                disabled={status === "loading"}
              />
              {touched.accessCode && errors.accessCode && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.accessCode}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Only letters and numbers, minimum 4 characters</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className={`px-6 sm:px-8 py-3 bg-gradient-to-r from-[#8200db] to-[#9d00ff] text-white rounded-xl shadow-lg hover:from-[#7300c4] hover:to-[#8a00e6] focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all font-semibold ${
                  status === "loading"
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Saving..." : "Save Access Code"}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Access Codes Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl overflow-hidden mb-20">
          <div className="px-4 sm:px-8 py-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl mb-4 sm:mb-0 sm:mr-4 w-fit">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Saved Access Codes
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Total: {totalItems} codes</p>
                </div>
              </div>

              {/* Items per page */}
              <div className="flex items-center justify-center lg:justify-end space-x-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Show:</label>
                <select
                  value={pageLimit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by address or code..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#8200db] p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="w-full md:w-48">
                <select
                  value={localRouteFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">All Routes</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      Route {route.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-4 lg:p-8">
            {status === "loading" ? (
              <div className="text-center py-16">
                <svg className="animate-spin h-12 w-12 text-[#8200db] mx-auto mb-4" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="opacity-25"
                  ></circle>
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  ></path>
                </svg>
                <p className="text-gray-600">Loading access codes...</p>
              </div>
            ) : accessCodes.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No access codes found</h3>
                <p className="text-gray-600">
                  {searchTerm || routeFilter
                    ? "Try adjusting your filters"
                    : "Create your first access code using the form above"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Access Code
                          </th>
                          <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                            Created At
                          </th>
                          <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {accessCodes.map((ac, index) => (
                          <tr
                            key={ac.id}
                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                          >
                            <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap">
                              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                Route {ac.route_name}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
                              <div className="text-xs sm:text-sm text-gray-900 break-words max-w-xs lg:max-w-none">
                                {ac.address}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                {ac.access_code}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap hidden lg:table-cell">
                              <span className="text-sm text-gray-600">
                                {new Date(ac.created_at).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-5 whitespace-nowrap">
                              <button
                                onClick={() => handleEdit(ac)}
                                className="inline-flex items-center justify-center px-2 sm:px-3 py-2 bg-[#8200db] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#7300c4] transition-all"
                              >
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`
                            group relative inline-flex items-center px-5 py-2.5 text-sm font-semibold 
                            rounded-lg border transition-all duration-200 ease-out transform
                            ${currentPage === 1
                              ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md hover:scale-[1.02]"
                            }
                          `}
                        >
                          <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Previous</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {[...Array(totalPages)].map((_, index) => {
                            const pg = index + 1;
                            return (
                              <button
                                key={pg}
                                onClick={() => handlePageChange(pg)}
                                className={`
                                  group relative inline-flex items-center justify-center w-10 h-10 text-sm font-semibold 
                                  rounded-lg border transition-all duration-200 ease-out transform
                                  ${pg === currentPage
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25 scale-105"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md hover:scale-[1.02]"
                                  }
                                `}
                              >
                                <span className="relative">{pg}</span>
                                {pg === currentPage && (
                                  <div className="absolute inset-0 bg-white opacity-10 rounded-lg animate-pulse"></div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`
                            group relative inline-flex items-center px-5 py-2.5 text-sm font-semibold 
                            rounded-lg border transition-all duration-200 ease-out transform
                            ${currentPage === totalPages
                              ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md hover:scale-[1.02]"
                            }
                          `}
                        >
                          <span>Next</span>
                          <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Nav />
    </div>
  );
}