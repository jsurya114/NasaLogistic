import React,{useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { clearData } from '../redux/slice/admin/doublestopSlice';

const TempUploadedData = ({viewType,loadData}) => {

  console.log(viewType)
const dispatch = useDispatch();
const {data,loading,error} = useSelector((state) => state.ds);
console.log(data,'data in dailyyy')
  useEffect(() => {
    // dispatch(clearData());
    if(loadData)
    loadData();
  }, [loadData,dispatch]);
  // console.log(loadData,'loadData function')


  return (
      <section className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Dashboard Data</h2>
        <button
          onClick={loadData}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {[
              "SlNo",
              "Date",
              "Driver",
              "Driver Code",              
              "Route",
              // "Sequence",
              // "Packages",              
              "FS",
              "DS",
              "Total Deliveries",
              // "No Scanned",
              // "Failed Attempt",
            ].map((head, i) => (
              <th key={i} className="px-3 py-2 border-b border-gray-200">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.weeklyData?.length > 0 ? (
            data.weeklyData.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 border-b">{idx + 1}</td>
                <td className="px-3 py-2 border-b">{new Date(item.del_date).toLocaleDateString()}</td>
                <td className="px-3 py-2 border-b">
                  {item.courier_name}
                </td>
                <td className="px-3 py-2 border-b">{item.driver_id}</td>
                {/* <td className="px-3 py-2 border-b">{item.start_seq} - {item.end_seq}</td> */}
                <td className="px-3 py-2 border-b">{item.del_route}</td>                
                <td className="px-3 py-2 border-b">{item.fs}</td>
                <td className="px-3 py-2 border-b">{item.ds}</td>
                <td className="px-3 py-2 border-b">{item.total_deliveries}</td>
                {/* <td className="px-3 py-2 border-b">{item.failedattempt}</td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="text-center py-4 text-gray-500 align-middle"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default TempUploadedData
