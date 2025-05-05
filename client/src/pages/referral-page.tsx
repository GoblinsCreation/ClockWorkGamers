import React from 'react';
import ReferralSystem from '@/components/referral/ReferralSystem';
import { ProtectedRoute } from '@/lib/protected-route';

function ReferralPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Referral Program</h1>
      <div className="max-w-4xl mx-auto">
        <ReferralSystem />
      </div>
    </div>
  );
}

// Wrap component with ProtectedRoute to ensure user is authenticated
export default function ProtectedReferralPage() {
  return <ProtectedRoute component={ReferralPage} />;
}