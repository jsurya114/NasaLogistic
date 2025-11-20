import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../reuse/Header";
import Nav from "../../reuse/Nav";
import SearchBar from "../../reuse/Search.jsx";
import Pagination from "../../reuse/Pagination.jsx";
import {
  addJob,
  jobStatus,
  fetchPaginatedJobs,
  updateJob
} from "../../redux/slice/admin/jobSlice";

// --- Constants
const DEBOUNCE_MS = 400;
const ITEMS_PER_PAGE = 3;
const FILTER = {
  ALL: 'all',
  ENABLED: 'enabled',
  DISABLED: 'disabled'
};

// --- Icons
const IconRefresh = ({ spinning }) => (
  <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconClear = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Row Component (Delete Removed)
const CityRow = React.memo(function CityRow({ id, job, city_code, enabled, index, onToggle, onEdit }) {
  return (
    <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
      <td className="px-3 py-2 border-b border-gray-200">{id}</td>
      <td className="px-3 py-2 border-b border-gray-200">{job}</td>
      <td className="px-3 py-2 border-b border-gray-200">{city_code}</td>
      <td className="px-3 py-2 border-b border-gray-200">
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </td>
      <td className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-4">

          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={() => onToggle(id)} className="sr-only" />
            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </div>
          </label>

          <button onClick={() => onEdit({ id, job, city_code, enabled })} className="group relative px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5">
         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
          </button>

        </div>
      </td>
    </tr>
  );
});
CityRow.displayName = 'CityRow';

// --- Loading & Empty Screens
const Loading = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    <p className="text-gray-600 font-medium">Loading...</p>
  </div>
);

const Empty = ({ hasFilters }) => (
  <div className="flex flex-col items-center gap-2 py-8">
    {hasFilters ? (
      <>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="font-medium text-gray-500">No cities found</p>
        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
      </>
    ) : (
      <p className="font-medium text-gray-500">No Cities added yet</p>
    )}
  </div>
);

