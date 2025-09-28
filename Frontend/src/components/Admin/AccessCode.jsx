"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAccessCodeRoutes,
  fetchAccessCodes,
  createAccessCode,
  updateAccessCode,
  clearError,
} from "../../redux/slice/admin/accessCodeSlice"
import Header from "../../reuse/Header"
import Nav from "../../reuse/Nav"
import Swal from "sweetalert2"

export default function AddAccessCodePage() {
  const dispatch = useDispatch()
  const {
    routes = [],
    accessCodes = [],
    status = "idle",
    error: reduxError,
  } = useSelector((state) => state.accessCodes || {})
  const [address, setAddress] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedRoute, setSelectedRoute] = useState("")

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAccessCodeRoutes())
      dispatch(fetchAccessCodes())
    }
  }, [dispatch, status])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0].id.toString())
    }
  }, [routes, selectedRoute])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")

    if (!selectedRoute || !address.trim() || !accessCode.trim()) {
      setSuccess("All fields are required.")
      return
    }

    if (!/^[a-zA-Z0-9]+$/.test(accessCode)) {
      setSuccess("Access code must be alphanumeric (letters and numbers only).")
      return
    }

    const routeId = Number.parseInt(selectedRoute)
    if (isNaN(routeId) || !routes.some((route) => route.id === routeId)) {
      setSuccess("Please select a valid route.")
      return
    }

    try {
      await dispatch(
        createAccessCode({ route_id: routeId, address: address.trim(), access_code: accessCode.trim() }),
      ).unwrap()
      setSuccess("Access code saved successfully!")
      setAddress("")
      setAccessCode("")
      setSelectedRoute(routes.length > 0 ? routes[0].id.toString() : "")
    } catch (err) {
      setSuccess(err.message || "Failed to save access code")
    }
  }

  const handleEdit = (ac) => {
    Swal.fire({
      title:
        '<div style="color: #1f2937; font-size: 24px; font-weight: 600; margin-bottom: 8px;">Edit Access Code</div>',
      html: `
        <div style="text-align: left; padding: 0 8px;">
          <div style="margin-bottom: 20px;">
            <label for="swal-route" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Route</label>
            <select id="swal-route" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; background: white; transition: all 0.2s ease;">
              ${routes.map((r) => `<option value="${r.id}" ${r.id === ac.route_id ? "selected" : ""}>Route ${r.name}</option>`).join("")}
            </select>
          </div>
          <div style="margin-bottom: 20px;">
            <label for="swal-address" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Address</label>
            <input id="swal-address" value="${ac.address}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; transition: all 0.2s ease;" placeholder="Enter address">
          </div>
          <div style="margin-bottom: 8px;">
            <label for="swal-accesscode" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Access Code</label>
            <input id="swal-accesscode" value="${ac.access_code}" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; transition: all 0.2s ease;" placeholder="Enter access code">
          </div>
        </div>
        <style>
          #swal-route:focus, #swal-address:focus, #swal-accesscode:focus {
            outline: none !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          }
        </style>
      `,
      focusConfirm: false,
      width: "500px",
      padding: "32px",
      background: "#ffffff",
      backdrop: "rgba(0, 0, 0, 0.4)",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 mr-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const routeId = document.getElementById("swal-route").value
        const address = document.getElementById("swal-address").value.trim()
        const accessCode = document.getElementById("swal-accesscode").value.trim()
        if (!routeId || !address || !accessCode) {
          Swal.showValidationMessage('<div style="color: #dc2626; font-size: 14px;">All fields are required</div>')
          return
        }
        if (!/^[a-zA-Z0-9]+$/.test(accessCode)) {
          Swal.showValidationMessage(
            '<div style="color: #dc2626; font-size: 14px;">Access code must be alphanumeric</div>',
          )
          return
        }
        return { id: ac.id, route_id: Number.parseInt(routeId), address, access_code: accessCode }
      },
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(updateAccessCode(result.value)).unwrap()
          setSuccess("Access code updated successfully!")
        } catch (err) {
          setSuccess(err.message || "Failed to update access code")
        }
      }
    })
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <Header />

      {/* Enhanced Notifications */}
      <div className="flex justify-center mt-8 px-4">
        {success && (
          <div
            className={`${
              success.includes("successfully")
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            } border-l-4 ${
              success.includes("successfully") ? "border-l-emerald-500" : "border-l-red-500"
            } px-6 py-4 rounded-r-lg shadow-lg max-w-md`}
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 ${success.includes("successfully") ? "text-emerald-500" : "text-red-500"}`}
              >
                {success.includes("successfully") ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}
        {reduxError && status === "failed" && (
          <div className="bg-red-50 border-l-4 border-l-red-500 border-red-200 text-red-800 px-6 py-4 rounded-r-lg shadow-lg max-w-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-red-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{reduxError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 py-12">
        {/* Add New Access Code Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Add New Access Code
              </h1>
              <p className="text-gray-600 mt-1">Create secure access codes for specific routes and addresses</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Route Dropdown */}
            <div className="space-y-2">
              <label htmlFor="route" className="block text-sm font-semibold text-gray-800 mb-3">
                Select Route
              </label>
              <div className="relative">
                <select
                  id="route"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 appearance-none text-base font-medium shadow-sm hover:border-gray-300"
                  required
                  disabled={status === "loading"}
                >
                  <option value="">Choose a route...</option>
                  {status === "succeeded" && Array.isArray(routes) && routes.length > 0 ? (
                    routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        Route {route.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {status === "succeeded" && (!Array.isArray(routes) || routes.length === 0)
                        ? "No routes available"
                        : "Choose a route..."}
                    </option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {status === "loading" && (
                <div className="flex items-center mt-3 p-3 bg-blue-50 rounded-lg">
                  <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="31.416"
                      strokeDashoffset="31.416"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 31.416;15.708 15.708;0 31.416"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-15.708;-31.416"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <p className="text-sm text-blue-700 font-medium">Loading available routes...</p>
                </div>
              )}
              {status === "failed" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Error loading routes: {reduxError || "Unknown error"}
                  </p>
                </div>
              )}
            </div>

            {/* Address Input */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-3">
                Address
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  placeholder="Enter the complete address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base font-medium shadow-sm hover:border-gray-300 placeholder-gray-400"
                  required
                  disabled={status === "loading"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Access Code Input */}
            <div className="space-y-2">
              <label htmlFor="accessCode" className="block text-sm font-semibold text-gray-800 mb-3">
                Access Code
              </label>
              <div className="relative">
                <input
                  id="accessCode"
                  type="text"
                  placeholder="Enter alphanumeric access code..."
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base font-medium shadow-sm hover:border-gray-300 placeholder-gray-400"
                  disabled={status === "loading"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Only letters and numbers are allowed</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold text-base ${
                  status === "loading" || !routes || routes.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
                disabled={status === "loading" || !routes || routes.length === 0}
              >
                {status === "loading" ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-25"
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        className="opacity-75"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Access Code
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Access Codes Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl mr-4">
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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Saved Access Codes
                </h2>
                <p className="text-gray-600 mt-1">Manage and edit existing access codes</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {accessCodes.length === 0 ? (
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No access codes yet</h3>
                <p className="text-gray-600">Create your first access code using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tl-lg">
                        Route
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Access Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tr-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {accessCodes.map((ac, index) => (
                      <tr
                        key={ac.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Route {ac.route_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-sm text-gray-900">{ac.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                            {ac.access_code}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm text-gray-600">{new Date(ac.created_at).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(ac)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Nav />
    </div>
  )
}
