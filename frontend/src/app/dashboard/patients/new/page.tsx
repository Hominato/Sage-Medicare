"use client";
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, ShieldCheck, HelpCircle, Check, ArrowLeft, 
  Lock, Loader2, Mail, Calendar, Phone, MapPin,
  Heart, Droplets, UserPlus, CreditCard, CheckCircle
} from 'lucide-react';
import { RoleContext } from '@/components/layout/DashboardLayout';
import { useHMSApi } from '@/hooks/useHMSApi';
import { useHMS } from '@/context/HMSContext';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

const GENOTYPES   = ['AA', 'AS', 'SS', 'AC', 'SC'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS      = ['Male', 'Female'];
const INSURANCE_TYPES = [
  { value: 'NHIS',           label: 'NHIS (National Health Insurance Scheme)', badge: 'Government' },
  { value: 'HMO',            label: 'HMO (Health Maintenance Organisation)',   badge: 'Employer' },
  { value: 'PRIVATE',        label: 'Private Insurance',                        badge: 'Premium' },
  { value: 'OUT_OF_POCKET',  label: 'Out of Pocket / Self-Pay',                badge: 'Self' },
  { value: 'MEDICARE',       label: 'Medicare / Medicaid',                      badge: 'Federal' },
];

export default function NewAdmissionPage() {
  const router = useRouter();
  const { callApi, loading } = useHMSApi();
  const { notify } = useHMS();
  const { role } = useContext(RoleContext);

  const [step, setStep]       = useState(1);
  const [payerType, setPayerType] = useState('NHIS');
  const [formData, setFormData] = useState({
    firstName:     '',
    lastName:      '',
    email:         '',
    phone:         '',
    dateOfBirth:   '',
    gender:        '',
    ssn:           '',
    nhisNumber:    '',
    bloodGroup:    '',
    genotype:      '',
    state:         '',
    lga:           '',
    nextOfKinName: '',
    nextOfKinPhone:'',
    insuranceInfo: 'NHIS'
  });

  if (role !== 'ADMIN' && role !== 'CLERK') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-white rounded-[3rem] shadow-sm border border-red-50 p-8 m-8">
        <Lock size={80} className="text-red-100 mb-6" />
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Access Restricted</h2>
        <p className="text-slate-500 font-medium text-lg max-w-xl mb-8 leading-relaxed italic">
          Patient registration requires <span className="text-primary font-black">Clerk</span> or <span className="text-primary font-black">Admin</span> clearance.
        </p>
      </div>
    );
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      notify('ERROR', 'Please complete all required identity fields (name, email, phone).');
      return;
    }
    if (!formData.dateOfBirth) {
      notify('ERROR', 'Date of birth is required for medical records.');
      return;
    }
    try {
      const result = await callApi('/patients', 'POST', {
        ...formData,
        insuranceInfo: payerType,
      });
      notify('SUCCESS', `${formData.firstName} ${formData.lastName} successfully registered.`);
      // Show temp password to clerk if backend returned one
      if (result?._temporaryPassword) {
        notify('INFO', `Temporary portal password: ${result._temporaryPassword} — communicate securely to patient.`);
      }
      router.push('/dashboard');
    } catch {}
  };

  const inputCls = "w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none";

  return (
    <div className="bg-[#f8f9fa] min-h-screen -m-8 p-8 font-body text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Patient Registration</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-500" /> Nigerian Standard · NHIS · NDPA Compliant
          </p>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase hover:text-slate-900 transition-all">
          <ArrowLeft size={16} /> Cancel
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { n: 1, label: 'Identity' },
          { n: 2, label: 'Clinical' },
          { n: 3, label: 'Insurance' },
          { n: 4, label: 'Next of Kin' },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
              step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > n ? <CheckCircle size={16} /> : n}
            </div>
            <span className={`text-xs font-black uppercase tracking-widest hidden md:block ${step === n ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
            {n < 4 && <div className="w-8 h-0.5 bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <User size={24} className="text-primary" /> Identity Registry
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal First Name *</label>
                  <input value={formData.firstName} onChange={set('firstName')} placeholder="e.g. Chukwuemeka" className={inputCls} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Last Name *</label>
                  <input value={formData.lastName} onChange={set('lastName')} placeholder="e.g. Okafor" className={inputCls} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="email" value={formData.email} onChange={set('email')} placeholder="patient@example.com" className={inputCls + ' pl-12'} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number (Nigerian) *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={formData.phone} onChange={set('phone')} placeholder="e.g. 08012345678" className={inputCls + ' pl-12'} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth *</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="date" value={formData.dateOfBirth} onChange={set('dateOfBirth')} className={inputCls + ' pl-12'} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender *</label>
                  <select value={formData.gender} onChange={set('gender')} className={inputCls}>
                    <option value="">Select gender...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State of Residence</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select value={formData.state} onChange={set('state')} className={inputCls + ' pl-12'}>
                      <option value="">Select state...</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">LGA (Local Government Area)</label>
                  <input value={formData.lga} onChange={set('lga')} placeholder="e.g. Surulere" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Clinical */}
          {step === 2 && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Heart size={24} className="text-rose-500" /> Clinical Profile
              </h2>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-bold text-amber-700">
                ⚠️ Blood Group and Genotype are critical for emergency care and Nigerian hospital compliance (NHIS requirement).
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blood Group *</label>
                  <select value={formData.bloodGroup} onChange={set('bloodGroup')} className={inputCls}>
                    <option value="">Select blood group...</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Genotype *</label>
                  <select value={formData.genotype} onChange={set('genotype')} className={inputCls}>
                    <option value="">Select genotype...</option>
                    {GENOTYPES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NHIS Number (National Health Insurance Scheme)</label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={formData.nhisNumber} onChange={set('nhisNumber')} placeholder="e.g. NHIS/001/234567" className={inputCls + ' pl-12'} />
                  </div>
                </div>
              </div>

              {/* Genotype alert */}
              {formData.genotype === 'SS' && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl">
                  <p className="text-rose-700 font-black text-sm flex items-center gap-2">
                    🚨 Sickle Cell Disease (SS) Detected — Flag for haematology review and counselling.
                  </p>
                </div>
              )}
              {formData.genotype === 'AS' && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-amber-700 font-black text-sm flex items-center gap-2">
                    ⚠️ Sickle Cell Trait (AS) — Note for genetic counselling if applicable.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Insurance */}
          {step === 3 && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck size={24} className="text-primary" /> Insurance & Payer Tier
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {INSURANCE_TYPES.map(ins => (
                  <div
                    key={ins.value}
                    onClick={() => setPayerType(ins.value)}
                    className={`cursor-pointer rounded-[2rem] p-5 border-2 flex items-center gap-5 transition-all ${
                      payerType === ins.value ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                      payerType === ins.value ? 'bg-primary' : 'bg-slate-100'
                    }`}>
                      {payerType === ins.value && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-900 text-sm">{ins.label}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      payerType === ins.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                    }`}>{ins.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Next of Kin */}
          {step === 4 && (
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <UserPlus size={24} className="text-primary" /> Next of Kin
              </h2>
              <p className="text-slate-500 text-sm font-medium">Required by Nigerian medical law for emergency notifications and consent.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Next of Kin Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={formData.nextOfKinName} onChange={set('nextOfKinName')} placeholder="e.g. Ngozi Okafor" className={inputCls + ' pl-12'} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Next of Kin Phone *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={formData.nextOfKinPhone} onChange={set('nextOfKinPhone')} placeholder="e.g. 08098765432" className={inputCls + ' pl-12'} required />
                  </div>
                </div>
              </div>

              {/* Summary card before submit */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-black text-slate-800 text-sm">Registration Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Name', value: `${formData.firstName} ${formData.lastName}` },
                    { label: 'Phone', value: formData.phone || '—' },
                    { label: 'Blood Group', value: formData.bloodGroup || '—' },
                    { label: 'Genotype', value: formData.genotype || '—' },
                    { label: 'State', value: formData.state || '—' },
                    { label: 'Insurance', value: payerType },
                    { label: 'NHIS No.', value: formData.nhisNumber || '—' },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="font-black text-slate-400 uppercase text-[9px] tracking-widest">{item.label}</span>
                      <span className="font-bold text-slate-800 mt-0.5">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step nav */}
          <div className="flex gap-4">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                ← Back
              </button>
            )}
            {step < 4 && (
              <button onClick={() => setStep(s => s + 1)} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                Continue →
              </button>
            )}
            {step === 4 && (
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-6 opacity-5"><ShieldCheck size={120} /></div>
            <h4 className="text-base font-black mb-1">Compliance Status</h4>
            <p className="text-slate-400 text-xs mb-8 italic">Data processed under NDPA & NHIS guidelines.</p>
            <div className="space-y-4">
              {[
                { label: 'NDPA Compliant', ok: true },
                { label: 'NHIS Fields', ok: !!formData.nhisNumber },
                { label: 'Blood Group', ok: !!formData.bloodGroup },
                { label: 'Genotype', ok: !!formData.genotype },
                { label: 'Next of Kin', ok: !!formData.nextOfKinName },
                { label: 'Gender', ok: !!formData.gender },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-xs font-bold border-b border-white/5 pb-3">
                  <span className="text-slate-500 uppercase tracking-widest">{item.label}</span>
                  <span className={item.ok ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-600 flex items-center gap-1'}>
                    <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {item.ok ? 'Complete' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-[3rem] p-8">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
              <HelpCircle size={20} />
            </div>
            <h4 className="font-black text-amber-900 mb-2">Sickle Cell Advisory</h4>
            <p className="text-xs text-amber-700/80 leading-relaxed font-bold italic">
              Nigerian NHIS mandates genotype registration at point of care. Couples with AS+AS or AS+SS combinations must be referred for genetic counselling.
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-[3rem] p-8">
            <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
              <CreditCard size={20} />
            </div>
            <h4 className="font-black text-sky-900 mb-2">NHIS Claim Alignment</h4>
            <p className="text-xs text-sky-700/80 leading-relaxed font-bold italic">
              Ensure the name matches NHIS records exactly to prevent automated claim rejections. NHIS enrolees enjoy 95% coverage on primary care consultations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
