import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllJourneys,
  updateJourney,
  clearJourneyError,
} from "../../redux/slice/driver/journeySlice.js";
import { toast } from "react-toastify";
import Header from "../../reuse/Header.jsx";
import Nav from "../../reuse/Nav.jsx";


const AdminJourney = () => {
      const { driver } = useSelector((state) => state.driver);
      console.log(driver)
  const dispatch = useDispatch();
  const { adminJourneys, adminStatus, adminError } = useSelector(
    (state) => state.journey
  );

  const [editableJourneyId, setEditableJourneyId] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch journeys only once
  useEffect(() => {
    dispatch(fetchAllJourneys());
  }, [dispatch]);

  // Show error toast if any
  useEffect(() => {
    if (adminError) {
      toast.error(adminError);
      dispatch(clearJourneyError());
    }
  }, [adminError, dispatch]);

  // Memoized handlers
  const handleEdit = useCallback((journey) => {
    setEditableJourneyId(journey.id);
    setFormData({
      start_seq: journey.start_seq,
      end_seq: journey.end_seq,
      route_id: journey.route_id,
    });
  }, []);

  const handleCancel = useCallback(() => {
    setEditableJourneyId(null);
    setFormData({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(
    async (id) => {
      try {
        await dispatch(updateJourney({ journey_id: id, updatedData: formData })).unwrap();
        toast.success("Journey updated successfully!");
        setEditableJourneyId(null);
      } catch (err) {
        toast.error(err.message || "Failed to update journey");
      }
    },
    [dispatch, formData]
  );

  // Memoize table rows
  const tableRows = useMemo(() => {
    if (adminStatus !== "succeeded") return null;

    return adminJourneys.map((journey) => (
      <tr key={journey.id} className="border-t">
        <td className="px-4 py-2">{driver?.name}</td>
        <td className="px-4 py-2">{journey.journey_date}</td>
        <td className="px-4 py-2">
          {editableJourneyId === journey.id ? (
            <input
              type="number"
              name="route_id"
              value={formData.route_id}
              onChange={handleChange}
              className="w-20 border rounded px-1 py-0.5"
            />
          ) : (
            journey.route_name
          )}
        </td>
        <td className="px-4 py-2 text-center">
          {editableJourneyId === journey.id ? (
            <input
              type="number"
              name="start_seq"
              value={formData.start_seq}
              onChange={handleChange}
              className="w-16 border rounded px-1 py-0.5"
            />
          ) : (
            journey.start_seq
          )}
        </td>
        <td className="px-4 py-2 text-center">
          {editableJourneyId === journey.id ? (
            <input
              type="number"
              name="end_seq"
              value={formData.end_seq}
              onChange={handleChange}
              className="w-16 border rounded px-1 py-0.5"
            />
          ) : (
            journey.end_seq
          )}
        </td>
        <td className="px-4 py-2 text-center">{journey.packages}</td>
        <td className="px-4 py-2 space-x-2 text-center">
          {editableJourneyId === journey.id ? (
            <>
              <button
                onClick={() => handleSave(journey.id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEdit(journey)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
        </td>
      </tr>
    ));
  }, [adminJourneys, adminStatus, editableJourneyId, formData, handleChange, handleEdit, handleCancel, handleSave]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins">
      <Header />

      <main className="max-w-[1450px] mx-auto p-4 pt-16 pb-40">
        <h1 className="text-2xl font-semibold mb-4">All Driver Journeys</h1>

        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Route</th>
                <th className="px-4 py-2">Start Seq</th>
                <th className="px-4 py-2">End Seq</th>
                <th className="px-4 py-2">Packages</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </main>

      <Nav />
    </div>
  );
};

export default AdminJourney;
