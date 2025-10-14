import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";
import SearchBar from "../../reuse/Search.jsx";
import { addJob, jobStatus, fetchPaginatedJobs, updateJob } from "../../redux/slice/admin/jobSlice";
import Pagination from "../../reuse/Pagination.jsx";

function Jobs() {
  const dispatch = useDispatch();
  const { cities, page, totalPages } = useSelector((state) => state.jobs);

  const [form, setForm] = useState({ job: "", city_code: "", enabled: true });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use ref to track if initial fetch is done
  const initialFetchDone = useRef(false);
  const limit = 3;

  // Memoized fetch function to prevent recreation
  const fetchData = useCallback((pageNum, search) => {
    dispatch(fetchPaginatedJobs({ page: pageNum, limit, search }));
  }, [dispatch]);

  // Initial fetch on mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchData(1, "");
      initialFetchDone.current = true;
    }
  }, [fetchData]);

  // Debounced search - REMOVED dispatch from dependencies
  useEffect(() => {
    if (!initialFetchDone.current) return; // Skip on initial mount
    
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 on search
      fetchData(1, searchTerm);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchTerm, fetchData]); // dispatch removed!

  // Page change handler
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    fetchData(newPage, searchTerm);
  }, [fetchData, searchTerm]);
  
  // Form change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // Validation function
  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.job.trim()) newErrors.job = "Job name is required";
    if (!form.city_code.trim()) newErrors.city_code = "City code is required";
    if (!isEditing && !form.enabled) newErrors.enabled = "City must be enabled to add";
    return newErrors;
  }, [form.job, form.city_code, form.enabled, isEditing]);

  // Edit handler
  const handleEdit = useCallback((city) => {
    setForm({
      job: city.job,
      city_code: city.city_code,
      enabled: city.enabled
    });
    setEditingId(city.id);
    setIsEditing(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Cancel edit handler
  const handleCancelEdit = useCallback(() => {
    setForm({ job: "", city_code: "", enabled: true });
    setEditingId(null);
    setIsEditing(false);
    setErrors({});
  }, []);

  // Submit handler - with proper dependency management
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing) {
        const actionResult = await dispatch(
          updateJob({ 
            id: editingId, 
            job: form.job, 
            city_code: form.city_code 
          })
        );
        
        if (updateJob.fulfilled.match(actionResult)) {
          toast.success('Job updated successfully!', {
            position: "top-right",
            autoClose: 3000,
          });
          
          handleCancelEdit();
          // Refetch current page after update
          fetchData(currentPage, searchTerm);
        }
      } else {
        const actionResult = await dispatch(
          addJob({ job: form.job, city_code: form.city_code, enabled: form.enabled })
        );
        
        if (addJob.fulfilled.match(actionResult)) {
          toast.success('Job added successfully!', {
            position: "top-right",
            autoClose: 3000,
          });
          
          setForm({ job: "", city_code: "", enabled: true });
          setErrors({});
          // Refetch page 1 after adding new item
          setCurrentPage(1);
          fetchData(1, searchTerm);
        }
      }
    } catch (err) {
      console.error("Failed to save job:", err);
      
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} job. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [validate, isEditing, editingId, form, dispatch, currentPage, searchTerm, handleCancelEdit, fetchData]);

  // Toggle status handler with refetch
  const handleToggleStatus = useCallback(async (id) => {
    try {
      const actionResult = await dispatch(jobStatus(id));
      
      if (jobStatus.fulfilled.match(actionResult)) {
        toast.success('Job status updated successfully!', {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Refetch to ensure data consistency
        fetchData(currentPage, searchTerm);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      toast.error('Failed to update job status. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [dispatch, currentPage, searchTerm, fetchData]);

  // Memoized table headers
  const tableHeaders = useMemo(() => 
    ["ID", "City", "City Code", "Status", "Actions"],
  []);

  // Memoized check if cities exist
  const hasCities = useMemo(() => 
    cities && cities.length > 0,
  [cities]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">

        {/* Form Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            {isEditing ? "Edit City" : "Add City"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <div>
              <label className="block mb-1 font-medium">City</label>
              <input
                type="text"
                name="job"
                value={form.job}
                onChange={handleChange}
                placeholder="Enter City"
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

            {!isEditing && (
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
            )}
            {errors.enabled && <p className="text-red-500 text-sm mt-1">{errors.enabled}</p>}
            
            <div className="flex justify-end gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
              >
                {isEditing ? "Update City" : "Add City"}
              </button>
            </div>
          </form>
        </section>

        {/* Table Section */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            City List
          </h2>
          
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city..."
          />
          
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {tableHeaders.map((head, i) => (
                  <th key={i} className="px-3 py-2 border-b border-gray-200 font-semibold text-gray-800">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hasCities ? (
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
                      <div className="flex items-center gap-10">
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
                        
                        <button
                          onClick={() => handleEdit(city)}
                          className="group relative px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                          title="Edit City"
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
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 font-medium">
                    No Cities added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      </main>
      <Nav />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
}

export default Jobs;