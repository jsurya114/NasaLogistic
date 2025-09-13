import React from "react";
import logo from "../assets/logo.png"; // adjust path according to your folder structure

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-poppins">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
<div className="bg-[oklch(0.36_0.13_296.97)] rounded-t-2xl py-6 flex justify-center">
          <img src={logo} alt="Nasa Logistic Carriers Logo" className="w-44" />
        </div>

        <div className="px-10 py-6 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">Login</h2>
          <form>
            <div className="text-left mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="text-left mb-4">
              <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[oklch(0.36_0.13_296.97)] hover:bg-purple-900 text-white font-semibold py-3 rounded-lg shadow-md mt-4"
            >
              Login
            </button>
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
