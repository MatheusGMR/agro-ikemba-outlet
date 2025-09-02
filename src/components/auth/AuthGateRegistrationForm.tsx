import React from 'react';
import { UnifiedRegistrationForm, UnifiedRegistrationData } from './UnifiedRegistrationForm';

interface AuthGateRegistrationFormProps {
  onSuccess: (data: UnifiedRegistrationData) => void;
  onSwitchToLogin: () => void;
}

export function AuthGateRegistrationForm({ 
  onSuccess, 
  onSwitchToLogin 
}: AuthGateRegistrationFormProps) {
  const handleSuccess = (data: UnifiedRegistrationData) => {
    // Switch to login mode after successful registration
    onSwitchToLogin();
    onSuccess(data);
  };

  return (
    <UnifiedRegistrationForm
      context="authgate"
      onSuccess={handleSuccess}
      className="space-y-6"
    />
  );
}