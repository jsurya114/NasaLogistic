
import {useState} from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
function AddAdminForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    cities:[],
  });
 const {loading,city,} = useSelector((state)=>state.users);
  const [errors, setErrors] = useState({});

     // Transform city data into react-select format
  const cityOptions = Array.isArray(city) 
    ? city.map(c => ({ 
        value: c.id,      // City ID
        label: c.job      // City name to display
      }))
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

    const handleCityChange = (selectedOptions) => {
    setForm({ ...form, cities: selectedOptions || [] });
    setErrors({ ...errors, cities: "" });
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
    if(form.role==='admin'){
      if (form.cities.length === 0)
      newErrors.cities = "At least one city must be selected";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

  

    const { confirmPassword, ...adminData } = form; // exclude confirmPassword
    onSubmit(adminData);
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      cities:[],
    });
    setErrors({});
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.cities ? '#ef4444' : state.isFocused ? '#9333ea' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #9333ea' : 'none',
      '&:hover': {
        borderColor: errors.cities ? '#ef4444' : '#9333ea',
      },
      padding: '2px',
      borderRadius: '0.5rem',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#f3e8ff',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#6b21a8',
      fontWeight: '500',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#6b21a8',
      ':hover': {
        backgroundColor: '#9333ea',
        color: 'white',
      },
    }),
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Admin Name"
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

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="px-3 py-2 border rounded-lg">
        <option value="admin">Admin</option>
        <option value="superadmin">Super Admin</option>
      </select>

       {/* Multi-select Cities with react-select */}
        {form.role==='admin' &&(<div className="flex flex-col gap-2">
       {/* <label className="text-sm font-medium text-gray-700">
          Select Cities *
        </label> */}
        <Select
          isMulti
          name="cities"
          value={form.cities}
          onChange={handleCityChange}
          options={cityOptions}
          isLoading={loading}
          placeholder="Select cities..."
          noOptionsMessage={() => "No cities available"}
          className="basic-multi-select"
          classNamePrefix="select"
          styles={customStyles}
          isDisabled={loading}
        />
        {errors.cities && <p className="text-red-500 text-sm">{errors.cities}</p>}
        
        {/* Show count of selected cities */}
        {form.cities.length > 0 && (
          <p className="text-sm text-gray-600">
            {form.cities.length} {form.cities.length === 1 ? 'city' : 'cities'} selected
          </p>
        )}
      </div>)}



      <button
        type="submit"
        className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800"
      >
        {loading ? 'Adding Admin' : 'Add Admin' }
      </button>
    </form>
  );
}

export default AddAdminForm;