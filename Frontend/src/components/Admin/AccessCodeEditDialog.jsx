import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { API_BASE_URL } from "../../config";

export default function AccessCodeEditDialog({ open, onClose, accessCode, onSave, saving = false }) {
  const [zip, setZip] = useState("");
  const [addr, setAddr] = useState("");
  const [code, setCode] = useState("");

  const existing = useMemo(() => {
    if (!accessCode) return [];
    return [accessCode.image_url1, accessCode.image_url2, accessCode.image_url3].filter(Boolean);
  }, [accessCode]);

  const [deleted, setDeleted] = useState(new Set());
  const [newFiles, setNewFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [fileInfo, setFileInfo] = useState("");

  useEffect(() => {
    if (accessCode) {
      setZip(accessCode.zip_code || "");
      setAddr(accessCode.address || "");
      setCode(accessCode.access_code || "");
      setDeleted(new Set());
      setNewFiles([]);
    }
  }, [accessCode]);

  const toggleDelete = (url) => {
    setDeleted((prev) => {
      const n = new Set(prev);
      if (n.has(url)) n.delete(url);
      else n.add(url);
      return n;
    });
  };

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const invalids = files.filter((f) => !allowed.includes(f.type));
    if (invalids.length > 0) {
      setFileError("Only JPEG, PNG, or WEBP images are allowed");
      return;
    }
    setFileError("");
    setFileInfo("");

    const keptCount = existing.filter((u) => !deleted.has(u)).length;
    if (keptCount >= 3) {
      if (files.length > 0) {
        setFileError("Already 3 images present. Remove one to add a new image.");
      }
      return;
    }
    const maxNew = Math.max(0, 3 - keptCount);
    let selected = files;
    if (files.length > maxNew) {
      selected = files.slice(0, maxNew);
      setFileInfo(`You can add only ${maxNew} image(s). Extra file(s) ignored.`);
    }
    setNewFiles(selected);
  };

  const handleSubmit = async () => {
    if (!zip || !addr || !code) return;
    const form = new FormData();
    form.append("id", String(accessCode.id));
    form.append("zip_code", zip.trim());
    form.append("address", addr.trim());
    form.append("access_code", code.trim());
    if (deleted.size > 0) form.append("deletedImages", JSON.stringify(Array.from(deleted)));
    newFiles.forEach((f) => form.append("images", f));
    await onSave?.(form);
  };

  const keptExisting = existing.filter((u) => !deleted.has(u));
  const totalAfter = keptExisting.length + newFiles.length;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl outline-1 -outline-offset-1 outline-gray-200 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
              <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">Edit Access Code</DialogTitle>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700">Zip Code</label>
                    <input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="12345 or 12345-6789"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700">Access Code</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Alphanumeric"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-sm text-gray-700">Address</label>
                    <input
                      value={addr}
                      onChange={(e) => setAddr(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Full address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Images</h4>
                    <span className={`text-xs ${totalAfter>3? 'text-red-600':'text-gray-500'}`}>Max 3 images</span>
                  </div>

                  {/* Existing images with delete toggles */}
                  {existing.length === 0 ? (
                    <p className="text-sm text-gray-500">No images for this access code.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {existing.map((u, idx) => {
                        const marked = deleted.has(u);
                        return (
                          <div key={idx} className={`relative rounded-lg overflow-hidden border ${marked? 'opacity-50': ''}`}>
                            <img src={`${API_BASE_URL}${u}`} alt={`Existing ${idx+1}`} className="w-full h-36 object-cover" />
                            <button
                              type="button"
                              onClick={() => toggleDelete(u)}
                              className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${marked? 'bg-yellow-500 text-white':'bg-red-500 text-white'}`}
                            >
                              {marked? 'Undo' : 'Delete'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* New uploads */}
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={onFilesChange}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg"
                    />
                    {fileError && <p className="text-xs text-red-600 mt-2">{fileError}</p>}
                    {fileInfo && <p className="text-xs text-gray-600 mt-2">{fileInfo}</p>}
                    {newFiles.length > 0 && (
                      <ul className="text-xs text-gray-600 list-disc pl-5 mt-2">
                        {newFiles.map((f, i) => (<li key={i}>{f.name}</li>))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="inline-flex w-full justify-center rounded-md bg-[#8200db] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7300c4] sm:ml-3 sm:w-auto disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
