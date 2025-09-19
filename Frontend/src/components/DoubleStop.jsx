import React from 'react'
import Header from '../reuse/Header'
import Nav from '../reuse/Nav'

const DoubleStop = () => {
  return (
      <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">
        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            Double Stop
          </h2>
          <form  className="flex flex-col gap-4 mt-6">
            <div>
              <label className="block mb-1 font-medium">Job</label>
              <input
                type="text"
                name="job"
                value={form.job}
                // onChange={}
                placeholder="Enter job"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                  errors.job ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.job && <p className="text-red-500 text-sm mt-1">{errors.job}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">City Code</label>
              <input
                type="text"
                name="city_code"
                value={form.city_code}
                // onChange={handleChange}
                placeholder="Enter city code"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                  errors.city_code ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city_code && <p className="text-red-500 text-sm mt-1">{errors.city_code}</p>}
            </div>

         <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      name="enabled"
      checked={form.enabled}
    //   onChange={handleChange}
      className="w-4 h-4 text-purple-600"
    />
    <label className="font-medium">Enabled</label>
  </div>
  {errors.enabled && <p className="text-red-500 text-sm mt-1">{errors.enabled}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
              >
                Add Job
              </button>
            </div>
          </form>
          
        </section>

        {/* Table Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            Uploaded Data
          </h2>
         
        </section>
      </main>
      <Nav />
    </div>
  )
}

export default DoubleStop