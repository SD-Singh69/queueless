import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function Customer() {
  const [searchParams] = useSearchParams();
  const shopIdFromUrl = searchParams.get("shopId");

  const [shopId, setShopId] = useState(shopIdFromUrl || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [activeToken, setActiveToken] = useState(null);
  const [etaDetails, setEtaDetails] = useState(null);

  // Auto-fill shop ID if opened via QR Code scan
  useEffect(() => {
    if (shopIdFromUrl) {
      setShopId(shopIdFromUrl);
    }
  }, [shopIdFromUrl]);

  // Poll active token details & ETA
  useEffect(() => {
    if (!activeToken?._id) return;

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/queue/status/${activeToken._id}`);
        setEtaDetails(res.data);
      } catch (err) {
        console.error("Error fetching token status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [activeToken]);

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/queue/join", {
        shopId,
        customerName: name,
        customerPhone: phone,
      });
      setActiveToken(res.data);
    } catch (err) {
      alert("Failed to join queue");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {!activeToken ? (
        <form
          onSubmit={handleJoin}
          className="bg-white p-6 rounded-xl shadow space-y-4"
        >
          <h2 className="text-xl font-bold">Join Queue</h2>
          {!shopIdFromUrl && (
            <div>
              <label className="block text-sm font-medium mb-1">Shop ID</label>
              <input
                type="text"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                required
                className="w-full border rounded p-2"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number (for SMS updates)
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold"
          >
            Get Token
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow text-center space-y-4">
          <span className="text-xs uppercase bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
            Your Token
          </span>
          <h1 className="text-5xl font-extrabold text-indigo-600">
            #{activeToken.tokenNumber}
          </h1>

          {etaDetails && (
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t text-left">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500">People Ahead</p>
                <p className="text-lg font-bold text-gray-800">
                  {etaDetails.aheadCount}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-500">Estimated Wait</p>
                <p className="text-lg font-bold text-indigo-600">
                  ~{etaDetails.estimatedWaitMinutes} mins
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
