import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../reuse/Header";
import Nav from "../reuse/Nav";
import { fetchJobs, addJob, deleteJob, jobStatus } from "../redux/slice/jobSlice";

function Jobs() {
  const dispatch = useDispatch();
  const cities = useSelector((state) => state.jobs.cities);

  const [form, setForm] = useState({ job: "", city_code: "", enabled: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" }); // clear error when typing
  };

  const validate = () => {
    let newErrors = {};
    if (!form.job.trim()) newErrors.job = "Job name is required";
    if (!form.city_code.trim()) newErrors.city_code = "City code is required";
    if (!form.enabled) newErrors.enabled = "City must be enabled to add";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const actionResult = await dispatch(
        addJob({ job: form.job, city_code: form.city_code, enabled: form.enabled })
      );
      if (addJob.fulfilled.match(actionResult)) {
        console.log("Job added:", actionResult.payload);
        setForm({ job: "", city_code: "", enabled: true });
        setErrors({});
      }
    } catch (err) {
      console.error("Failed to add job:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this job?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteJob(id));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

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
                onChange={handleChange}
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
      onChange={handleChange}
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
                    <td className="px-3 py-2 border-b border-gray-200">
                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={city.enabled}
                          onChange={() => handleToggleStatus(city.id)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          city.enabled ? 'bg-purple-600' : 'bg-gray-300'
                        }`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${
                            city.enabled ? 'translate-x-5' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </label>
                      {/* <button
                        onClick={() => handleDelete(city.id)}
                        className="px-2 py-1 bg-red-200 rounded hover:bg-red-300 ml-2"
                      >
                        Delete
                      </button> */}
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