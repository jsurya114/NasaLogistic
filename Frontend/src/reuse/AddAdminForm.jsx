
import {useState} from 'react';
import { useSelector } from 'react-redux';
function AddAdminForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
 const {loading} = useSelector((state)=>state.users);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
<<<<<<< Updated upstream
=======
    if(form.role==='admin'){
      if (form.cities.length === 0)
      newErrors.cities = "At least one city must be selected";
    }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
      cities:[],
>>>>>>> Stashed changes
    });
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