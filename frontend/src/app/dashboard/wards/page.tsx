'use client';
import WardMap from '@/components/wards/WardMap';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useHMS } from '@/context/HMSContext';

export default function WardsPage() {
  const { user } = useHMS();
  return (
    <div className="font-body text-slate-800">
      <DashboardHeader
        title="Ward Management"
        userName={user?.staffProfile?.firstName ? `${user.staffProfile.firstName} ${user.staffProfile.lastName}` : 'Clinical Staff'}
        userRole="Ward Coordinator · Bed Management"
        avatarUrl={`https://ui-avatars.com/api/?name=${user?.staffProfile?.firstName ?? 'W'}+${user?.staffProfile?.lastName ?? 'C'}&background=6366f1&color=fff`}
      />
      <WardMap />
    </div>
  );
}
