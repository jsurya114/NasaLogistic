import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearPaginateTerms, getAdmins,toggleAvailAdmin,toggleAdminRole} from "../redux/slice/admin/userLoadSlice";
import Pagination from "./Pagination";
import { toast } from "react-toastify";

function AdminsList() {
  const dispatch = useDispatch();
  const { admins, loading: adminsLoad, error: adminsError, page, totalPages } = useSelector((state) => state.users);

  const { isSuperAdmin } = useSelector((state) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(clearPaginateTerms())
    dispatch(getAdmins({ page: currentPage }));
  }, [dispatch, currentPage]);

      function openConfirmToast(id, currentRole) {
      const newRole = currentRole === "admin" ? "superadmin" : "admin";
      toast(
        ({ closeToast }) => (
          <div>
            <p className="mb-2 text-sm">
              Change role from <b>{currentRole.toUpperCase()}</b> to{" "}
              <b>{newRole.toUpperCase()}</b>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  dispatch(toggleAdminRole( id))
                    .unwrap()
                    .then(() => {
                      toast.success(`Role updated to ${newRole.toUpperCase()} successfully!`);
                      closeToast();
                    })
                    .catch((err) => {
                      toast.error(`Failed to update role: ${err.message || err}`);
                      closeToast();
                    });
                }}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
              >
                Confirm
              </button>
              <button
                onClick={closeToast}
                className="px-3 py-1 border rounded hover:bg-gray-100 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        { autoClose: false } // keeps it open until user decides
      );
    }
  function handleToggleChange(id) {
    try {
      dispatch(toggleAvailAdmin(id));
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow p-4">
      <h2 className="font-bold text-lg mb-4">Administrators</h2>

      {!isSuperAdmin && (
        <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 font-semibold">
            Only super administrators can manage admin accounts.
          </p>
        </div>
      )}

      {isSuperAdmin && (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Sl No", "Name", "Email", "Role", "Status", "Actions","Promote/Demote"].map((head, i) => (
                  <th key={i} className="px-3 py-2 border-b border-gray-200">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminsLoad && admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500 font-medium">
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-6 w-6 mr-2 text-purple-600"
                        viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Loading admins...
                    </div>
                  </td>
                </tr>
              ) : admins.length > 0 ? (
                admins.map((a, i) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 border-b">{i + 1}</td>
                    <td className="px-3 py-2 border-b">{a.name}</td>
                    <td className="px-3 py-2 border-b">{a.email}</td>
                    <td className="px-3 py-2 border-b">
                      {a.role === "superadmin" ? (
                        <span className="text-blue-600 font-semibold">{a.role.toUpperCase()}</span>
                      ) : (
                        <span className="text-gray-700">{a.role.toUpperCase()}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b">
                      {a.is_active ? (
                        <span className="text-green-600">Enabled</span>
                      ) : (
                        <span className="text-red-600">Disabled</span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={a.is_active}
                          onChange={() => handleToggleChange(a.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                            a.is_active ? "bg-purple-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${
                              a.is_active ? "translate-x-5" : "translate-x-0.5"
                            } mt-0.5`}
                          ></div>
                        </div>
                      </label>
                    </td>
                    <td className="px-3 py-2 border-b">
                      {a.role === "admin" ? (
                        <button
                          onClick={() => a.is_active && openConfirmToast(a.id, a.role)}
                          disabled={!a.is_active}
                          className={`px-3 py-1 rounded text-xs text-white ${
                            a.is_active
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          ⏫ Promote
                        </button>
                      ) : (
                        <button
                          onClick={() => a.is_active && openConfirmToast(a.id, a.role)}
                          disabled={!a.is_active}
                          className={`px-3 py-1 rounded text-xs text-white ${
                            a.is_active
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          ⏬ Demote
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(pg) => setCurrentPage(pg)}
          />
        </>
      )}
    </section>
  );
}

export default AdminsList;

