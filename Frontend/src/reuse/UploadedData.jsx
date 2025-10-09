import React,{useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { clearData, fetchDashboardData } from '../redux/slice/admin/doublestopSlice';

const UploadedData = ({viewType,loadData}) => {

  console.log(viewType)
const dispatch = useDispatch();
const {data,loading,error} = useSelector((state) => state.ds);

  useEffect(() => {
    if(!data||data?.weeklyData?.length===0){
      loadData()
    }
    // dispatch(clearData());
    // if(loadData)
    // loadData();
  }, [loadData]);

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
              "Driver",
              "Date",
              "Route",
              "Sequence",
              "Packages",
              "Deliveries",
              "DS",
              "No Scanned",
              "Failed Attempt",
            ].map((head, i) => (
              <th key={i} className="px-3 py-2 border-b border-gray-200">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.dailyData?.length > 0 ? (
            data.dailyData.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 border-b">{idx + 1}</td>
                <td className="px-3 py-2 border-b">{item.name}</td>
                <td className="px-3 py-2 border-b">
                   {new Date(item.journey_date).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 border-b">{item.route}</td>
                <td className="px-3 py-2 border-b">{item.sequence}</td>
                <td className="px-3 py-2 border-b">{item.packages}</td>
                <td className="px-3 py-2 border-b">{item.delivered}</td>
                <td className="px-3 py-2 border-b">{item.ds}</td>
                <td className="px-3 py-2 border-b">{item.no_scanned}</td>
                <td className="px-3 py-2 border-b">{item.failed_attempt}</td>
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

export default UploadedData
