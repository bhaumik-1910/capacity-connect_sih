import React from 'react';
import { useAuth } from '../../context/AuthContext';
import InstituteHeader from '../../components/InstituteHeader';
import StudentOnboardingManager from '../trainer/StudentOnboardingManager';

const InstituteStudents = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      <InstituteHeader
        title="Student Cohorts & Examination Records"
        subtitle="Manage institute trainee rosters, Excel batch onboarding, credentials issuing, and real-time examination performance."
        orgCode={user?.organizationCode || user?.organizationId?.code || 'INST'}
        badge="Accredited Trainee Registry"
      />
      <StudentOnboardingManager />
    </div>
  );
};

export default InstituteStudents;
