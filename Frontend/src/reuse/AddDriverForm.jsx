import { useState,useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import { fetchJobs } from '../redux/slice/admin/jobSlice';

function AddDriverForm({ onSubmit }) {
    const cities=useSelector((state)=>state.jobs.cities);
    const dispatch=useDispatch();

    useEffect(()=>{
        dispatch(fetchJobs());        
        console.log("Cities are ",cities);
    },[dispatch]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    enabled: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.confirmPassword.trim())
      newErrors.confirmPassword = "Confirm Password is required";
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

      {/* <input
        type="text"
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="City"
        className="px-3 py-2 border rounded-lg"
      /> */}

      <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="px-3 py-2 border rounded-lg"
            >
            <option value="">-- Select City --</option>
            {cities.map((city) => (
                <option key={city.id} value={city.job}>
                {city.job}
                </option>
            ))}
            </select>
      {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

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
        Add Driver
      </button>
    </form>
  );
}
export default AddDriverForm