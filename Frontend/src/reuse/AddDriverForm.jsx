import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUsers } from "../redux/slice/admin/userLoadSlice";

function AddDriverForm({ onSubmit }) {
  const { city, loading, success, error } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
     driverCode:null,
    password: "",
    confirmPassword: "",
    city: "",
    enabled: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if(!form.driverCode) newErrors.driverCode = "Driver Code is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.confirmPassword.trim()) newErrors.confirmPassword = "Confirm Password is required";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.city.trim()) newErrors.city = "City is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { confirmPassword, ...driverData } = form; // exclude confirmPassword
    onSubmit(driverData);
    setForm({
      name: "",
      email: "",
      driverCode:null,
      password: "",
      confirmPassword: "",
      city: "",
      enabled: false,
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Driver Name"
        className="px-3 py-2 border rounded-lg"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="px-3 py-2 border rounded-lg"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

         <input
        type="number"
        name="driverCode"
        value={form.driverCode}
        onChange={handleChange}
        placeholder="Driver Code"
        className="px-3 py-2 border rounded-lg"
      />
      {errors.driverCode && <p className="text-red-500 text-sm">{errors.driverCode}</p>}


      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="px-3 py-2 border rounded-lg"
      />
      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        className="px-3 py-2 border rounded-lg"
      />
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
      )}

      <div>
        <select
          value={form.city}
          name="city"
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 bg-white"
        >
          <option value="">Select City</option>
          {Array.isArray(city) && city.length > 0 ? (
            city.map((c) => (
              <option key={c.id} value={c.job}>
                {c.job}
              </option>
            ))
          ) : (
            <option disabled>No cities available</option>
          )}
        </select>

        {loading && (
          <div className="flex items-center mt-1">
            <svg className="animate-spin h-6 w-6 mr-2 text-purple-600" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-purple-600 font-medium">Loading cities...</p>
          </div>
        )}

        {error && <p className="text-red-500 mt-1">Error loading cities: {String(error)}</p>}

        {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="enabled"
          checked={form.enabled}
          onChange={handleChange}
        />
        <span>Enabled</span>
      </label>

      <button
        type="submit"
        className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
      >
        {loading ? "Adding Driver..." : "Add Driver"}
      </button>
    </form>
  );
}

export default AddDriverForm;
