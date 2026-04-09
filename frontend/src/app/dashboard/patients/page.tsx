"use client";
import { useEffect, useState } from 'react';
import { UserPlus, Search, FileText, Loader2 } from 'lucide-react';
import { useHMSApi } from '@/hooks/useHMSApi';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const { callApi, loading } = useHMSApi();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await callApi('/patients');
        setPatients(data);
      } catch (err) {
        // Error handled by useHMSApi
      }
    };
    fetchPatients();
  }, []);


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-dash-navy tracking-tight">Patient Directory</h2>
        <button className="bg-dash-primary hover:bg-dash-secondary text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
          <UserPlus size={20} />
          Register Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 text-gray-400" size={20} />
             <input 
               type="text" 
               placeholder="Search patients by name or SSN..." 
               className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dash-primary"
             />
          </div>
        </div>

        <div className="relative overflow-x-auto min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-dash-primary" size={40} />
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Patient Name</th>
                <th className="px-6 py-4 font-medium">Date of Birth</th>
                <th className="px-6 py-4 font-medium">SSN</th>
                <th className="px-6 py-4 font-medium">Insurance Provider</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {patients.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                  No patients found in the registry.
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{p.firstName} {p.lastName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{p.id}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                    {p.ssnEncrypted || '*********'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {p.insuranceInfo || 'Self-Pay'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-dash-primary hover:text-dash-secondary font-bold text-sm flex items-center gap-1 transition-colors">
                       <FileText size={16} /> Patient Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
