import React, { useState } from "react";
import { getAccessToken } from '../../../utils/authToken';

const EmployeeReports = () => {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error("Missing access token");

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employee-reports`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: 'search_assigned_members', criteria: { searchTerm: searchInput } }),
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error("Error fetching employee reports:", error);
      alert("حدث خطأ أثناء البحث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">تقارير الموظف</h2>
      <input
        type="text"
        placeholder="رقم الهوية أو الجوال"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        بحث
      </button>

      {loading && <p className="mt-4">جاري التحميل...</p>}

      {!loading && results.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">النتائج:</h3>
          <ul>
            {results.map((item, index) => (
              <li key={index} className="border-b py-2">
                {JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmployeeReports;
