"use client";
import { useState } from 'react';
import { DollarSign, Check, X } from 'lucide-react';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([
    { id: 1, patient: 'John Doe', amount: 1250.00, type: 'Medicare', status: 'Pending' },
    { id: 2, patient: 'Jane Smith', amount: 450.00, type: 'Medicaid', status: 'Approved' },
  ]);

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-dash-navy tracking-tight mb-8">Claims Management</h2>
      <div className="grid gap-4">
        {claims.map((claim) => (
          <div key={claim.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${claim.type === 'Medicare' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                   <DollarSign size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-gray-800">{claim.patient}</h3>
                   <p className="text-gray-500 font-medium">{claim.type} • ${claim.amount.toFixed(2)}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  claim.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                  claim.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {claim.status}
                </span>
                {claim.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"><Check size={18} /></button>
                    <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"><X size={18} /></button>
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
