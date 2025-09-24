import { NavLink } from "react-router-dom";


export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-900 font-poppins">
      <div className="text-center bg-white border border-gray-200 rounded-xl shadow-sm p-10 max-w-md">
        <h1 className="text-6xl font-bold text-purple-700">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        
            <NavLink to="/admin/dashboard"
                      className="mt-6 inline-block px-6 py-2 bg-purple-700 text-white rounded-lg shadow hover:bg-purple-800 transition"
>

          Go Home
</NavLink>
      </div>
    </div>
  );
}
