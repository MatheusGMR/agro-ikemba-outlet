import React from 'react';
import { HoneypotData } from '@/hooks/useBotProtection';

interface HoneypotFieldsProps {
  data: HoneypotData;
  onChange: (field: keyof HoneypotData, value: any) => void;
}

export const HoneypotFields: React.FC<HoneypotFieldsProps> = ({ data, onChange }) => {
  return (
    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
      {/* Hidden fields that bots might try to fill */}
      <input
        type="email"
        name="business_email"
        value={data.businessEmail || ''}
        onChange={(e) => onChange('businessEmail', e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input
        type="url"
        name="company_website"
        value={data.companyWebsite || ''}
        onChange={(e) => onChange('companyWebsite', e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input
        type="checkbox"
        name="marketing_consent"
        checked={data.marketingConsent || false}
        onChange={(e) => onChange('marketingConsent', e.target.checked)}
        tabIndex={-1}
        aria-hidden="true"
      />
      
      {/* CSS-only hidden fields for extra protection */}
      <style>{`
        input[name="business_email"],
        input[name="company_website"],
        input[name="marketing_consent"] {
          display: none !important;
          visibility: hidden !important;
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
          z-index: -1 !important;
        }
      `}</style>
    </div>
  );
};