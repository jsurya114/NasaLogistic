import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../reuse/Header";
import Nav from "../reuse/Nav";
import { fetchJobs, addJob, deleteJob, jobStatus } from "../redux/slice/jobSlice";

function Jobs() {
  const dispatch = useDispatch();
  const cities = useSelector((state) => state.jobs.cities);

  const [form, setForm] = useState({ job: "", city_code: "", enabled: true });

  // Fetch jobs on component mount
  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // Handle adding a new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const actionResult = await dispatch(
        addJob({ job: form.job, city_code: form.city_code, enabled: form.enabled })
      );
      if (addJob.fulfilled.match(actionResult)) {
        // Optionally, you can show a success message here
        console.log("Job added:", actionResult.payload);
      }
      // Reset form
      setForm({ job: "", city_code: "", enabled: true });
    } catch (err) {
      console.error("Failed to add job:", err);
    }
  };

  // Handle deleting a job
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteJob(id));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  // Handle toggling job status
  const handleToggleStatus = async (id) => {
    try {
      await dispatch(jobStatus(id));
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">

        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            Add Job
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <div>
              <label className="block mb-1 font-medium">Job</label>
              <input
                type="text"
                name="job"
                value={form.job}
                onChange={handleChange}
                placeholder="Enter job"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">City Code</label>
              <input
                type="text"
                name="city_code"
                value={form.city_code}
                onChange={handleChange}
                placeholder="Enter city code"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="enabled"
                checked={form.enabled}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600"
              />
              <label className="font-medium">Enabled</label>
            </div>

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
            Job List
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["ID", "Job", "City Code", "Status", "Actions"].map((head, i) => (
                  <th key={i} className="px-3 py-2 border-b border-gray-200 font-semibold text-gray-800">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities.length > 0 ? (
                cities.map((city, index) => (
                  <tr key={city.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-3 py-2 border-b border-gray-200">{city.id}</td>
                    <td className="px-3 py-2 border-b border-gray-200">{city.job}</td>
                    <td className="px-3 py-2 border-b border-gray-200">{city.city_code}</td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${city.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {city.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 space-x-2">
                      <button
                        onClick={() => handleToggleStatus(city.id)}
                        className="px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(city.id)}
                        className="px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 font-medium">
                    No jobs added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

      </main>
      <Nav />
    </div>
  );
}

export default Jobs;
