import React,{useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';


const UploadedData = () => {
const dispatch = useDispatch();
  const {data} = useSelector((state) => state.users);

  useEffect(() => {
    // dispatch(fetchAdmins());
  }, [dispatch]);

  return (
    <section className="bg-white rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">Admins</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {["SlNo", "Driver","Job","Date","Sequence","Packages", "Deliveries", "DS","No Scanned", "Failed Attempt","Driver Payment","Closed","Paid"].map((head, i) => (
              <th key={i} className="px-3 py-2 border-b border-gray-200">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* {data.length > 0 ? (
            data.map((a) => (
              <tr key={a.id}>
                <td className="px-3 py-2 border-b">{a.id}</td>
                <td className="px-3 py-2 border-b">{a.name}</td>
                <td className="px-3 py-2 border-b">{a.email}</td>
                <td className="px-3 py-2 border-b">{a.role}</td>
              </tr>
            ))
          ) : ( */}
           <tr>
            <td colSpan="4" className="text-center py-4 text-gray-500 align-middle">
                No admins found
            </td>
            </tr>
         {/* )} */}
        </tbody>
      </table>
    </section>
  );
}

export default UploadedData
