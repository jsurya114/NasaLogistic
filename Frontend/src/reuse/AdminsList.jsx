import {useState,useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdmins } from '../redux/slice/admin/userLoadSlice';


function AdminsList() {
  const dispatch = useDispatch();
  const {admins} = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getAdmins());
  }, [dispatch]);

  return (
    <section className="bg-white rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">Admins</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {["ID", "Name", "Email", "Role","Actions"].map((head, i) => (
              <th key={i} className="px-3 py-2 border-b border-gray-200">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {admins.length > 0 ? (
            admins.map((a,i) => (
              <tr key={a.id}>
                <td className="px-3 py-2 border-b">{a.i}</td>
                <td className="px-3 py-2 border-b">{a.name}</td>
                <td className="px-3 py-2 border-b">{a.email}</td>
                <td className="px-3 py-2 border-b">{a.role}</td>
                <td className="px-3 py-2 border-b">
                  <button>

                  </button>
                  <button>
                    
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No admins found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default AdminsList
