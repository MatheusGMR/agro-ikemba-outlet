import { UnifiedRegistrationForm } from './UnifiedRegistrationForm';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // User is now automatically signed in and redirected via AuthGate
    console.log('Registration completed successfully');
  };

  return (
    <UnifiedRegistrationForm
      context="main"
      showSuccessDialog={true}
      onSuccess={handleSuccess}
    />
  );
}