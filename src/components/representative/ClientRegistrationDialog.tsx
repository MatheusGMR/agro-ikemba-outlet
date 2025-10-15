import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ProgressiveClientRegistrationDialog from './ProgressiveClientRegistrationDialog';

export { ClientRegistrationDialog };

export default function ClientRegistrationDialog(props: any) {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
  
  if (!recaptchaSiteKey) {
    console.error('❌ VITE_RECAPTCHA_SITE_KEY não está configurado');
  }
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <ProgressiveClientRegistrationDialog {...props} />
    </GoogleReCaptchaProvider>
  );
}