import { UnifiedRegistrationForm } from './UnifiedRegistrationForm';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const navigate = useNavigate();

  return (
    <UnifiedRegistrationForm
      context="main"
      showSuccessDialog={true}
      onSuccess={() => {
        // Navigate to products page after successful registration
        setTimeout(() => navigate('/products'), 2000);
      }}
    />
  );
}