// --- Main Component
export default function Jobs() {
  const dispatch = useDispatch();
  const { cities = [], page = 1, totalPages = 1, status = 'idle' } = useSelector(s => s.jobs || {});

  // Form
  const [form, setForm] = useState({ job: '', city_code: '', enabled: true });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // UI
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(FILTER.ALL);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs
  const mountedRef = useRef(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const dropdownRef = useRef(null);

  const isEditing = editingId !== null;
  const loading = status === 'loading' || isRefreshing;

  // Reset form
  const resetForm = useCallback(() => {
    setForm({ job: '', city_code: '', enabled: true });
    setErrors({});
    setEditingId(null);
  }, []);

  // Validation
  const validate = useCallback(() => {
    const e = {};
    if (!form.job.trim()) e.job = 'Job name is required';
    if (!form.city_code.trim()) e.city_code = 'City code is required';
    return e;
  }, [form]);

  // Fetch Jobs
  const fetchJobs = useCallback(async ({ pageNum = 1, q = '', statusFilter = FILTER.ALL } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await dispatch(fetchPaginatedJobs({
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        search: q,
        status: statusFilter,
        signal: controller.signal
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to fetch cities');
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!mountedRef.current) {
      fetchJobs({ pageNum: 1, q: '', statusFilter: filter });
      mountedRef.current = true;
    }
    return () => abortRef.current && abortRef.current.abort();
  }, [fetchJobs, filter]);

  // Debounced search/filter
  useEffect(() => {
    if (!mountedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchJobs({ pageNum: 1, q: search, statusFilter: filter });
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [search, filter, fetchJobs]);

  // Page change
  useEffect(() => {
    if (!mountedRef.current) return;
    fetchJobs({ pageNum: currentPage, q: search, statusFilter: filter });
  }, [currentPage, fetchJobs]);

  // Outside dropdown
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handlers
  const onChangeField = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const onEdit = useCallback(payload => {
    setForm({ job: payload.job, city_code: payload.city_code, enabled: payload.enabled });
    setEditingId(payload.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onCancelEdit = useCallback(() => resetForm(), [resetForm]);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    const eObj = validate();
    if (Object.keys(eObj).length) return setErrors(eObj);

    try {
      if (isEditing) {
        const res = await dispatch(updateJob({
          id: editingId,
          job: form.job,
          city_code: form.city_code,
          enabled: form.enabled
        }));
        if (updateJob.fulfilled.match(res)) {
          toast.success("City updated");
          resetForm();
          fetchJobs({ pageNum: currentPage, q: search, statusFilter: filter });
        }
      } else {
        const res = await dispatch(addJob({
          job: form.job,
          city_code: form.city_code,
          enabled: form.enabled
        }));
        if (addJob.fulfilled.match(res)) {
          toast.success("City added");
          resetForm();
          setCurrentPage(1);
          fetchJobs({ pageNum: 1, q: search, statusFilter: filter });
        }
      }
    } catch {
      toast.error("Failed to save city");
    }
  }, [validate, isEditing, editingId, form, dispatch, resetForm, fetchJobs, currentPage, search, filter]);

  const onToggleStatus = useCallback(async (id) => {
    try {
      const res = await dispatch(jobStatus(id));
      if (jobStatus.fulfilled.match(res)) {
        toast.success("Status updated");
      }
    } catch {
      toast.error("Failed to update status");
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchJobs({ pageNum: currentPage, q: search, statusFilter: filter });
    setIsRefreshing(false);
  }, [fetchJobs, currentPage, search, filter]);

  const headers = useMemo(() => ['ID', 'City', 'City Code', 'Status', 'Actions'], []);

  const hasItems = Array.isArray(cities) && cities.length > 0;
  const hasActiveFilters = search !== '' || filter !== FILTER.ALL;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins">
      <Header />
      <main className="max-w-[1450px] mx-auto p-4 pb-40">

        {/* Form */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 p-6">
          <h2 className="font-bold text-gray-900 bg-gray-50 border-b border-gray-200 px-4 py-3 -mx-6 -mt-6 rounded-t-xl">
            {isEditing ? 'Edit City' : 'Add City'}
          </h2>

          <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
            <div>
              <label className="block mb-1 font-medium">City</label>
              <input
                name="job"
                value={form.job}
                onChange={onChangeField}
                placeholder="Enter City"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${errors.job ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.job && <p className="text-red-500 text-sm mt-1">{errors.job}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">City Code</label>
              <input
                name="city_code"
                value={form.city_code}
                onChange={onChangeField}
                placeholder="Enter city code"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${errors.city_code ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.city_code && <p className="text-red-500 text-sm mt-1">{errors.city_code}</p>}
            </div>

            {!isEditing && (
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="enabled" checked={form.enabled} onChange={onChangeField} className="w-4 h-4 text-purple-600" />
                <label className="font-medium">Enabled</label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {isEditing && (
                <button type="button" onClick={onCancelEdit} className="px-6 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
              )}
              <button type="submit" className="px-6 py-2 bg-purple-700 text-white rounded-lg">
                {isEditing ? 'Update City' : 'Add City'}
              </button>
            </div>
          </form>
        </section>

        {/* Table */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-xl">
            <h2 className="font-bold text-gray-900">City List</h2>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <IconRefresh spinning={isRefreshing} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex-1">
              <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search city..." />
            </div>

            {/* Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(s => !s)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${filter !== FILTER.ALL ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <span className="font-medium">
                  {filter === FILTER.ENABLED ? 'Enabled' :
                    filter === FILTER.DISABLED ? 'Disabled' : 'All Status'}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button onClick={() => { setFilter(FILTER.ALL); setShowDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">All Status</button>
                  <button onClick={() => { setFilter(FILTER.ENABLED); setShowDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Enabled</button>
                  <button onClick={() => { setFilter(FILTER.DISABLED); setShowDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Disabled</button>
                </div>
              )}
            </div>

            {(search !== '' || filter !== FILTER.ALL) && (
              <button
                onClick={() => { setSearch(''); setFilter(FILTER.ALL); }}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <IconClear />
                <span className="font-medium">Clear</span>
              </button>
            )}
          </div>

          <div className="relative min-h-[300px] px-6 py-4">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <Loading />
              </div>
            )}

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 border-b border-gray-200 font-semibold text-gray-800">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {!loading && hasItems ? (
                  cities.map((c, idx) => (
                    <CityRow
                      key={c.id}
                      id={c.id}
                      job={c.job}
                      city_code={c.city_code}
                      enabled={c.enabled}
                      index={idx}
                      onToggle={onToggleStatus}
                      onEdit={onEdit}
                    />
                  ))
                ) : !loading ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <Empty hasFilters={hasActiveFilters} />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <Pagination page={page} totalPages={totalPages} onPageChange={page => setCurrentPage(page)} />

      </main>
      <Nav />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
