import React from 'react'

const DoubleStop = () => {
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
                required
              />
            </div>

            {/* Job Dropdown */}
            <div>
              <label className="block mb-1 font-medium">Job</label>
              <select
                value={formData.job}
                onChange={(e) => handleInputChange("job", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 bg-white"
                required
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
                  required
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
              <label className="font-medium">Enabled (Required to save)</label>
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
         
        </section>
      </main>
      <Nav />
    </div>
  )
}

export default DoubleStop