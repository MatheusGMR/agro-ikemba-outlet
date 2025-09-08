import { useLocation } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

export default function GlobalWhatsAppButton() {
  const location = useLocation();
  
  // Don't show WhatsApp button on landing page
  if (location.pathname === '/landing') {
    return null;
  }

  return <WhatsAppButton phoneNumber="43 984064141" />;
}