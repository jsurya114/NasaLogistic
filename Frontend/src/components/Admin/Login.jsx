import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminLogin, clearError } from "../../redux/slice/admin/adminSlice.js";
import logo from "../../assets/logo.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.admin);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  // ✅ Clear global error on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ✅ Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // ✅ Memoized validation
  const validateForm = useCallback(() => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 3) {
      errors.password = "Password must be at least 3 characters";
    }

    return errors;
  }, [email, password]);

  // ✅ Memoized submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Frontend validation
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        // ✅ Show only the first error to avoid toast spam
        const firstError = Object.values(errors)[0];
        toast.error(firstError, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      try {
        const result = await dispatch(adminLogin({ email, password })).unwrap();

        if (result.admin) {
          toast.success("Login successful!", {
            position: "top-right",
            autoClose: 2000,
          });
          // Navigation handled by useEffect
        }
      } catch (err) {
        // ✅ Handle blocked account
        if (err.status === 403 || err.errors?.general) {
          toast.error(
            err.errors?.general || "Your account has been blocked. Please contact support.",
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
          return;
        }

        // ✅ Handle field-level validation errors
        if (err.errors) {
          setFieldErrors({
            email: err.errors.email || "",
            password: err.errors.password || "",
          });

          // Show only the first error
          const errorMessages = Object.values(err.errors).filter(Boolean);
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0], {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } else {
          // ✅ Handle general errors
          toast.error(err.message || "Login failed. Please try again.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    },
    [dispatch, email, password, validateForm]
  );

  // ✅ Memoized input change handlers
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setFieldErrors((prev) => ({ ...prev, email: "" }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    setFieldErrors((prev) => ({ ...prev, password: "" }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-poppins">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
        {/* Logo Section */}
        <div className="bg-[oklch(0.36_0.13_296.97)] rounded-t-2xl py-6 flex justify-center">
          <img
            src={logo}
            alt="Nasa Logistic Carriers Logo"
            className="w-44"
          />
        </div>

        {/* Form Section */}
        <div className="px-10 py-6 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">Login</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="text-left mb-4">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="text-left mb-4">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[oklch(0.36_0.13_296.97)] hover:bg-purple-900 text-white font-semibold py-3 rounded-lg shadow-md mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Global Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;