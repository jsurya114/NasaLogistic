import {useState,useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, toggleAvailUser } from '../redux/slice/admin/userLoadSlice';
import Pagination from './Pagination';
import SearchBar from './Search';


function DriversList() {
  const dispatch = useDispatch();  
  const {drivers=[],loading:usersLoad,error:usersError,page,totalPages} = useSelector((state) => state.users);   
  const [searchTerm,setSearchTerm]=useState("");
  const [currentPage, setCurrentPage]=useState(1);

  useEffect(()=>{
    dispatch(getUsers({page:currentPage}));    
  },[dispatch,currentPage]);

  function handleToggleChange(id){    
     try {
          dispatch(toggleAvailUser(id));
        } catch (err) {
          console.error("Failed to toggle status:", err);
        }
  }
  return (
    <section className="bg-white rounded-xl shadow p-4">
      <SearchBar value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder={"Search Driver ..."}/>
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
        {usersLoad && drivers.length === 0 ? (
         <tr>
          <td colSpan="6" className="text-center py-4 text-gray-500 font-medium">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 mr-2 text-purple-600" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading users...
        </div>
      </td>
    </tr>
        ) : drivers.length > 0 ? (
          drivers.map((d, i) => (
            <tr key={d.id}>
              <td className="px-3 py-2 border-b">{i + 1}</td>
              <td className="px-3 py-2 border-b">{d.driver_code}</td>
              <td className="px-3 py-2 border-b">{d.name}</td>
              <td className="px-3 py-2 border-b">{d.email}</td>
              <td className="px-3 py-2 border-b">{d.job}</td>
              <td className="px-3 py-2 border-b">
                {d.enabled ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-red-600">Disabled</span>
                )}
              </td>
              <td className="px-3 py-2 border-b">
                <div className="flex items-center gap-10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={() => handleToggleChange(d.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                      d.enabled ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${
                        d.enabled ? "translate-x-5" : "translate-x-0.5"
                      } mt-0.5`}
                    ></div>
                  </div>
                </label>

                <button
                          onClick={()=>console.log("Hi")}
                          className="group relative px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                          title="Edit City"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        </div>
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

        <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(pg) => setCurrentPage(pg)}
      />

    </section>



  );
}

export default DriversList;