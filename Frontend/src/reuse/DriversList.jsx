import {useState,useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, toggleAvailUser } from '../redux/slice/admin/userLoadSlice';



function DriversList() {
  const dispatch = useDispatch();  
  const {drivers} = useSelector((state) => state.users);   

  useEffect(()=>{
    dispatch(getUsers());
    
  },[drivers]);

  function handleToggleChange(id){    
     try {
          dispatch(toggleAvailUser(id));
        } catch (err) {
          console.error("Failed to toggle status:", err);
        }
  }

  console.log("List of Drivers ",drivers);
  return (
    <section className="bg-white rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">Drivers</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {["Sl No","Driver Code", "Name", "Email", "City", "Status","Actions"].map(
              (head, i) => (
                <th key={i} className="px-3 py-2 border-b border-gray-200">
                  {head}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {drivers.length > 0 ? (
            drivers.map((d,i) => (
              <tr key={d.id}>
                <td className="px-3 py-2 border-b">{i+1}</td>
                <td className="px-3 py-2 border-b">{d.driver_code}</td>
                <td className="px-3 py-2 border-b">{d.name}</td>
                <td className="px-3 py-2 border-b">{d.email}</td>
                <td className="px-3 py-2 border-b">{d.job}</td>
                {/* <td className="px-3 py-2 border-b">{d.enabled ? "Active" : "Disabled"}</td> */}
                <td className="px-3 py-2 border-b">
                  {d.enabled ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-red-600">Disabled</span>
                  )}
                </td>
                <td className="px-3 py-2 border-b">
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={() => handleToggleChange(d.id)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      d.enabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${
                        d.enabled ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </label>
                  {/* <button
                    onClick={()=>console.log("Hello Hi")}
                    className="px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                  >
                    Delete
                  </button> */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No drivers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default DriversList;