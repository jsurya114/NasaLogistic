import React, { useState } from "react";
import logo from "../../assets/logo.png"; // adjust path according to your folder structure

import { useDispatch, useSelector } from 'react-redux'
import { adminLogin, clearError } from "../../redux/slice/admin/adminSlice.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" })

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.admin);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple frontend validation
    let errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    }

    // if errors exist, show toast and stop API call
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Object.values(errors).forEach((msg) => {
        toast.error(msg, {
          position: "top-right",
          autoClose: 3000,
        });
      });
      return; // 🚫 stop API call
    }

    try {
      const result = await dispatch(adminLogin({ email, password })).unwrap();

      if (result.admin) {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });
        console.log('login suc, navigate to dashboard')

      // ✅ Fixed
navigate("/admin/dashboard");

      }
    } catch (err) {
      if (err.status === 403 || err.errors?.general) {
        toast.error(err.errors?.general || "Your account has been blocked. Please contact support.", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      // backend validation or server error
      if (err.errors) {
        setFieldErrors({
          email: err.errors.email || "",
          password: err.errors.password || "",
        });
        Object.values(err.errors).forEach((msg) => {
          if (msg) {
            toast.error(msg, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        });
      } else {
        toast.error(err.message || "Login failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if(Object.keys(fieldErrors).length>0) console.log(fieldErrors)
  //     try {
  //       const result = await dispatch(adminLogin({ email, password })).unwrap();
  //       if (result.admin) {
  //         toast.success("Login successful!", {
  //           position: "top-right",
  //           autoClose: 3000,
  //           hideProgressBar: false,
  //           closeOnClick: false,
  //           pauseOnHover: true,
  //           draggable: false,
  //         });
  //         navigate("/admin/dashboard");
  //       }
  //     } catch (err) {
  //       if (err.errors) {
  //         setFieldErrors({
  //           email: err.errors.email || "",
  //           password: err.errors.password || "",
  //         });
  //       }
  //     }
  //   };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-poppins">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="bg-[oklch(0.36_0.13_296.97)] rounded-t-2xl py-6 flex justify-center">
          <img
            src={logo}
            alt="Nasa Logistic Carriers Logo"
            className="w-44"
          />
        </div>

        <div className="px-10 py-6 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="text-left mb-4">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" })); // clear email error
                }}

                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-sm">{fieldErrors.email}</p>
              )}
            </div>

            <div className="text-left mb-4">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: "" })); // clear password error
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              {fieldErrors.password && (
                <p className="text-red-600 text-sm">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[oklch(0.36_0.13_296.97)] hover:bg-purple-900 text-white font-semibold py-3 rounded-lg shadow-md mt-4"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>

          <div className="mt-4 text-sm">
            {/* <a href="#" className="text-purple-700 hover:underline">
              Forgot Password?
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
